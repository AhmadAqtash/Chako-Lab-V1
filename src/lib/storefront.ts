// Storefront API client — server-side only (used in Route Handlers)
import { Cart } from '@/types/shopify';
import { SHOPIFY_API_VERSION } from './shopify-config';

export type CartLanguage = 'EN' | 'AR';

const STORE = process.env.SHOPIFY_STORE_DOMAIN || 'qpd26f-qg.myshopify.com';
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const ENDPOINT = `https://${STORE}/api/${SHOPIFY_API_VERSION}/graphql.json`;

async function storefrontFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Storefront API ${res.status}: ${res.statusText}`);

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? 'GraphQL error');

  return json.data as T;
}

// ─── Cart fragments & queries ─────────────────────────────────────────────────

const CART_FIELDS = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    lines(first: 100) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            selectedOptions { name value }
            price { amount currencyCode }
            product {
              id
              handle
              title
              featuredImage { url altText width height }
            }
          }
        }
        cost { totalAmount { amount currencyCode } }
      }
    }
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
      totalTaxAmount { amount currencyCode }
    }
  }
`;

// Thrown when Shopify rejects a cart mutation (invalid variant, quantity, expired
// cart, …). Routes map this to a 4xx so the client can tell "your request was
// refused" apart from "Shopify is down".
export class CartUserError extends Error {}

// Marker message for "the main product itself is sold out" — the client maps
// this to a localized toast. Accessories never use it; they're just dropped.
export const PRIMARY_SOLD_OUT = 'PRIMARY_SOLD_OUT';

interface CartMutationPayload {
  cart: Cart | null;
  userErrors?: { field: string[] | null; message: string }[];
}

function unwrapCart(payload: CartMutationPayload | undefined, mutation: string): Cart {
  if (payload?.userErrors?.length) {
    throw new CartUserError(payload.userErrors.map((e) => e.message).join('; '));
  }
  if (!payload?.cart) {
    throw new CartUserError(`${mutation}: Shopify returned no cart`);
  }
  return payload.cart;
}

export async function createCart(language: CartLanguage = 'EN'): Promise<Cart> {
  const { cartCreate } = await storefrontFetch<{ cartCreate: CartMutationPayload }>(`
    ${CART_FIELDS}
    mutation CartCreate($language: LanguageCode!) @inContext(language: $language) {
      cartCreate { cart { ...CartFields } userErrors { field message } }
    }
  `, { language });
  return unwrapCart(cartCreate, 'cartCreate');
}

// Shopify + DENY inventory policy "succeeds" when asked to add an out-of-stock
// variant — it clamps the line to quantity 0 instead of erroring. Those ghost
// lines (qty 0, AED 0) confuse customers, so every read/write path prunes them.
// STRICTLY best-effort: the caller's mutation/read has already succeeded, so a
// prune failure (transient blip, or a concurrent tab removed the same line —
// Shopify errors INVALID_MERCHANDISE_LINE rather than no-opping) must never
// turn that success into an error. On failure the ghosts are hidden from this
// response in memory; a later read retries the actual removal.
async function pruneGhostLines(cart: Cart, language: CartLanguage): Promise<Cart> {
  const ghostIds = cart.lines.nodes.filter((l) => l.quantity === 0).map((l) => l.id);
  if (ghostIds.length === 0) return cart;
  try {
    return await removeCartLines(cart.id, ghostIds, language);
  } catch {
    return {
      ...cart,
      lines: { ...cart.lines, nodes: cart.lines.nodes.filter((l) => l.quantity > 0) },
    };
  }
}

export async function getCart(cartId: string, language: CartLanguage = 'EN'): Promise<Cart | null> {
  const { cart } = await storefrontFetch<{ cart: Cart | null }>(`
    ${CART_FIELDS}
    query GetCart($cartId: ID!, $language: LanguageCode!) @inContext(language: $language) {
      cart(id: $cartId) { ...CartFields }
    }
  `, { cartId, language });
  // Self-heal carts that picked up ghost lines before this guard existed
  return cart ? pruneGhostLines(cart, language) : null;
}

// Live availability for a set of variant ids. An id that resolves to null
// (deleted/archived variant) counts as unsellable. availableForSale alone is
// the signal: do NOT gate on quantityAvailable — untracked-inventory variants
// report 0 (not null) with availableForSale true, and CONTINUE-policy items
// are legitimately sellable at 0. Both would be falsely bricked by a
// quantity check, while DENY items already flip availableForSale at 0.
async function checkAvailability(
  merchandiseIds: string[],
  language: CartLanguage
): Promise<Map<string, { sellable: boolean; title: string }>> {
  const { nodes } = await storefrontFetch<{
    nodes: ({
      id: string;
      availableForSale: boolean;
      product: { title: string };
    } | null)[];
  }>(`
    query VariantAvailability($ids: [ID!]!, $language: LanguageCode!) @inContext(language: $language) {
      nodes(ids: $ids) {
        ... on ProductVariant {
          id
          availableForSale
          product { title }
        }
      }
    }
  `, { ids: merchandiseIds, language });

  const map = new Map<string, { sellable: boolean; title: string }>();
  merchandiseIds.forEach((id, i) => {
    const v = nodes[i];
    map.set(id, { sellable: !!v && v.availableForSale, title: v?.product.title ?? '' });
  });
  return map;
}

