import { Product } from '@/types/shopify';
import { getMockProducts, getMockProduct } from './mock';
import { extractBaseName } from './utils';
import { SHOPIFY_API_VERSION } from './shopify-config';

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
};

export const ALL_COLLECTION_HANDLES = Object.keys(COLLECTION_DISPLAY_NAMES);

// ─── Storefront GraphQL client ────────────────────────────────────────────────

async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
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
  if (productType) parts.push(`product_type:'${productType}'`);
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

export async function getColorSiblings(
  productType: string,
  baseName: string
): Promise<Product[]> {
  const all = await getProducts({ first: 50, productType });
  return all.filter((p) => extractBaseName(p.title) === baseName);
}

export async function getRelatedProducts(
  productType: string,
  excludeHandles: string[]
): Promise<Product[]> {
  const all = await getProducts({ first: 20, productType });
  return all.filter((p) => !excludeHandles.includes(p.handle)).slice(0, 4);
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
  const all = await getProducts({ first: 100, language });
  return all.filter((p) => isTitaniumHandle(p.handle));
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
