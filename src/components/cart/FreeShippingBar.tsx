'use client';

import { useEffect, useRef, useState } from 'react';
import { Truck, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { fill, fillText } from '@/components/ui/fill';
import { formatPrice, cn } from '@/lib/utils';
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
  useEffect(() => {
    if (!ready || !hasLines) { wasUnlocked.current = null; return; }
    if (wasUnlocked.current === false && unlocked) {
      setPop(true);
      const id = setTimeout(() => setPop(false), 450);
      wasUnlocked.current = unlocked;
      return () => clearTimeout(id);
    }
    wasUnlocked.current = unlocked;
  }, [ready, hasLines, unlocked]);

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
          aria-valuenow={Math.min(Math.round(basis), FREE_SHIPPING_THRESHOLD)}
          aria-valuetext={fillText(t('cart_ship_aria'), {
            current: money(Math.min(basis, FREE_SHIPPING_THRESHOLD)),
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
