'use client';

import { useEffect, useRef, useState } from 'react';
import { Truck, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { fill, fillText } from '@/components/ui/fill';
import { formatPrice, formatPriceExact, cn } from '@/lib/utils';
import { FREE_SHIPPING_THRESHOLD, SHOP_CURRENCY, freeShippingProgress } from '@/lib/shipping-config';

interface Props {
  /** false until the first cart load settles — renders a neutral skeleton */
  ready: boolean;
  hasLines: boolean;
  /** shippingBasis(cart.cost) — the LOWER of subtotal and total */
  basis: number;
}

const NEAR_AED = 50;
const money = (amount: number) => formatPrice({ amount: String(amount), currencyCode: SHOP_CURRENCY });

/**
 * "Add AED 101 more to unlock free shipping" — pinned under the drawer header.
 *
 * ONE tier and ONE milestone, because the store has one real reward: free
 * shipping at AED 250 (lib/shipping-config.ts). Nothing here may promise what
 * Shopify does not enforce. The "after discounts" condition is pinned in the
 * drawer footer in every state in which this bar can say "free".
 *
 * Constant 64px in every non-empty state — it sits directly above the content
 * the thumb is on, so it must never change height at the unlock moment.
 */
export default function FreeShippingBar({ ready, hasLines, basis }: Props) {
  const { t } = useLanguage();
  const { unlocked, remaining, ratio } = freeShippingProgress(basis);

  // The CROSSING is an event, not a state: play the marker pop only when the
  // cart goes from locked to unlocked while this bar is on screen — never when
  // the drawer simply opens on an already-unlocked cart.
  const wasUnlocked = useRef<boolean | null>(null);
  const [pop, setPop] = useState(false);
  // The reset timer lives in a ref and is NOT an effect cleanup: a cleanup
  // would cancel it whenever the deps change again inside the 450ms (re-lock,
  // cart emptied) — leaving `pop` stuck true, so the next crossing never replays.
  const popTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!ready || !hasLines) { wasUnlocked.current = null; return; }
    if (wasUnlocked.current === false && unlocked) {
      setPop(true);
      if (popTimer.current) clearTimeout(popTimer.current);
      popTimer.current = setTimeout(() => { popTimer.current = null; setPop(false); }, 450);
    }
    wasUnlocked.current = unlocked;
  }, [ready, hasLines, unlocked]);
  useEffect(() => () => { if (popTimer.current) clearTimeout(popTimer.current); }, []);

  if (!ready) {
    return <div className="ship-seg ship-seg--bar h-16 border-b border-black/8 bg-chako-highlight/30" aria-hidden="true" />;
  }

  const threshold = money(FREE_SHIPPING_THRESHOLD);

  // Empty cart: a static line, NO bar — a 0% bar asking for AED 250 reads as a demand.
  if (!hasLines) {
    return (
      <div className="ship-seg flex h-9 items-center justify-center gap-1.5 border-b border-black/8 bg-chako-highlight/30 px-4">
        <Truck size={14} className="flex-shrink-0 text-chako-orange rtl:-scale-x-100" aria-hidden="true" />
        <p className="text-[12px] font-semibold text-chako-ink/70 truncate">
          {fill(t('cart_ship_empty'), { threshold: <bdi>{threshold}</bdi> })}
        </p>
      </div>
    );
  }

  const amount = <bdi className="font-extrabold tabular-nums">{money(remaining)}</bdi>;
  const message = unlocked
    ? t('cart_ship_unlocked')
    : fill(t(remaining <= NEAR_AED ? 'cart_ship_near' : 'cart_ship_progress'), { amount });

  return (
    <div
      className={cn(
        'ship-seg ship-seg--bar h-16 border-b border-black/8 px-4 py-2 transition-colors duration-300',
        unlocked ? 'ship-seg--unlocked bg-green-50' : 'bg-chako-highlight/30'
      )}
    >
      {/* Always mounted, so screen readers announce the unlock once (a live
          region inserted later is not announced — same pattern as PairingCarousel) */}
      <p aria-live="polite" className="text-center text-[13px] max-[359px]:text-[12px] font-semibold leading-[18px] whitespace-nowrap overflow-hidden text-ellipsis">
        {message}
      </p>

      <div className="mt-1.5 flex h-6 items-center gap-2">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={FREE_SHIPPING_THRESHOLD}
          // FLOOR while locked: at AED 249.60 a rounded value would announce
          // "250 of 250" to a screen reader while shipping is still being charged
          aria-valuenow={unlocked ? FREE_SHIPPING_THRESHOLD : Math.min(Math.floor(basis), FREE_SHIPPING_THRESHOLD - 1)}
          aria-valuetext={fillText(t('cart_ship_aria'), {
            current: unlocked
              ? threshold
              : formatPriceExact({ amount: String(basis), currencyCode: SHOP_CURRENCY }),
            threshold,
          })}
          className="ship-track h-2 flex-1 overflow-hidden rounded-full bg-black/10"
        >
          {/* WIDTH, not scaleX: scaleX distorts the rounded end at low ratios and
              transform-origin has no logical keyword for RTL. A width inside a
              flex row grows from the inline-start by itself. */}
          <div
            className={cn(
              'h-full rounded-full transition-[width,background-color] duration-500 ease-[var(--ease-out-strong)]',
              unlocked ? 'bg-chako-success' : 'bg-chako-ink'
            )}
            style={{ width: `${Math.max(8, ratio * 100)}%` }}
          />
        </div>
        <span
          aria-hidden="true"
          className={cn(
            'ship-marker flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full shadow-sm transition-colors duration-300',
            unlocked ? 'bg-chako-success text-white' : 'bg-white text-chako-orange',
            pop && 'animate-ship-pop'
          )}
        >
          {unlocked ? <Check size={14} strokeWidth={3} /> : <Truck size={14} className="rtl:-scale-x-100" />}
        </span>
      </div>
    </div>
  );
}
