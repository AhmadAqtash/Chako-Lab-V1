// "270+ PangPang Cups sold in the UAE" — real units, never an estimate.
//
// SOURCE: Shopify analytics on the live store — vendor 'Chako Lab' only, NET of
// returns, every channel (chakolab.ae and sundooq.me share one store, so a unit
// sold on either is a unit sold). The store ships to one zone, the UAE, so
// "sold in the UAE" is literal. To refresh (monthly is plenty), re-run this
// ShopifyQL, paste the rows below and bump `asOf`:
//
//   FROM sales SHOW net_items_sold WHERE product_vendor = 'Chako Lab'
//   GROUP BY product_type SINCE 2020-01-01 UNTIL -15d
//
// (`UNTIL -15d` so every counted unit is past the 15-day return window and the
// net figure can no longer fall. The first snapshot below was pulled UNTIL
// today — which is exactly why the cushion exists.)
//
// HONESTY RULES (Ahmad, 18 Sep 2026; hardened by the design review)
// - The published number is STRICTLY BELOW the real one: subtract a cushion,
//   then round down. Rounding down alone was not enough, for two reasons:
//     1. The figure is net of returns, so it can FALL. LinLin stood at exactly
//        180 — a single return would have made "180+" false.
//     2. Arabic has no neutral "+": «أكثر من 180» means strictly more than 180.
//        The Arabic claim must be exactly as true as the English one.
// - The sentence always NAMES the series. A bare "270+ sold" beside one
//   colourway's stars would be read as that colourway's sales.
// - A series below SERIES_MIN shows the brand-wide line instead. "13 sold" is
//   true but reads as a warning, and padding it would be a lie.
// - Types that lump unrelated products never get a per-series number:
//   'Tumbler' is Twist + Bawang Lite + Dual-Layer Ti + a titanium Bawang;
//   'Accessories' is stickers to heating pads. They get the brand line — so a
//   Bawang Lite page (typed 'Tumbler') never borrows the Bawang Cup count.
// - The brand line says "pieces", never "tumblers" or "bottles": the store
//   total includes 584 accessories. Do not swap in a drinkware word.

export const SALES_SNAPSHOT = {
  asOf: '2026-09-18',
  /** Every Chako Lab unit, accessories included — hence "pieces". */
  totalUnits: 1909,
  /** Series eligible for their own line, keyed by BASE productType. */
  byType: {
    'PangPang Cup': 283,
    'Bawang Cup': 275,
    'LinLin Kettle': 180,
    'Kada Bottle': 174,
    'Milk Pod': 89,
    'Thermos Cup': 86,
    'Food Cup': 44,
    'Pot': 21,
    'Teapot': 20,
    'Split Cup': 13,
    'Baba Cup': 11,
    'CarryGo Tumbler': 10,
    'Coffee Mug': 10,
    'Fruit Box': 9,
    'Square Cup': 5,
    'Lunch Box': 2,
    'Glass Cup': 1,
  } as Record<string, number>,
  // Deliberately absent from byType (see header): Tumbler 64, Accessories 584,
  // Cleaning Brush 22, Rope 5, Pouch 1. They are inside totalUnits.
} as const;

export const SERIES_MIN = 50;
/** Units held back so a return inside the 15-day window cannot falsify us. */
export const SOLD_CUSHION = 5;

/** Round DOWN to a number that reads well: tens below 1,000, hundreds above. */
export function floorNice(n: number): number {
  if (n < 10) return 0;
  const step = n >= 1000 ? 100 : 10;
  return Math.floor(n / step) * step;
}

/** The number we are willing to publish for a real count of `n`. */
export function publishable(n: number): number {
  return floorNice(n - SOLD_CUSHION);
}

export type SoldProof =
  | { kind: 'series'; count: number }
  | { kind: 'brand'; count: number };

/**
 * What to claim on a PDP of this BASE productType (never the localized one —
 * the Arabic type strings are inconsistent; see lib/shopify.ts).
 */
export function soldProof(baseType: string | null | undefined): SoldProof | null {
  const series = baseType ? SALES_SNAPSHOT.byType[baseType] : undefined;
  if (series !== undefined && series >= SERIES_MIN) {
    const count = publishable(series);
    if (count > 0) return { kind: 'series', count };
  }
  const brand = publishable(SALES_SNAPSHOT.totalUnits);
  return brand > 0 ? { kind: 'brand', count: brand } : null;
}
