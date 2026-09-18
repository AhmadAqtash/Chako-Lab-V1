import { Product } from '@/types/shopify';
import { getMockProducts, getMockProduct } from './mock';
import { familyKey } from './family';
import { inStockFirst, isInStock } from './inventory';
import { ACCESSORY_BASE_TYPES, isAccessoryBaseType, looksLikeAccessory } from './accessory-types';
import { buildUpsellPool, type UpsellItem, type FamilyMap } from './cart-upsell';
import translations, { type TranslationKey } from './translations';
import { SHOPIFY_API_VERSION } from './shopify-config';

// Re-exported: the collection and home pages import it from here.
export { isAccessoryBaseType };

// ─── Config ───────────────────────────────────────────────────────────────────

const STORE = process.env.SHOPIFY_STORE_DOMAIN || 'qpd26f-qg.myshopify.com';
const TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
const ENDPOINT = `https://${STORE}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const VENDOR = 'Chako Lab';

// Demo mode: active when no token is set
export const IS_DEMO = !TOKEN;

// ─── Collection maps ──────────────────────────────────────────────────────────

export const PRODUCT_TYPE_TO_COLLECTION: Record<string, string> = {
  'LinLin Kettle': 'linlin-kettles',
  'Bawang Cup':    'bawang-cups',
  'Thermos Cup':   'bobo-tumblers',
  'Kada Bottle':   'kada-bottles',
  'Pot':           'pots',
  'Coffee Mug':    'mugs',
  'Milk Pod':      'milk-pods',
  'Food Cup':      'baobao-food-cups',
  'PangPang Cup':  'pangpang-cups',
  'Square Cup':    'square-cups',
  'Tumbler':       'tumbler',
  'Bobo Cup':      'bobo-cup',
  'Baobao Cup':    'baobao-cup',
  'Accessories':   'accessories',
  // Accessories under types of their own (lib/accessory-types.ts). Mapping
  // them here gives their PDPs the accessory story and a breadcrumb back to
  // the Accessories page instead of All Products.
  'Pouch':          'accessories',
  'Cleaning Brush': 'accessories',
  'Rope':           'accessories',
  'CarryGo Tumbler': 'carrygo-tumblers',
  'Split Cup':       'split-cups',
  // New families without their own series page yet — all land in the
  // 'more' catch-all so their PDP breadcrumbs link somewhere real
  'Baba Cup':      'more',
  'Glass Cup':     'more',
  'Teapot':        'more',
  'Fruit Box':     'more',
  'Lunch Box':     'more',
};

export const COLLECTION_HANDLE_TO_TYPE: Record<string, string> = {
  'linlin-kettles':    'LinLin Kettle',
  'bawang-cups':       'Bawang Cup',
  'bobo-tumblers':     'Thermos Cup',
  'kada-bottles':      'Kada Bottle',
  'pots':              'Pot',
  'mugs':              'Coffee Mug',
  'milk-pods':         'Milk Pod',
  'baobao-food-cups':  'Food Cup',
  'pangpang-cups':     'PangPang Cup',
  'square-cups':       'Square Cup',
  'tumbler':           'Tumbler',
  'bobo-cup':          'Bobo Cup',
  'baobao-cup':        'Baobao Cup',
  'accessories':       'Accessories',
  'carrygo-tumblers':  'CarryGo Tumbler',
  'split-cups':        'Split Cup',
};

export const COLLECTION_DISPLAY_NAMES: Record<string, string> = {
  'linlin-kettles':    'LinLin Kettles',
  'bawang-cups':       'Bawang Cups',
  'bobo-tumblers':     'BoBo Tumblers',
  'kada-bottles':      'Kada Bottles',
  'pots':              'Pots',
  'mugs':              'Mugs',
  'milk-pods':         'Milk Pods',
  'baobao-food-cups':  'Baobao Food Cups',
  'pangpang-cups':     'PangPang Cups',
  'square-cups':       'Square Cups',
  'tumbler':           'Tumblers',
  'bobo-cup':          'BoBo Cups',
  'baobao-cup':        'Baobao Food Cups',
  'accessories':       'Accessories',
  'carrygo-tumblers':  'CarryGo Tumblers',
  'split-cups':        'Split Cups',
  'more':              'More to Explore',
};

export const ALL_COLLECTION_HANDLES = Object.keys(COLLECTION_DISPLAY_NAMES);

// Base productTypes that would otherwise absorb a longer type sharing a token.
// Keyed by the type being queried → the types to subtract from the result.
const TYPE_EXCLUSIONS: Record<string, string[]> = {
  'Tumbler': ['CarryGo Tumbler'],
};

// ─── Families that belong on a collection their productType wouldn't reach ────
//
// Shopify types the Bawang Lite as a plain 'Tumbler', so it lands on
// /collections/tumbler and never on the Bawang page — but it IS a Bawang, just
// a different product from the steel/ceramic/titanium ones. Ahmad, 9 Sep 2026.
//
// Keyed on FAMILY, not on handles: a new Lite colourway appears on the Bawang
// page automatically, with no code edit. And this one map drives BOTH the
// collection listing and the PDP breadcrumb/label, so the two cannot drift
// apart — a customer who arrives from the Bawang page gets a breadcrumb back
// to it rather than being bounced to Tumblers.
//
// The product keeps its real productType, so it still appears on Tumblers too.
export const FAMILY_TO_COLLECTION: Record<string, string> = {
  'bawang-lite-tumbler-770ml': 'bawang-cups',
};

/**
 * Collection handle → the translation key holding its localized name.
 * COLLECTION_DISPLAY_NAMES is English-only; this is how /ar gets Arabic.
 * Lives here rather than in a route file because both the collection page and
 * the PDP breadcrumb need it.
 */
export const HANDLE_TO_CAT_KEY: Record<string, TranslationKey> = {
  'linlin-kettles':   'cat_linlin',
  'bawang-cups':      'cat_bawang',
  'bobo-tumblers':    'cat_bobo',
  'kada-bottles':     'cat_kada',
  'pots':             'cat_pots',
  'mugs':             'cat_mugs',
  'milk-pods':        'cat_milkpods',
  'baobao-food-cups': 'cat_baobao',
  'pangpang-cups':    'cat_pangpang',
  'square-cups':      'cat_square',
  'tumbler':          'cat_tumbler',
  'bobo-cup':         'cat_bobo_cup',
  'baobao-cup':       'cat_baobao',
  'accessories':      'cat_accessories',
  'carrygo-tumblers': 'cat_carrygo',
  'split-cups':       'cat_split',
};

/** Collection name in the caller's locale, falling back to the English map. */
export function collectionDisplayName(handle: string, language: ShopifyLanguage): string | null {
  const english = COLLECTION_DISPLAY_NAMES[handle] ?? null;
  if (language !== 'AR') return english;
  const key = HANDLE_TO_CAT_KEY[handle];
  return key ? translations.ar[key] : english;
}

// ─── Storefront GraphQL client ────────────────────────────────────────────────

async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  // Most catalogue reads want the default 60s. The family index overrides it:
  // it is one catalogue-wide sweep shared by every PDP, and product NAMES (all
  // it reads) change far less often than price or stock.
  revalidate = 60
): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`Storefront API ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  return json.data as T;
}

