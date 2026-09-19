'use client';

import { Clock, Truck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import Link from '@/components/ui/LocalizedLink';
import { fill } from '@/components/ui/fill';
import { dispatchDuration } from '@/lib/translations';
import { useNow } from '@/lib/useNow';
import {
  dispatchWindow, dispatchState, countdownParts, dayLabel, deviceOnUaeDate,
  DISPATCH_NOTICE, URGENT_MS, type CountdownParts,
} from '@/lib/dispatch';
import { cn } from '@/lib/utils';

interface Props {
  variant: 'pdp' | 'cart';
  /**
   * Can we vouch the goods are on the shelf? When false the block never names
   * a day and never runs a timer (see DispatchStateOptions.stockOk).
   */
  stockOk: boolean;
}

const LONG_GAP_DAYS = 6;
const DAY_MS = 86_400_000;
const two = (n: number) => String(n).padStart(2, '0');

/**
 * "02:14:09", or "1d 14:22:09" past a day — the compact (cart / sticky) form.
 * Arabic gets a real word for the days ("يوم و14:22:09"): a Latin "d" is
 * unreadable to an Arabic-only shopper, who would take ~47h for ~23h.
 */
export function clockText(p: CountdownParts, isAr = false): string {
  const hms = `${two(p.hours)}:${two(p.minutes)}:${two(p.seconds)}`;
  if (p.days === 0) return hms;
  if (!isAr) return `${p.days}d ${hms}`;
  const d = p.days === 1 ? 'يوم' : p.days === 2 ? 'يومين' : `${p.days} أيام`;
  return `${d} و${hms}`;
}

/**
 * "Order within [02 hrs][14 min][09 sec] to get it tomorrow, Tuesday" — the ONE
 * component that states the delivery promise, on the PDP and in the cart, from
 * the one pure function in lib/dispatch.ts. So the two can never disagree.
 *
 * It is a REAL countdown, and that is what keeps it honest while still being
 * urgent (this store lost a dispute over shipping wording):
 *  - it counts to the actual next 2PM Gulf cutoff, on a server-corrected clock
 *    (lib/useNow.ts) — never the device clock alone, never server-rendered
 *    (PDPs are ISR-cached; a time baked into HTML is a stale promise);
 *  - the day beside it is the day THAT cutoff delivers — Friday morning says
 *    Monday, never "tomorrow"; evenings and weekends count to the next
 *    business cutoff and name the day after it;
 *  - it flips one minute early, never late, and resets by itself;
 *  - the RAK/Fujairah caveat is INSIDE the block, always. A named day is never
 *    separated from its exception;
 *  - when the promise cannot be vouched for (no trusted clock yet, kill switch,
 *    past VERIFIED_THROUGH, unproven stock) there is NO timer — only the
 *    always-true wording. A timer is never decoration.
 * The block keeps ONE height in every state, so Add to Cart (directly below)
 * never moves when the clock arrives, when the days cell appears at the 24h
 * boundary, or at the 13:59 flip. Measured in the running build, EN and AR:
 * 118px at 360px and wider; below 360px the row STACKS (text above the cells)
 * and holds 158px — side by side, four cells left the text a 68px column.
 */
export default function DispatchPromise({ variant, stockOk }: Props) {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const now = useNow(1000);
  const isPdp = variant === 'pdp';

  const caveat = (
    <p className={cn('text-[11px] leading-[14px] text-chako-ink/70', isPdp ? 'mt-2' : 'mt-0.5 min-h-[28px]')}>
      {t('dispatch_caveat')}
      {isPdp && (
        <>
          {' '}
          <Link href="/pages/shipping" className="underline underline-offset-2 hover:text-chako-ink transition-colors">
            {t('dispatch_details_link')}
          </Link>
        </>
      )}
    </p>
  );

  const shell = (state: string, body: React.ReactNode) => (
    <div
      // Not a live region: a countdown that announces itself every second is noise
      aria-live="off"
      data-dispatch-state={state}
      className={cn(isPdp ? 'rounded-2xl bg-chako-highlight/30 px-3.5 py-3 min-h-[118px] max-[359px]:min-h-[158px]' : 'min-h-[64px]')}
    >
      {body}
    </div>
  );

  const staticBlock = (lead: string, promise: string | null) =>
    shell(
      'safe',
      <div className={cn('flex items-start', isPdp ? 'gap-2.5' : 'gap-2')}>
        {isPdp ? (
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-chako-orange">
            <Truck size={16} className="rtl:-scale-x-100" aria-hidden="true" />
          </span>
        ) : (
          <Truck size={14} aria-hidden="true" className="mt-0.5 flex-shrink-0 text-chako-ink/50 rtl:-scale-x-100" />
        )}
        <div className="min-w-0 flex-1">
          <p className={cn('text-chako-ink', isPdp ? 'text-sm font-bold leading-5' : 'text-xs font-semibold leading-4')}>{lead}</p>
          {promise && (
            <p className={cn(isPdp ? 'text-[13px] font-semibold text-chako-ink/80 leading-5' : 'text-xs font-medium text-chako-ink/70 leading-4')}>
              {promise}
            </p>
          )}
          {caveat}
        </div>
      </div>
    );

  // The owner's notice outranks EVERYTHING, safe states included (see
  // DISPATCH_NOTICE). Static text, so it is also correct in server HTML.
  if (DISPATCH_NOTICE) return staticBlock(isAr ? DISPATCH_NOTICE.ar : DISPATCH_NOTICE.en, null);
  if (!now) return staticBlock(t('dispatch_safe_lead'), t('dispatch_safe_promise'));

  const w = dispatchWindow(now);
  const state = dispatchState(w, { stockOk });
  if (state === 'safe') return staticBlock(t('dispatch_safe_lead'), t('dispatch_safe_promise'));

  const parts = countdownParts(w.msLeft);
  const daysTo = Math.round((w.deliveryDay.getTime() - w.today.getTime()) / DAY_MS);
  const weekday = dayLabel(w.deliveryDay, isAr, daysTo >= LONG_GAP_DAYS);
  // "tomorrow" is only true if the shopper's calendar agrees with Dubai's
  const tomorrow = w.deliveryInDays === 1 && deviceOnUaeDate(new Date(), w);
  const promise = fill(t(tomorrow ? 'dispatch_timer_get_tomorrow' : 'dispatch_timer_get_day'), {
    weekday: <span className="font-bold text-chako-ink">{weekday}</span>,
  });
  // The ONE visual escalation, tied to real time: under an hour to a cutoff that is today
  const urgent = state === 'today' && w.msLeft <= URGENT_MS;
  // Screen readers get words, per minute — not four boxes of digits per second
  const spoken = `${t('dispatch_timer_label')} ${dispatchDuration(parts.hours, parts.minutes, isAr, parts.days)}`;

  if (!isPdp) {
    // Cart footer: compact, three fixed lines
    return shell(
      state,
      <div className="flex items-start gap-2">
        <Clock size={14} aria-hidden="true" className={cn('mt-0.5 flex-shrink-0', urgent ? 'text-chako-orange' : 'text-chako-ink/50')} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold leading-4 text-chako-ink">
            <span aria-hidden="true">
              {t('dispatch_timer_label')}{' '}
              {/* Digits stay INK in the last hour: brand orange on cream is
                  1.8:1 — the timer would get LESS readable exactly when it
                  matters. The icon carries the colour instead. */}
              <bdi className="font-extrabold tabular-nums">{clockText(parts, isAr)}</bdi>
            </span>
            <span className="sr-only">{spoken}</span>
          </p>
          <p className="text-xs font-medium leading-4 text-chako-ink/70">{promise}</p>
          {caveat}
        </div>
      </div>
    );
  }

  const cells: [number, string][] = [
    ...(parts.days > 0 ? ([[parts.days, t('dispatch_unit_days')]] as [number, string][]) : []),
    [parts.hours, t('dispatch_unit_hours')],
    [parts.minutes, t('dispatch_unit_minutes')],
    [parts.seconds, t('dispatch_unit_seconds')],
  ];

  return shell(
    state,
    <>
      <div className="flex items-center justify-between gap-3 max-[359px]:flex-col max-[359px]:items-start max-[359px]:gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-bold leading-5 text-chako-ink">
            <Clock size={15} aria-hidden="true" className={cn('flex-shrink-0', urgent ? 'text-chako-orange' : 'text-chako-ink/60')} />
            {t('dispatch_timer_label')}
          </p>
          <p className="mt-0.5 text-[13px] font-semibold leading-[18px] text-chako-ink/80">{promise}</p>
        </div>

        {/* role=timer + words for assistive tech; the digits are decorative to it.
            In RTL the row mirrors by itself (largest unit at the reading start);
            each number sits in a <bdi> so it never reorders. */}
        <div role="timer" aria-label={spoken} className="flex flex-shrink-0 gap-1">
          {cells.map(([value, unit], i) => (
            <div key={i} aria-hidden="true" className="flex w-[42px] flex-col items-center">
              <bdi
                className={cn(
                  'dispatch-cell flex h-9 w-full items-center justify-center rounded-lg text-[17px] font-extrabold tabular-nums leading-none transition-colors duration-300',
                  urgent ? 'dispatch-cell--urgent bg-chako-orange text-chako-ink' : 'bg-chako-ink text-chako-cream'
                )}
              >
                {two(value)}
              </bdi>
              <span className="mt-1 text-[10px] font-semibold leading-none text-chako-ink/70">{unit}</span>
            </div>
          ))}
        </div>
      </div>
      {caveat}
    </>
  );
}
