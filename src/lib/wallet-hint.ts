// Which wallet to mention on the "Buy it now" button, by device.
//
// WHAT THIS IS — AND IS NOT
// Ahmad asked (19 Sep 2026) for the button to show Apple Pay on an iPhone and
// something else on a Samsung/Android. It cannot be a real wallet button here,
// and must not imitate one:
//   - this store's checkout runs on the "Stripe Card Payments" app + COD, not
//     Shopify Payments — Shopify reports `supportedDigitalWallets: []`, so there
//     is no one-tap Apple Pay / Google Pay sheet to open from a product page;
//     the wallets appear at Stripe's payment step, after address and shipping;
//   - Apple's and Google's brand rules reserve their pay BUTTONS for opening
//     that sheet. What they allow — and what is true here — is stating that the
//     wallet is ACCEPTED.
// So the button stays the store's own, and carries a device-aware ACCEPTANCE
// line. Ahmad confirmed both wallets are enabled in his Stripe dashboard. If
// that ever changes, FLAGS.PDP_WALLET_HINT goes off with it.
//
// Pure, so it is testable: pass the user agent in.

export type WalletHint = 'apple' | 'google' | null;

export function walletForDevice(
  ua: string,
  opts: { maxTouchPoints?: number; hasApplePaySession?: boolean } = {}
): WalletHint {
  // iPadOS 13+ reports itself as a Mac; a Mac with a touch screen is an iPad
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && (opts.maxTouchPoints ?? 0) > 1);
  if (isIOS) return 'apple';

  if (/Android/i.test(ua)) {
    // Huawei / Honor phones without Google services cannot use Google Pay —
    // naming it to them would be noise at best
    if (/Huawei|HarmonyOS|HMSCore|Honor/i.test(ua)) return null;
    return 'google';
  }

  // Desktop Safari on a Mac that actually has Apple Pay
  if (opts.hasApplePaySession && /Macintosh/i.test(ua) && /Safari/i.test(ua) && !/Chrome|Chromium|Edg|OPR/i.test(ua)) {
    return 'apple';
  }
  return null;
}