// ─── GraphQL fragments & queries ──────────────────────────────────────────────

const IMAGE_FIELDS = `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

const PRODUCT_CARD_FRAGMENT = `
  ${IMAGE_FIELDS}
  fragment ProductCard on Product {
    id
    handle
    title
    productType
    vendor
    tags
    availableForSale
    featuredImage { ...ImageFields }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantPrice { amount currencyCode }
    }
    variants(first: 1) {
      nodes {
        id
        availableForSale
        quantityAvailable
      }
    }
  }
`;

export type ShopifyLanguage = 'EN' | 'AR';

const PRODUCTS_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query GetProducts($first: Int!, $query: String, $language: LanguageCode!) @inContext(language: $language) {
    products(first: $first, sortKey: BEST_SELLING, query: $query) {
      nodes { ...ProductCard }
    }
  }
`;

const NEW_PRODUCTS_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query GetNewProducts($first: Int!, $query: String, $language: LanguageCode!) @inContext(language: $language) {
    products(first: $first, sortKey: CREATED_AT, reverse: true, query: $query) {
      nodes { ...ProductCard }
    }
  }
`;

const PRODUCT_DETAIL_QUERY = `
  ${IMAGE_FIELDS}
  query GetProduct($handle: String!, $language: LanguageCode!) @inContext(language: $language) {
    product(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      productType
      vendor
      tags
      availableForSale
      featuredImage { ...ImageFields }
      images(first: 20) { nodes { ...ImageFields } }
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      compareAtPriceRange {
        minVariantPrice { amount currencyCode }
      }
      variants(first: 100) {
        nodes {
          id
          title
          availableForSale
          quantityAvailable
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          selectedOptions { name value }
        }
      }
      options { name values }
      metafields(identifiers: [
        {namespace: "custom", key: "feature_1_title"},
        {namespace: "custom", key: "feature_1_desc"},
        {namespace: "custom", key: "feature_1_image"},
        {namespace: "custom", key: "feature_2_title"},
        {namespace: "custom", key: "feature_2_desc"},
        {namespace: "custom", key: "feature_2_image"},
        {namespace: "custom", key: "feature_3_title"},
        {namespace: "custom", key: "feature_3_desc"},
        {namespace: "custom", key: "feature_3_image"}
      ]) {
        key
        value
        reference {
          ... on MediaImage {
            image { url altText }
          }
        }
      }
    }
  }
