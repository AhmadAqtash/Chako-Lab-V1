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
// CAPABILITY, NOT JUST USER AGENT
// A wallet is only named when THIS BROWSER can actually present it — the same
// test Stripe's payment page runs. That makes the line self-correcting inside
// in-app browsers (57% of traffic arrives through Instagram's): an iPhone on
// iOS 16+ exposes ApplePaySession inside Instagram and keeps its line; an
// Android WebView whose host app has not enabled Payment Request exposes no
// `PaymentRequest`, so it falls back to the generic line instead of naming a
// wallet Stripe will not offer there. No block-list of app names to maintain,
// and if Meta enables it one day the line returns with no code change.
//
// Pure, so it is testable: the caller passes the user agent and capabilities in.

export type WalletHint = 'apple' | 'google' | null;

export interface WalletCapabilities {
  maxTouchPoints?: number;
  /** window.ApplePaySession exists AND canMakePayments() is true */
  hasApplePaySession?: boolean;
  /** typeof window.PaymentRequest === 'function' */
  hasPaymentRequest?: boolean;
}

export function walletForDevice(ua: string, caps: WalletCapabilities = {}): WalletHint {
  // Android FIRST. An unanchored iPad test matched the Chuwi "HiPad" Android
  // tablet and told it Apple Pay — the one mistake this module exists to avoid.
  const isAndroid = /Android/i.test(ua);
  // iPadOS 13+ reports itself as a Mac; a Mac with a touch screen is an iPad
  const isIOS =
    !isAndroid &&
    (/\b(iPhone|iPad|iPod)\b/.test(ua) || (/Macintosh/i.test(ua) && (caps.maxTouchPoints ?? 0) > 1));

  if (isIOS) return caps.hasApplePaySession ? 'apple' : null;

  if (isAndroid) {
    // Huawei / Honor phones without Google services cannot use Google Pay
    if (/Huawei|HarmonyOS|HMSCore|Honor/i.test(ua)) return null;
    return caps.hasPaymentRequest ? 'google' : null;
  }

  // Desktop Safari on a Mac that actually has Apple Pay
  if (caps.hasApplePaySession && /Macintosh/i.test(ua) && /Safari/i.test(ua) && !/Chrome|Chromium|Edg|OPR/i.test(ua)) {
    return 'apple';
  }
  return null;
}
