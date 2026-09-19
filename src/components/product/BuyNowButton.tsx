'use client';

import { useEffect, useState } from 'react';
import { Loader2, Check, Wallet, ShieldCheck } from 'lucide-react';
import { useCart, type CartLineInput } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { fill } from '@/components/ui/fill';
import { formatPrice, cn } from '@/lib/utils';
import {
  shippingBasis, unlocksWith, canPredictShipping, FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_FEE, SHOP_CURRENCY,
} from '@/lib/shipping-config';
import { walletForDevice, type WalletHint } from '@/lib/wallet-hint';
import { FLAGS } from '@/lib/feature-flags';

interface Props {
  variantId: string;
  quantity: number;
  /** Ticked pairing accessories — they ride along exactly as with Add to Cart */
  extraLines: CartLineInput[];
  /** unit price x quantity + ticked accessories, in AED */
  selectionTotal: number;
}

const money = (amount: number) => formatPrice({ amount: String(amount), currencyCode: SHOP_CURRENCY });

/**
 * "Buy it now" — SECONDARY on purpose. Add to Cart already opens a drawer with
 * a pinned Checkout button, so this saves exactly one tap, and it skips the
 * free-shipping bar and the set slider. It must never out-shout the primary.
 *
 * Because this path skips the cart, what the cart would have disclosed is
 * disclosed HERE, under the button, in the same two strings the cart uses:
 *   line 1 — the shipping outcome for (cart + this selection), so nobody meets
 *            AED 25 for the first time at checkout;
 *   line 2 — that what is already in the cart goes along.
 * Two lines are always reserved, so nothing below shifts when the cart loads.
 */
export default function BuyNowButton({ variantId, quantity, extraLines, selectionTotal }: Props) {
  const { buyNow, cart, cartReady, isLoading } = useCart();
  const { t } = useLanguage();
  const [going, setGoing] = useState(false);

  // Device-aware wallet line (see lib/wallet-hint.ts for what it may claim).
  // Resolved after mount: the server cannot know the device, and the generic
  // line holds the same height, so nothing shifts when it swaps.
  const [wallet, setWallet] = useState<WalletHint>(null);
  useEffect(() => {
    // The same capability tests Stripe's payment page runs — so a wallet is
    // only named where the browser can actually present it (lib/wallet-hint.ts).
    let hasApplePaySession = false;
    let hasPaymentRequest = false;
    try {
      const AP = (window as unknown as { ApplePaySession?: { canMakePayments?: () => boolean } }).ApplePaySession;
      // canMakePayments() is synchronous and needs no merchant id. It THROWS on
      // insecure origins and in some webviews — hence inside the try.
      hasApplePaySession = !!AP && (typeof AP.canMakePayments !== 'function' || AP.canMakePayments() === true);
    } catch {
      hasApplePaySession = false;
    }
    try {
      hasPaymentRequest = typeof (window as unknown as { PaymentRequest?: unknown }).PaymentRequest === 'function';
    } catch {
      hasPaymentRequest = false;
    }
    setWallet(
      walletForDevice(navigator.userAgent, {
        maxTouchPoints: navigator.maxTouchPoints,
        hasApplePaySession,
        hasPaymentRequest,
      })
    );
  }, []);
  const walletText = wallet === 'apple' ? t('wallet_apple') : wallet === 'google' ? t('wallet_google') : t('wallet_generic');
  const WalletIcon = wallet ? Wallet : ShieldCheck;

  async function handleClick() {
    if (going || isLoading) return;
    setGoing(true);
    await buyNow([{ merchandiseId: variantId, quantity }, ...extraLines]);
  }

  // The spinner FOLLOWS the cart context instead of keeping its own clock. The
  // context holds `isLoading` while the page unloads and releases it on every
  // path where the shopper is still here — failure, the drawer fallback, an
  // aborted navigation, Back from checkout via the bfcache. A private timer
  // here could not see any of those.
  useEffect(() => {
    if (!isLoading) setGoing(false);
  }, [isLoading]);

  const basis = cart ? shippingBasis(cart.cost) : 0;
  // Under a discount, adding a CATALOGUE price predicts nothing (see
  // canPredictShipping) — state the rule instead of guessing the outcome.
  const predictable = canPredictShipping(cart);
  const free = predictable && unlocksWith(basis, selectionTotal);
  const threshold = <bdi>{money(FREE_SHIPPING_THRESHOLD)}</bdi>;

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={going || isLoading}
        className={cn(
          'flex w-full min-h-[58px] items-center justify-center gap-2 rounded-2xl border-2 border-chako-ink bg-transparent px-4 py-2 text-sm font-semibold text-chako-ink transition-[background-color,transform] duration-150 touch-manipulation',
          'hover:bg-chako-ink/5 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70'
        )}
      >
        {going ? (
          <><Loader2 size={16} className="animate-spin" aria-hidden="true" />{t('product_buy_now_loading')}</>
        ) : (
          <span className="flex flex-col items-center leading-tight">
            <span>{t('product_buy_now')}</span>
            {FLAGS.PDP_WALLET_HINT && (
              <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-chako-ink/70" data-wallet={wallet ?? 'none'}>
                <WalletIcon size={11} aria-hidden="true" className="flex-shrink-0" />
                {walletText}
              </span>
            )}
          </span>
        )}
      </button>

      {/* ink/70 + green-800: 11px text needs that much to pass AA on cream */}
      <div className="buy-now-note mt-1.5 min-h-[32px] text-center text-[11px] leading-4 text-chako-ink/70">
        {cartReady && (
          <>
            <p className={cn('inline-flex items-center justify-center gap-1', free && 'font-semibold text-green-800')}>
              {free && <Check size={11} strokeWidth={3} className="flex-shrink-0" aria-hidden="true" />}
              <span>
                {!predictable
                  ? fill(t('cart_ship_empty'), { threshold })
                  : free
                  ? fill(t('cart_shipping_free'), { threshold })
                  : fill(t('cart_shipping_paid'), { fee: <bdi>{money(FLAT_SHIPPING_FEE)}</bdi>, threshold })}
              </span>
            </p>
            {(cart?.totalQuantity ?? 0) > 0 && <p>{t('product_buy_now_cart_hint')}</p>}
          </>
        )}
      </div>
    </div>
  );
}