`;
// ─── Public API ───────────────────────────────────────────────────────────────

export async function getProducts({
  first = 48,
  productType,
  query: extraQuery,
  language = 'EN',
}: {
  first?: number;
  productType?: string;
  query?: string;
  language?: ShopifyLanguage;
} = {}): Promise<Product[]> {
  if (IS_DEMO) {
    return getMockProducts({ first, productType, query: extraQuery });
  }

  const parts = [`vendor:'${VENDOR}'`];
  if (productType) {
    parts.push(`product_type:'${productType}'`);
    // Shopify's product_type: filter TERM-matches, it does not compare the
    // whole string — so a single-token type sweeps in every multi-token type
    // containing that token. 'Tumbler' was pulling all four 'CarryGo Tumbler'
    // products into /collections/tumbler and into the Twist related-products
    // rail. Negate them explicitly. Only single-token types are at risk; a
    // multi-token filter requires every token, so 'CarryGo Tumbler' does not
    // match plain 'Tumbler' in reverse.
    for (const excluded of TYPE_EXCLUSIONS[productType] ?? []) {
      parts.push(`-product_type:'${excluded}'`);
    }
  }
  if (extraQuery) parts.push(extraQuery);

  try {
    const data = await storefrontFetch<{ products: { nodes: Product[] } }>(
      PRODUCTS_QUERY,
      { first, query: parts.join(' AND '), language }
    );
    return data.products.nodes.filter((p) => p.vendor === VENDOR);
  } catch (err) {
    // Production (token set): never substitute the mock catalog — let callers
    // decide between an explicit error state and hiding the section.
    console.error('[Shopify] getProducts failed:', err);
    throw err;
  }
}

export async function getNewProducts(
  language: ShopifyLanguage = 'EN',
  first = 24,
): Promise<Product[]> {
  if (IS_DEMO) {
    return getMockProducts({ first });
  }
  try {
    const data = await storefrontFetch<{ products: { nodes: Product[] } }>(
      NEW_PRODUCTS_QUERY,
      { first, query: `vendor:'${VENDOR}'`, language }
    );
    return data.products.nodes.filter((p) => p.vendor === VENDOR);
  } catch (err) {
    console.error('[Shopify] getNewProducts failed:', err);
    throw err;
  }
}

export async function getProduct(handle: string, language: ShopifyLanguage = 'EN'): Promise<Product | null> {
  if (IS_DEMO) {
    return getMockProduct(handle);
  }

  try {
    const data = await storefrontFetch<{ product: Product | null }>(
      PRODUCT_DETAIL_QUERY,
      { handle, language }
    );
    const p = data.product;
    if (!p || p.vendor !== VENDOR) return null;
    return p;
  } catch (err) {
    // Rethrow instead of returning null/mock: a transient Shopify failure must
    // hit the error boundary, not 404 a real product (soft-404s get indexed).
    console.error('[Shopify] getProduct failed:', err);
    throw err;
  }
}

// Base (untranslated) productType. Under @inContext a product's own
// productType comes back localized, but Shopify search filters
// (product_type:'…') and our EN-keyed collection maps need the base value.
export async function getProductBaseType(handle: string): Promise<string | null> {
  if (IS_DEMO) {
    const p = await getMockProduct(handle);
    return p?.productType ?? null;
  }
  try {
    const data = await storefrontFetch<{ product: { productType: string } | null }>(
      `query GetProductBaseType($handle: String!) { product(handle: $handle) { productType } }`,
      { handle }
    );
    return data.product?.productType ?? null;
  } catch (err) {
    console.error('[Shopify] getProductBaseType failed:', err);
    return null;
  }
}

// ─── Product families ─────────────────────────────────────────────────────────
// One catalogue-wide index, built from an UN-CONTEXTUALIZED sweep so the family
// key is identical on /en and /ar (see lib/family.ts for why that matters).
//
// Deliberately NOT scoped by productType: Ahmad's finish rule puts Bawang
// Titanium Matte (productType 'Tumbler') and Bawang Ti Frosty (productType
// 'Bawang Cup') in one family, so a type-scoped fetch would silently lose half
// of it. 161 products fit comfortably in one first:250 page.

export interface FamilyMember {
  readonly gid: string;
  readonly handle: string;
}

const FAMILY_QUERY = `
  query FamilyIndex {
    products(first: 250, sortKey: BEST_SELLING, query: "vendor:'${VENDOR}'") {
      nodes { id handle title productType }
    }
  }
