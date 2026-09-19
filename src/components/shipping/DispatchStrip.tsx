'use client';

import { Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { fill, fillText } from '@/components/ui/fill';
import { dispatchDuration } from '@/lib/translations';
import { useNow } from '@/lib/useNow';
import {
  dispatchWindow, dispatchState, countdownParts, dayLabel, deviceOnUaeDate, DISPATCH_NOTICE, URGENT_MS,
} from '@/lib/dispatch';
import { clockText } from '@/components/shipping/DispatchPromise';
import { cn } from '@/lib/utils';

/**
 * "Ships today — order within 02:14:09" — one thin line on top of the mobile
 * sticky Add to Cart bar, which is the first call to action most shoppers see
 * (the buy box starts below the fold).
 *
 * It makes a DISPATCH claim only, never a delivery-day claim — deliberately.
 * A delivery day must travel with its RAK/Fujairah caveat, and this slot cannot
 * fit one; a clipped promise is a wrong promise. Dispatch has no such
 * exception: order before the cutoff and the parcel leaves that day, in every
 * emirate. Same engine and same clock as the full block, so they always agree.
 *
 * Renders nothing when the promise cannot be vouched for (no trusted clock yet,
 * kill switch, past VERIFIED_THROUGH, unproven stock, or an owner notice).
 */
export default function DispatchStrip({ stockOk }: { stockOk: boolean }) {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const now = useNow(1000);

  if (DISPATCH_NOTICE || !now) return null;
  const w = dispatchWindow(now);
  const state = dispatchState(w, { stockOk });
  if (state === 'safe') return null;

  const urgent = state === 'today' && w.msLeft <= URGENT_MS;
  const parts = countdownParts(w.msLeft);
  // Digits stay ink even when urgent — brand orange on this background is under
  // 2:1. The clock icon carries the colour.
  const time = <bdi className="font-extrabold tabular-nums text-chako-ink">{clockText(parts, isAr)}</bdi>;
  // "today" is only true if the shopper's calendar agrees with Dubai's
  const today = state === 'today' && deviceOnUaeDate(new Date(), w);
  const weekday = dayLabel(w.dispatchDay, isAr);
  const template = t(today ? 'dispatch_strip_today' : 'dispatch_strip_day');
  // Screen readers get WORDS per minute, not a clock face per second
  const spoken = fillText(template, { weekday, time: dispatchDuration(parts.hours, parts.minutes, isAr, parts.days) });

  return (
    <p className="dispatch-strip flex items-center justify-center gap-1.5 pb-2 text-[11px] font-semibold leading-4 text-chako-ink/70">
      <Clock size={12} aria-hidden="true" className={cn('flex-shrink-0', urgent && 'text-chako-orange')} />
      <span aria-hidden="true">{fill(template, { weekday, time })}</span>
      <span className="sr-only">{spoken}</span>
    </p>
  );
}