// Generic fallback when a rejected variant's title is unknowable (deleted or
// archived in admin) — the toast interpolates it into a localized sentence.
const fallbackItemName = (language: CartLanguage) => (language === 'AR' ? 'منتج' : 'an item');

// The PDP renders from ISR caches that can lag a stock change by ~a minute, so
// the add itself re-checks Shopify live. lines[0] is the product the customer
// actually clicked (AddToCartButton convention) — if IT is gone, the whole add
// fails with PRIMARY_SOLD_OUT rather than sneaking only accessories into the
// cart. Sold-out paired accessories are dropped from the add and returned in
// `rejected` (localized product titles) for the client to toast.
//
// Two layers, different jobs:
//  - pre-check (advisory, fail-open): catches known-OOS lines BEFORE mutating,
//    for clean errors without cart churn. If the check itself errors, assume
//    sellable — the mutation must stay the only hard dependency of an add.
//  - post-add clamp check (the hard gate): under DENY, cartLinesAdd reports
//    success but clamps an OOS line to quantity 0. Any requested line that
//    landed at 0 did NOT really get added — report it, never pretend success.
export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
  language: CartLanguage = 'EN'
): Promise<{ cart: Cart; rejected: string[] }> {
  let availability: Map<string, { sellable: boolean; title: string }> | null = null;
  try {
    availability = await checkAvailability(lines.map((l) => l.merchandiseId), language);
  } catch {
    // advisory only — fall through and let the mutation decide
  }

  let toAdd = lines;
  const rejected: string[] = [];
  if (availability) {
    if (!availability.get(lines[0].merchandiseId)?.sellable) {
      throw new CartUserError(PRIMARY_SOLD_OUT);
    }
    toAdd = lines.filter((l) => availability!.get(l.merchandiseId)?.sellable);
    for (const l of lines) {
      if (!availability.get(l.merchandiseId)?.sellable) {
        rejected.push(availability.get(l.merchandiseId)?.title || fallbackItemName(language));
      }
    }
  }

  const { cartLinesAdd } = await storefrontFetch<{ cartLinesAdd: CartMutationPayload }>(`
    ${CART_FIELDS}
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!, $language: LanguageCode!) @inContext(language: $language) {
      cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { field message } }
    }
  `, { cartId, lines: toAdd, language });
  const rawCart = unwrapCart(cartLinesAdd, 'cartLinesAdd');

  // Post-add truth: which requested lines were clamped to 0? (Merged lines
  // clamp against available stock, so quantity 0 always means "none to sell".)
  const requestedIds = new Set(toAdd.map((l) => l.merchandiseId));
  const clamped = rawCart.lines.nodes.filter(
    (l) => l.quantity === 0 && requestedIds.has(l.merchandise.id)
  );
  const cart = await pruneGhostLines(rawCart, language);

  if (clamped.some((l) => l.merchandise.id === lines[0].merchandiseId)) {
    // Sold out in the milliseconds between check and add. Any accessories
    // already landed stay in the cart (they're real, in-stock picks) — but
    // the add the customer asked for did not happen, and we say so.
    throw new CartUserError(PRIMARY_SOLD_OUT);
  }
  for (const l of clamped) {
    if (l.merchandise.id !== lines[0].merchandiseId) {
      rejected.push(l.merchandise.product.title || fallbackItemName(language));
    }
  }
  return { cart, rejected };
}

// A "+1" on a line whose stock just hit zero clamps the LINE to 0 (Shopify
// clamps against available stock, not the previous quantity), and the prune
// then removes it. Silently vanishing a line the customer was trying to
// increase is unacceptable — `removed` carries the titles so the client can
// explain. Pre-existing ghost lines healed by the same prune ride along too.
export async function updateCartLine(
  cartId: string,
  lines: { id: string; quantity: number }[],
  language: CartLanguage = 'EN'
): Promise<{ cart: Cart; removed: string[] }> {
  const { cartLinesUpdate } = await storefrontFetch<{ cartLinesUpdate: CartMutationPayload }>(`
    ${CART_FIELDS}
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!, $language: LanguageCode!) @inContext(language: $language) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { field message } }
    }
  `, { cartId, lines, language });
  const rawCart = unwrapCart(cartLinesUpdate, 'cartLinesUpdate');
  const removed = rawCart.lines.nodes
    .filter((l) => l.quantity === 0)
    .map((l) => l.merchandise.product.title || fallbackItemName(language));
  const cart = await pruneGhostLines(rawCart, language);
  return { cart, removed };
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[],
  language: CartLanguage = 'EN'
): Promise<Cart> {
  const { cartLinesRemove } = await storefrontFetch<{ cartLinesRemove: CartMutationPayload }>(`
    ${CART_FIELDS}
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!, $language: LanguageCode!) @inContext(language: $language) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } userErrors { field message } }
    }
  `, { cartId, lineIds, language });
  return unwrapCart(cartLinesRemove, 'cartLinesRemove');
}