`;

/**
 * gid → family key, family key → its members, and gid → BASE productType.
 *
 * The base type matters as much as the family key: under @inContext a product's
 * productType comes back localized, and this catalogue's Arabic is unreliable —
 * "Accessories" is translated as إكسسوارات on most products but left as the
 * literal string "Accessories" on at least one, while Cleaning Brush and Rope
 * become فرشاة تنظيف and حبل. Any classification done on the localized value
 * silently misfiles products on /ar. This index is un-contextualized, so it is
 * the one place a caller can ask "what IS this" and get a stable answer.
 */
export async function getFamilyIndex(): Promise<{
  keyByGid: Map<string, string>;
  membersByKey: Map<string, FamilyMember[]>;
  baseTypeByGid: Map<string, string>;
}> {
  const keyByGid = new Map<string, string>();
  const membersByKey = new Map<string, FamilyMember[]>();
  const baseTypeByGid = new Map<string, string>();

  if (IS_DEMO) return { keyByGid, membersByKey, baseTypeByGid };

  try {
    const data = await storefrontFetch<{
      products: { nodes: { id: string; handle: string; title: string; productType: string }[] };
    }>(FAMILY_QUERY, {}, 600);

    for (const p of data.products.nodes) {
      const key = familyKey(p.id, p.title);
      keyByGid.set(p.id, key);
      baseTypeByGid.set(p.id, p.productType);
      if (!membersByKey.has(key)) membersByKey.set(key, []);
      membersByKey.get(key)!.push({ gid: p.id, handle: p.handle });
    }
  } catch (err) {
    // Best-effort: an empty index degrades every caller to "this product alone",
    // which is exactly the pre-family behaviour — never a broken page.
    console.error('[Shopify] getFamilyIndex failed:', err);
  }
  return { keyByGid, membersByKey, baseTypeByGid };
}

/** Every product in this one's family, itself included. Falls back to [self]. */
export async function getFamilyMembers(productGid: string, ownHandle: string): Promise<FamilyMember[]> {
  const { keyByGid, membersByKey } = await getFamilyIndex();
  const key = keyByGid.get(productGid);
  const members = key ? membersByKey.get(key) : null;
  return members?.length ? members : [{ gid: productGid, handle: ownHandle }];
}

/** This product's family key, or null if the index is unavailable. */
export async function getFamilyKeyFor(productGid: string): Promise<string | null> {
  const { keyByGid } = await getFamilyIndex();
  return keyByGid.get(productGid) ?? null;
}

/**
 * Guest products for a collection page: everything in the families that
 * FAMILY_TO_COLLECTION pins here. Empty when the collection has no guests.
 */
export async function getCollectionGuestProducts(
  collectionHandle: string,
  language: ShopifyLanguage = 'EN'
): Promise<Product[]> {
  const keys = Object.entries(FAMILY_TO_COLLECTION)
    .filter(([, handle]) => handle === collectionHandle)
    .map(([key]) => key);
  if (keys.length === 0) return [];

  const { membersByKey } = await getFamilyIndex();
  const ids = keys.flatMap((k) => (membersByKey.get(k) ?? []).map((m) => m.gid));
  if (ids.length === 0) return [];

  try {
    const data = await storefrontFetch<{ nodes: (Product | null)[] }>(SIBLINGS_QUERY, {
      ids,
      language,
    });
    return data.nodes.filter((p): p is Product => !!p && p.vendor === VENDOR);
  } catch (err) {
    // Best-effort: a guest fetch must never take down the collection page.
    console.error('[Shopify] getCollectionGuestProducts failed:', err);
    return [];
  }
}

const SIBLINGS_QUERY = `
  ${PRODUCT_CARD_FRAGMENT}
  query ColorSiblings($ids: [ID!]!, $language: LanguageCode!) @inContext(language: $language) {
    nodes(ids: $ids) { ... on Product { ...ProductCard } }
  }
