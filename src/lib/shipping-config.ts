// The store's shipping rates, as enforced by the Shopify delivery profile
// (verified 20 Aug 2026): ONE zone (UAE), free at order total >= AED 250,
// otherwise AED 25 flat. No express rate, no second tier.
//
// Import-free so client components can use it. If the Shopify rates change,
// change these in the SAME commit as /pages/shipping and the translations
// that spell the numbers out (announce_1, product_free_shipping_sub,
// product_ship_cost_*).

export const FREE_SHIPPING_THRESHOLD = 250;
export const FLAT_SHIPPING_FEE = 25;
export const SHOP_CURRENCY = 'AED';

/**
 * Until Ahmad confirms catalogue prices are VAT-inclusive, the cart keeps its
 * "Taxes calculated at checkout" line. Flip to true and the line disappears.
 */
export const PRICES_INCLUDE_VAT = false;

const THRESHOLD_FILS = FREE_SHIPPING_THRESHOLD * 100;
const fils = (amount: number) => (Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : 0);

/**
 * The amount the free-shipping rule should be judged on. The LOWER of subtotal
 * and total: a cart-level or automatic discount lowers `total`, and judging on
 * the undiscounted subtotal would announce "unlocked" on a cart Shopify will
 * still charge AED 25 for. (A code typed later at Shopify checkout is invisible
 * to this cart — which is why the footer always says "after discounts".)
 */
export function shippingBasis(cost: {
  subtotalAmount: { amount: string };
  totalAmount?: { amount: string } | null;
}): number {
  const subtotal = parseFloat(cost.subtotalAmount.amount);
  const total = cost.totalAmount ? parseFloat(cost.totalAmount.amount) : NaN;
  const safeSub = Number.isFinite(subtotal) ? subtotal : 0;
  return Number.isFinite(total) && total > 0 ? Math.min(safeSub, total) : safeSub;
}

export interface FreeShippingProgress {
  /** Whole AED still needed; 0 once unlocked. Rounded UP — never under-ask. */
  remaining: number;
  unlocked: boolean;
  /** 0–1 for the bar. */
  ratio: number;
}

// Integer fils throughout: 249.995 must not float its way over the line, and
// exactly 250.00 IS free (Shopify's rule is >=).
export function freeShippingProgress(basis: number): FreeShippingProgress {
  const f = fils(basis);
  const unlocked = f >= THRESHOLD_FILS;
  return {
    unlocked,
    remaining: unlocked ? 0 : Math.ceil((THRESHOLD_FILS - f) / 100),
    ratio: Math.min(1, f / THRESHOLD_FILS),
  };
}

/** Would adding something priced `price` take a cart at `basis` over the line? */
export function unlocksWith(basis: number, price: number): boolean {
  return fils(basis) + fils(price) >= THRESHOLD_FILS;
}
