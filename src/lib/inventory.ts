// Stock-aware ordering.
//
// WHY THIS EXISTS
// Every catalogue query on the site is sorted `BEST_SELLING`. Best sellers are
// by definition the products that sell out first, so BEST_SELLING is
// structurally an OUT-OF-STOCK-FIRST sort: the better something sells, the
// faster it empties and the longer it stays pinned to slot 1. Measured on the
// live catalogue (161 products, 22 sold out): the homepage Featured row led
// with a sold-out sticker, four of the eight visible Bawang cards were
// unbuyable, and All Products put sold-out items at #1, 9, 11, 12, 13 and 16.
//
// Shopify cannot fix this for us:
//   - there is no in-stock-first sortKey on the Storefront API, and
//   - the `available_for_sale:` search filter is broken — `:true` and `:false`
//     return byte-identical result sets (verified against this store), so its
//     value is simply ignored.
// Hence: we partition in our own code.

interface StockShape {
  /** Shopify's own roll-up across every variant. Absent on the mock catalogue. */
  availableForSale?: boolean;
  variants?: { nodes: { availableForSale: boolean }[] };
}

export function isInStock(p: StockShape): boolean {
  // Product.availableForSale is authoritative and variant-count-proof. Prefer
  // it over scanning variants: the card fragment only fetches variants(first:1),
  // which would lie the day a product gains size/variant options.
  if (typeof p.availableForSale === 'boolean') return p.availableForSale;
  const variants = p.variants?.nodes;
  // Fail OPEN. An unrecognised shape must never bury a sellable product or
  // suppress its Add to Cart — the sold-out signal is always one of the two
  // checks above, so "unknown" means "don't interfere".
  if (!variants?.length) return true;
  return variants.some((v) => v.availableForSale);
}

/**
 * Sold-out products move to the end; everything else keeps the order it
 * arrived in.
 *
 * Deliberately a two-pass partition rather than `Array.sort` with a comparator:
 * relative order inside each group is preserved by construction, not by relying
 * on sort stability. That is what makes restocking self-healing — an item that
 * comes back in stock silently returns to its exact former BEST_SELLING rank,
 * with no stored state and nothing to reset.
 *
 * NOTE: this reorders the array it is given, so it can only demote products
 * inside the fetched window. Callers that display fewer items than they fetch
 * (homepage rails) must fetch wider than they show, or demotion just shuffles
 * the sold-out card to the last visible slot instead of off the rail.
 */
export function inStockFirst<T extends StockShape>(products: T[]): T[] {
  const available: T[] = [];
  const soldOut: T[] = [];
  for (const p of products) (isInStock(p) ? available : soldOut).push(p);
  return [...available, ...soldOut];
}
