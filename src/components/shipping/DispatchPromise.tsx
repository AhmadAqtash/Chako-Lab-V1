'use client';

import { Clock, Truck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import Link from '@/components/ui/LocalizedLink';
import { fill, fillText } from '@/components/ui/fill';
import { dispatchDuration } from '@/lib/translations';
import { useNow } from '@/lib/useNow';
import {
  dispatchWindow, dispatchState, hoursMinutes, dayLabel, deviceOnUaeDate, DISPATCH_NOTICE,
  type DispatchState,
} from '@/lib/dispatch';
import { cn } from '@/lib/utils';

interface Props {
  variant: 'pdp' | 'cart';
  /**
   * Can we vouch the goods are on the shelf? When false the block never names
   * a day (see DispatchStateOptions.stockOk).
   */
  stockOk: boolean;
  /** Another pressure signal (low stock) is showing — never tick beside it. */
  calm?: boolean;
}

interface Lines {
  state: DispatchState;
  lead: React.ReactNode;
  promise: React.ReactNode;
}

const LONG_GAP_DAYS = 6;
const DAY_MS = 86_400_000;

/**
 * "Order within 2h 14m · Delivered tomorrow, Tuesday" — the ONE component that
 * states the dispatch promise, on the PDP and in the cart, from the one pure
 * function in lib/dispatch.ts. So the two can never disagree.
 *
 * Rules it holds to (this store lost a dispute over shipping wording):
 *  - THREE FIXED LINES and a fixed min-height in every state, including the
 *    SSR/safe fallback: the sentence never fits one line at 375px, so we design
 *    for the wrap instead of fighting it, and nothing shifts on hydration or
 *    when a minute ticks. The ticking text sits alone on its line.
 *  - The RAK/Fujairah caveat is INSIDE the block, always. A named day is never
 *    separated from its exception.
 *  - No seconds, no red, no pulse, never "hurry", never "guaranteed".
 *  - Time is never rendered on the server and never from the device clock
 *    alone (lib/useNow.ts) — until a server-corrected clock exists, the safe
 *    wording shows.
 */
export default function DispatchPromise({ variant, stockOk, calm = false }: Props) {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const now = useNow();

  const lines = compute();
  const isPdp = variant === 'pdp';
  const Icon = lines.state === 'live' ? Clock : Truck;

  function compute(): Lines {
    const safe: Lines = {
      state: 'safe',
      lead: t('dispatch_safe_lead'),
      promise: t('dispatch_safe_promise'),
    };
    if (!now) return safe;

    const w = dispatchWindow(now);
    const state = dispatchState(w, { stockOk, calm });
    if (state === 'safe') return safe;

    if (DISPATCH_NOTICE) {
      const text = isAr ? DISPATCH_NOTICE.ar : DISPATCH_NOTICE.en;
      return { state, lead: text, promise: null };
    }

    const daysTo = (d: Date) => Math.round((d.getTime() - w.today.getTime()) / DAY_MS);
    const label = (d: Date) => dayLabel(d, isAr, daysTo(d) >= LONG_GAP_DAYS);
    const cutoff = t('dispatch_cutoff');
    // "today"/"tomorrow" are only true if the shopper's calendar agrees with Dubai's
    const sameDate = deviceOnUaeDate(new Date(), w);
    const strong = (s: string) => <span className="font-bold">{s}</span>;

    if (state === 'next') {
      // Benefit first: this is the MAIN state (evening Instagram traffic), and
      // leading with "order by tomorrow" reads as permission to wait.
      const delivered = fillText(t('dispatch_promise_day'), { weekday: label(w.deliveryDay) });
      const order = fillText(t('dispatch_lead_day'), { cutoff, cutoffDay: label(w.dispatchDay) });
      return { state, lead: delivered, promise: order };
    }

    const promiseTpl = w.deliveryInDays === 1 && sameDate ? 'dispatch_promise_tomorrow' : 'dispatch_promise_day';
    const weekday = label(w.deliveryDay);
    const promise = fill(t(promiseTpl), { weekday: strong(weekday) });

    if (state === 'live') {
      const { hours, minutes } = hoursMinutes(w.msLeft);
      const time = dispatchDuration(hours, minutes, isAr);
      return {
        state,
        lead: fill(t('dispatch_lead_within'), { time: <bdi className="tabular-nums">{time}</bdi> }),
        promise,
      };
    }

    // state === 'today'
    const leadText = sameDate
      ? fillText(t('dispatch_lead_today'), { cutoff })
      : fillText(t('dispatch_lead_day'), { cutoff, cutoffDay: label(w.dispatchDay) });
    return { state, lead: leadText, promise };
  }

  return (
    <div
      // Not a live region: a countdown that announces itself every 30s is
      // noise. The three lines read naturally in order, link included.
      aria-live="off"
      data-dispatch-state={lines.state}
      className={cn(
        'flex items-start',
        isPdp
          ? 'gap-2.5 rounded-2xl bg-chako-highlight/30 px-3.5 py-3 min-h-[92px]'
          : 'gap-2 min-h-[64px]'
      )}
    >
      {isPdp ? (
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-chako-orange">
          <Icon size={16} className={lines.state === 'live' ? undefined : 'rtl:-scale-x-100'} aria-hidden="true" />
        </span>
      ) : (
        <Icon
          size={14}
          aria-hidden="true"
          className={cn('mt-0.5 flex-shrink-0 text-chako-ink/50', lines.state !== 'live' && 'rtl:-scale-x-100')}
        />
      )}

      <div className="min-w-0 flex-1">
        <p className={cn('text-chako-ink', isPdp ? 'text-sm font-bold leading-5' : 'text-xs font-semibold leading-4')}>
          {lines.lead}
        </p>
        {lines.promise && (
          <p className={cn(isPdp ? 'text-[13px] font-semibold text-chako-ink/80 leading-5' : 'text-xs font-medium text-chako-ink/70 leading-4')}>
            {lines.promise}
          </p>
        )}
        <p className={cn('text-[11px] leading-[14px] min-h-[28px]', isPdp ? 'text-chako-ink/60 mt-1' : 'text-chako-ink/50 mt-0.5')}>
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
      </div>
    </div>
  );
}
