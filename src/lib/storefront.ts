// Storefront API client — server-side only (used in Route Handlers)
import { Cart } from '@/types/shopify';

const STORE = process.env.SHOPIFY_STORE_DOMAIN || 'qpd26f-qg.myshopify.com';
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const API_VERSION = '2024-01';
const ENDPOINT = `https://${STORE}/api/${API_VERSION}/graphql.json`;

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

export async function createCart(): Promise<Cart> {
  const { cartCreate } = await storefrontFetch<{ cartCreate: CartMutationPayload }>(`
    ${CART_FIELDS}
    mutation { cartCreate { cart { ...CartFields } userErrors { field message } } }
  `);
  return unwrapCart(cartCreate, 'cartCreate');
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const { cart } = await storefrontFetch<{ cart: Cart | null }>(`
    ${CART_FIELDS}
    query GetCart($cartId: ID!) { cart(id: $cartId) { ...CartFields } }
  `, { cartId });
  return cart;
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<Cart> {
  const { cartLinesAdd } = await storefrontFetch<{ cartLinesAdd: CartMutationPayload }>(`
    ${CART_FIELDS}
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { field message } }
    }
  `, { cartId, lines });
  return unwrapCart(cartLinesAdd, 'cartLinesAdd');
}

export async function updateCartLine(
  cartId: string,
  lines: { id: string; quantity: number }[]
): Promise<Cart> {
  const { cartLinesUpdate } = await storefrontFetch<{ cartLinesUpdate: CartMutationPayload }>(`
    ${CART_FIELDS}
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } userErrors { field message } }
    }
  `, { cartId, lines });
  return unwrapCart(cartLinesUpdate, 'cartLinesUpdate');
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  const { cartLinesRemove } = await storefrontFetch<{ cartLinesRemove: CartMutationPayload }>(`
    ${CART_FIELDS}
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } userErrors { field message } }
    }
  `, { cartId, lineIds });
  return unwrapCart(cartLinesRemove, 'cartLinesRemove');
}