`;

/**
 * The product's colourway siblings, for the PDP swatch row.
 *
 * Membership comes from the locale-stable family index; only the DISPLAY copy is
 * fetched in the caller's language. The previous implementation grouped on
 * localized titles, which fragmented the Arabic swatch row on 111 of 148 PDPs
 * because Shopify's AR titles are inconsistent per colourway (كأس vs كوب,
 * باوانج vs باوانغ, غلاية vs إبريق).
 */
export async function getColorSiblings(
  productGid: string,
  ownHandle: string,
  language: ShopifyLanguage = 'EN'
): Promise<Product[]> {
  const members = await getFamilyMembers(productGid, ownHandle);
  if (members.length < 2) return [];

  try {
    const data = await storefrontFetch<{ nodes: (Product | null)[] }>(SIBLINGS_QUERY, {
      ids: members.map((m) => m.gid),
      language,
    });
    return data.nodes.filter((p): p is Product => !!p && p.vendor === VENDOR);
  } catch (err) {
    console.error('[Shopify] getColorSiblings failed:', err);
    return [];
  }
}

const RELATED_LIMIT = 4;

export async function getRelatedProducts(
  productType: string,
  excludeHandles: string[],
  language: ShopifyLanguage = 'EN'
): Promise<Product[]> {
  // Sold-out siblings still belong here (they tell you the colourway exists),
  // but they don't belong FIRST — and with only 4 slots, an in-stock sibling
  // outranks one you can't buy.
  const sameType = inStockFirst(
    (await getProducts({ first: 20, productType, language }))
      .filter((p) => !excludeHandles.includes(p.handle))
  );
  const picked = sameType.slice(0, RELATED_LIMIT);
  if (picked.length >= RELATED_LIMIT) return picked;

  // Several families ARE one product in a few colourways (PangPang, BoBo,
  // Square Cup, Coffee Mug, Teapot...). Once the caller excludes the current
  // product and its colour siblings, nothing of the same type is left and the
  // section used to disappear entirely. Top up from the wider catalogue —
  // BEST_SELLING order, so the filler is genuinely worth recommending.
  // Accessories are skipped: the pairing carousel already sells those higher
  // up the same page. The extra fetch only happens when the type pool is thin.
  // Accessory test on the BASE type from the family index: the localized one
  // would let 'Pouch' (جراب on /ar) through as filler.
  const seen = new Set([...excludeHandles, ...picked.map((p) => p.handle)]);
  const [wider, { baseTypeByGid }] = await Promise.all([
    getProducts({ first: 24, language }).catch(() => []),
    getFamilyIndex(),
  ]);
  const eligible = wider.filter(
    (p) => !seen.has(p.handle) && !looksLikeAccessory(baseTypeByGid.get(p.id), p.productType)
  );
  // A same-type sibling is worth showing even when sold out (it tells you the
  // colourway exists), but arbitrary filler is not — in-stock first, and only
  // fall back to sold-out ones if there genuinely aren't enough.
  const filler = inStockFirst(eligible);
  return [...picked, ...filler.slice(0, RELATED_LIMIT - picked.length)];
}

// ─── Titanium (virtual cross-family collection) ───────────────────────────────
// Titanium products live under several productTypes (Milk Pod, Bawang Cup,
// Tumbler). We don't change the Shopify backend, so we identify them by title.
// They also remain in their own family collections.
export function isTitaniumHandle(handle: string): boolean {
  return /titanium|(^|-)ti(-|$)/i.test(handle);
}

export async function getTitaniumProducts(
  language: ShopifyLanguage = 'EN'
): Promise<Product[]> {
  // 250 (storefront max): the catalog passed 100 products — a lower cap
  // silently drops whatever sorts last, which included titanium items.
  const all = await getProducts({ first: 250, language });
  return all.filter((p) => isTitaniumHandle(p.handle));
}

// 'more' is a multi-type virtual collection: the newest product families that
// don't have a dedicated series page yet. Types are matched via search-query
// filters (product_type:'X' matches BASE values even under @inContext), so
// the list works on both locales. Retire entries as families earn real pages.
export const MORE_TYPES = ['Baba Cup', 'Glass Cup', 'Teapot', 'Fruit Box', 'Lunch Box'];

const anyOfTypes = (types: readonly string[]) =>
  `(${types.map((t) => `product_type:'${t}'`).join(' OR ')})`;

export async function getMoreProducts(language: ShopifyLanguage = 'EN'): Promise<Product[]> {
  return getProducts({ first: 250, query: anyOfTypes(MORE_TYPES), language });
}

// The Accessories page spans every accessory type (lib/accessory-types.ts),
// not just 'Accessories' — the Cup Pouches, brush and phone rope were missing
// from it. One OR'd query, so BEST_SELLING ranks them all together. The filter
// term-matches (see TYPE_EXCLUSIONS), so a future drinkware type containing
// the word 'Pouch' or 'Rope' would need excluding here.
export async function getAccessoryProducts(language: ShopifyLanguage = 'EN'): Promise<Product[]> {
  return getProducts({ first: 250, query: anyOfTypes(ACCESSORY_BASE_TYPES), language });
}

// Twist is a title-family, not a productType (the Twist Tumbler shares type
// 'Tumbler' with titanium products) — so the collection is handle-matched.
// Handles are locale-stable EN slugs, and every current + future Twist item
// (cups and their accessories) carries 'twist' in its handle.
export async function getTwistProducts(
  language: ShopifyLanguage = 'EN'
): Promise<Product[]> {
  const all = await getProducts({ first: 250, language });
  return all.filter((p) => /twist/i.test(p.handle));
}

// Slim accessory shape for the PDP pairing carousel — the full Product would
// bloat the RSC payload 26× over (descriptions, image arrays, variants).
export interface PairingItem {
  handle: string;
  title: string;
  price: { amount: string; currencyCode: string };
  image: string | null;
  variantId: string;
}

export interface PairingPool {
  /** 'Accessories'-typed add-ons: stickers, handles, straps, towels, pads… */
  accessories: PairingItem[];
  /** Cup Pouches — the PDP offers these only on the series they carry. */
  pouches: PairingItem[];
}

// In-stock carousel candidates, slimmed. Titles arrive localized via
// @inContext. Pouches come back separately so the PDP can place them by their
// Shopify type rather than guessing from handles. The brush and phone rope are
// accessories too, but stay out of the carousel (Ahmad, 17 Sep 2026).
export async function getPairingAccessories(
  language: ShopifyLanguage = 'EN'
): Promise<PairingPool> {
  const [accessories, pouches] = await Promise.all([
    getProducts({ first: 250, productType: 'Accessories', language }),
    // Best-effort: a pouch fetch failure must not take the whole carousel down.
    getProducts({ first: 50, productType: 'Pouch', language }).catch(() => []),
  ]);
  return { accessories: toPairingItems(accessories), pouches: toPairingItems(pouches) };
}

// Sold-out items are excluded — a checkbox that can't be added to cart is
// just friction.
function toPairingItems(products: Product[]): PairingItem[] {
  return products
    .map((p) => {
      // Catalog query fetches variants(first:1) without price — accessories
      // are single-variant, so priceRange.minVariantPrice IS the variant price.
      // availableForSale ONLY: gating on quantityAvailable falsely hides
      // untracked-inventory variants (they report 0, not null, while
      // availableForSale stays true) and CONTINUE-policy items.
      const variant = p.variants.nodes.find((v) => v.availableForSale);
      if (!variant) return null;
      return {
        handle: p.handle,
        title: p.title,
        price: p.priceRange.minVariantPrice,
        image: p.featuredImage?.url ?? null,
        variantId: variant.id,
      };
    })
    .filter((x): x is PairingItem => x !== null);
}

// ─── Cart "Make it a set" pool ────────────────────────────────────────────────
// Selection rules and the reasons for them live in lib/cart-upsell.ts.
export async function getCartUpsellPool(
  language: ShopifyLanguage = 'EN'
): Promise<{ items: UpsellItem[]; families: FamilyMap }> {
  if (IS_DEMO) return { items: [], families: {} };
  // first: 250 on purpose — byte-identical to the All Products query, so the
  // two share one cached Storefront response instead of costing a second one.
  const [products, { keyByGid, baseTypeByGid }] = await Promise.all([
    getProducts({ first: 250, language }),
    getFamilyIndex(),
  ]);
  // No index → no way to tell a tumbler from a sticker in Arabic. An empty
  // slider is a better failure than an accessory in a drinkware-only row.
  if (keyByGid.size === 0) return { items: [], families: {} };

  const isAccessory = (p: Product) => looksLikeAccessory(baseTypeByGid.get(p.id), p.productType);

  // Family of EVERY drinkware product, sold out or not: the client needs it to
  // know which families are already in the cart, and a cart line only carries
  // a localized title — lib/family.ts keys on the English one.
  const families: FamilyMap = {};
  for (const p of products) {
    if (!isAccessory(p)) families[p.id] = keyByGid.get(p.id) ?? p.handle;
  }

  const items = buildUpsellPool(products, {
    familyOf: (p) => keyByGid.get(p.id) ?? p.handle,
    isAccessory,
    inStock: isInStock,
    toItem: (p, familyKey) => {
      // One tap must be unambiguous. The card fragment fetches
      // variants(first:1); a price RANGE is the proxy for "there is a real
      // choice to make here", and such a product is sold on its own page.
      if (p.priceRange.minVariantPrice.amount !== p.priceRange.maxVariantPrice.amount) return null;
      const variant = p.variants.nodes.find((v) => v.availableForSale);
      if (!variant) return null;
      return {
        id: p.id,
        handle: p.handle,
        title: p.title,
        image: p.featuredImage?.url ?? null,
        price: p.priceRange.minVariantPrice,
        variantId: variant.id,
        familyKey,
      };
    },
  });
  return { items, families };
}

export async function searchProducts(query: string, language: ShopifyLanguage = 'EN'): Promise<Product[]> {
  if (!query.trim()) return [];

  if (IS_DEMO) {
    return getMockProducts({ query, first: 48 });
  }

  const parts = [`vendor:'${VENDOR}'`, `title:*${query}*`];
  try {
    const data = await storefrontFetch<{ products: { nodes: Product[] } }>(
      PRODUCTS_QUERY,
      { first: 48, query: parts.join(' AND '), language }
    );
    const results = data.products.nodes.filter((p) => p.vendor === VENDOR);
    if (results.length) return results;

    // Broaden: search by product type too
    const broadParts = [
      `vendor:'${VENDOR}'`,
      `(title:*${query}* OR product_type:*${query}*)`,
    ];
    const broad = await storefrontFetch<{ products: { nodes: Product[] } }>(
      PRODUCTS_QUERY,
      { first: 48, query: broadParts.join(' AND '), language }
    );
    return broad.products.nodes.filter((p) => p.vendor === VENDOR);
  } catch (err) {
    console.error('[Shopify] searchProducts failed:', err);
    throw err;
  }
}
