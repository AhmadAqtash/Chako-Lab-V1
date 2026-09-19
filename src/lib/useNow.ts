'use client';

import { useEffect, useState } from 'react';
import { serverNow, onServerClockReady } from '@/lib/server-clock';

/**
 * Server-corrected current time, ticking — or `null` until it can be trusted.
 *
 * Null-first is the point, twice over:
 *  - pages are ISR-cached and rendered on a server whose clock is not the
 *    shopper's "now", so a time in server HTML would hydrate-mismatch and show
 *    a stale countdown;
 *  - the device clock alone is not evidence (see lib/server-clock.ts).
 * Callers render their fixed-height SAFE copy for `null`, so nothing shifts
 * when the clock arrives.
 *
 * Pauses while the tab is hidden and resyncs on return (including bfcache
 * restores) — a tab left open across the 2PM cutoff flips by itself.
 */
export function useNow(intervalMs = 30_000): Date | null {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let id: ReturnType<typeof setTimeout> | undefined;
    const tick = () => setNow(serverNow());
    // Chained timeouts ALIGNED to the interval boundary of the corrected clock,
    // not setInterval: an unaligned interval drifts against the wall clock, so
    // a seconds display skips (…09, …07) or repeats a value every so often.
    // Aligned, every mounted countdown also flips on the same instant.
    const schedule = () => {
      const base = (serverNow() ?? new Date()).getTime();
      const delay = intervalMs - (base % intervalMs) + 8;
      id = setTimeout(() => {
        tick();
        schedule();
      }, delay);
    };
    const start = () => {
      tick();
      schedule();
    };
    const stop = () => {
      if (id !== undefined) clearTimeout(id);
      id = undefined;
    };
    const resync = () => {
      stop();
      if (!document.hidden) start();
    };

    start();
    const offReady = onServerClockReady(tick);
    document.addEventListener('visibilitychange', resync);
    window.addEventListener('pageshow', resync);
    return () => {
      stop();
      offReady();
      document.removeEventListener('visibilitychange', resync);
      window.removeEventListener('pageshow', resync);
    };
  }, [intervalMs]);

  return now;
}
