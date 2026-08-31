// "Find Your Chako" — resolving a quiz result to a LIVE product card.
//
// The result screen shows the site's real ProductCard, clickable through to
// the PDP. The brief banned PDP links because colourways sell out and a dead
// product page kills the conversion — so this module keeps that protection a
// different way: the product is fetched live from Shopify at result time and
// only an IN-STOCK colourway is ever shown (brief §8, "stock awareness"). If a
// whole family is sold out, we return null and the UI falls back to the
// collection CTA, which cannot die.
//
// The Q9 "look" answer picks WHICH in-stock colourway gets shown — that is the
// job the brief assigns Q9 ("primary job is selecting the colourway shown on
// the result card").
//
// Pure ranking logic is separated from the fetch so node --test exercises it
// directly (hence relative ./ imports with .ts extensions, no aliases).

import { SHOPIFY_API_VERSION } from '../shopify-config.ts';
import { isInStock } from '../inventory.ts';

// ─── The slim product the card needs ─────────────────────────────────────────

export interface QuizMatchProduct {
  readonly id: string;
  readonly handle: string;
  readonly title: string;
  readonly productType: string;
  readonly vendor: string;
  readonly availableForSale: boolean;
  readonly featuredImage: { url: string; altText: string | null } | null;
  readonly priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  readonly compareAtPriceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  readonly variants: { nodes: { id: string; availableForSale: boolean; quantityAvailable: number }[] };
}

// ─── Result → catalogue slice ────────────────────────────────────────────────
// `type` is the BASE productType (search filters match base values even under
// @inContext). include/exclude/prefer are tested against `title + handle`,
// which are stable English-y even when the display title is localised — handle
// slugs never translate.

interface MatchSpec {
  readonly type: string;
  readonly include?: RegExp;
  readonly exclude?: RegExp;
  /** Soft preference — outranks colour preference but never in-stock status. */
  readonly prefer?: RegExp;
}

const STEEL_ONLY = /ceramic|titanium|plastic|ppsu|(^|[\s-])ti([\s-]|$)/i;

export const MATCH_SPECS: Readonly<Record<string, MatchSpec>> = {
  'long-hauler':          { type: 'Bawang Cup', exclude: STEEL_ONLY },
  'daily-driver':         { type: 'Kada Bottle', include: /550ml/i, exclude: /ppsu|plastic/i },
  'cafe-ritualist-large': { type: 'Bawang Cup', include: /ceramic/i },
  'cafe-ritualist-small': { type: 'Milk Pod', include: /ceramic/i },
  // Twist shares base type 'Tumbler' with other tumblers (and the term-matching
  // filter will also pull CarryGo Tumbler in) — the include narrows it back.
  'switch-up':            { type: 'Tumbler', include: /twist/i, exclude: /handle/i },
  reservoir:              { type: 'Baba Cup', prefer: /1180/i },
  'desk-setter-ceramic':  { type: 'Thermos Cup', include: /ceramic/i },
  brewer:                 { type: 'PangPang Cup' },
  'pocket-pod':           { type: 'Milk Pod', exclude: STEEL_ONLY },
  'desk-setter':          { type: 'Thermos Cup', exclude: /ceramic|plastic/i },
  // The Featherweight copy says to start with the MilkPod Titanium — the one
  // where the weight difference is most obvious in the hand.
  featherweight:          { type: 'Milk Pod', include: /titanium/i },
  host:                   { type: 'LinLin Kettle', exclude: /strap/i },
  'sensible-one':         { type: 'Kada Bottle', include: /ppsu|plastic/i },
  'one-hander':           { type: 'CarryGo Tumbler' },
  'straw-purist':         { type: 'Split Cup' },
  'little-one-ppsu':      { type: 'Kada Bottle', include: /ppsu/i },
  'little-one-steel':     { type: 'Kada Bottle', include: /550ml/i, exclude: /ppsu|plastic/i },
  'little-one-milkpod':   { type: 'Milk Pod', exclude: STEEL_ONLY },
};

// ─── Q9 → colourway keywords ─────────────────────────────────────────────────
// Matched against title + handle. Colour names live in the title parenthetical
// ("Pink & Purple") and the handle slug, both locale-stable enough to test.

export type LookPref = 'loud' | 'pastel' | 'neutral' | 'metallic';

const LOOK_RES: Readonly<Record<LookPref, RegExp>> = {
  loud: /yellow|orange|red|purple|green|blue/i,
  pastel: /pink|mint|cream|vanilla|taro|peach|lilac|melon|rose/i,
  neutral: /white|grey|gray|silver|black/i,
  metallic: /silver|titanium|frosty|black/i,
};

// ─── Pure ranking ────────────────────────────────────────────────────────────

interface Rankable {
  readonly handle: string;
  readonly title: string;
  readonly availableForSale?: boolean;
  readonly variants?: { nodes: { availableForSale: boolean }[] };
}

/**
 * In-stock candidates for a result, best first. Sold-out products are DROPPED,
 * not just demoted — the whole point of fetching live is never to hand someone
 * a card they cannot buy. Empty array = show the collection CTA instead.
 */
export function rankMatches<T extends Rankable>(
  resultId: string,
  products: readonly T[],
  look?: LookPref | null
): T[] {
  const spec = MATCH_SPECS[resultId];
  if (!spec) return [];
  const lookRe = look ? LOOK_RES[look] : null;

  return products
    .map((p, i) => ({ p, i, text: `${p.title} ${p.handle}` }))
    .filter(({ p, text }) => {
      if (!isInStock(p)) return false;
      if (spec.include && !spec.include.test(text)) return false;
      if (spec.exclude && spec.exclude.test(text)) return false;
      return true;
    })
    .map((x) => ({
      ...x,
      // prefer outranks colour; both outrank nothing; BEST_SELLING order (the
      // incoming index) breaks every tie so the ranking stays deterministic.
      score: (spec.prefer?.test(x.text) ? 4 : 0) + (lookRe?.test(x.text) ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((x) => x.p);
}

// ─── Live fetch (client-side, same pattern as HotCategories) ─────────────────

const MATCH_GQL = `
  query QuizMatch($first: Int!, $query: String!, $language: LanguageCode!) @inContext(language: $language) {
    products(first: $first, sortKey: BEST_SELLING, query: $query) {
      nodes {
        id handle title productType vendor availableForSale
        featuredImage { url altText }
        priceRange {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
        compareAtPriceRange { minVariantPrice { amount currencyCode } }
        variants(first: 1) { nodes { id availableForSale quantityAvailable } }
      }
    }
  }
`;

export async function fetchQuizMatch(
  resultId: string,
  look: LookPref | null,
  isAr: boolean
): Promise<QuizMatchProduct | null> {
  const spec = MATCH_SPECS[resultId];
  const store = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!spec || !store || !token) return null;

  try {
    const res = await fetch(`https://${store}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({
        query: MATCH_GQL,
        variables: {
          first: 40,
          query: `vendor:'Chako Lab' AND product_type:'${spec.type}'`,
          language: isAr ? 'AR' : 'EN',
        },
      }),
    });
    const data = await res.json();
    const nodes = (data.data?.products?.nodes ?? []) as QuizMatchProduct[];
    return rankMatches(resultId, nodes, look)[0] ?? null;
  } catch {
    // A failed fetch must never break the result screen — the collection CTA
    // is the fallback, and it always works.
    return null;
  }
}
