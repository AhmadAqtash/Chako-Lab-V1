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

// ─── Predictions and discounts ────────────────────────────────────────────────
// unlocksWith PREDICTS a future cart by adding a CATALOGUE price. That is only
// true while nothing is discounted. With a 10% automatic discount live, a
// AED 152.10 cart + a AED 99 card "unlocks" on paper (251.10) — but the real
// cart lands at 241.20 and Shopify charges AED 25. A promise that breaks the
// moment it is acted on is the worst kind, and it would happen exactly during
// sale traffic. So predictions are SUPPRESSED, never scaled: a ratio taken from
// the current cart is a guess (the discount may be tiered, per-collection, or
// buy-X-get-Y).

/**
 * Set to true IN THE SAME DEPLOY that creates ANY Shopify automatic discount.
 * Covers what no cart can reveal: Buy it now from an empty cart, and min-spend
 * or buy-2 discounts that only trigger after the add.
 */
export const AUTOMATIC_DISCOUNT_LIVE = false;

/**
 * Is THIS cart discounted? Compares the basis with the cart's catalogue value
 * rather than total with subtotal, so it also catches LINE-level automatic
 * discounts — where subtotal and total are equal to each other.
 */
export function cartIsDiscounted(cart: {
  cost: Parameters<typeof shippingBasis>[0];
  lines: { nodes: { quantity: number; merchandise: { price: { amount: string } } }[] };
}): boolean {
  const catalogue = cart.lines.nodes.reduce(
    (sum, l) => sum + fils(parseFloat(l.merchandise.price.amount)) * l.quantity,
    0
  );
  return fils(shippingBasis(cart.cost)) < catalogue;
}

/** May the UI predict what an add will do to shipping? */
export function canPredictShipping(
  cart: Parameters<typeof cartIsDiscounted>[0] | null,
  discountLive: boolean = AUTOMATIC_DISCOUNT_LIVE
): boolean {
  return !discountLive && !(cart && cartIsDiscounted(cart));
}
