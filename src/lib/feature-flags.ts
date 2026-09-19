// One switch per conversion feature (18 Sep 2026), so any of them can be turned
// off in a one-line commit without unpicking the others — and so the owner can
// stage the rollout if he wants to tell their effects apart.
//
// The measurement events, the StickyATC pairing fix, the success-toast removal
// and the swipe-to-close fix are NOT flagged: they are corrections, not
// experiments.
//
// The dispatch promise has its own kill switch (DISPATCH_MODE in lib/dispatch.ts):
// PDP_DISPATCH = false removes the box; DISPATCH_MODE = 'safe' keeps the box but
// drops named days and countdowns.

export const FLAGS = {
  /** Cart: "Add AED X more to unlock free shipping" bar + shipping line in the footer */
  CART_BAR: true,
  /** Cart: "Make it a set" tumbler slider */
  CART_SLIDER: true,
  /** PDP: "270+ PangPang Cups sold in the UAE" */
  PDP_SOLD: true,
  /** PDP + cart: dispatch promise / countdown */
  PDP_DISPATCH: true,
  /** PDP: one verified customer quote under the buttons */
  PDP_QUOTE: true,
  /** PDP: "Buy it now" (drinkware only) */
  PDP_BUY_NOW: true,
  /**
   * Buy it now: "Apple Pay accepted at checkout" on iPhone, "Google Pay…" on
   * Android. ON because Ahmad confirmed (19 Sep 2026) both wallets are enabled
   * in his Stripe dashboard. If a wallet is ever switched off in Stripe, this
   * must go off in the same breath — the line would be a false claim.
   */
  PDP_WALLET_HINT: true,
  /** Mobile sticky bar: "Ships today — order within 02:14:09" */
  STICKY_DISPATCH: true,
} as const;
