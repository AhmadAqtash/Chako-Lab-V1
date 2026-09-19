// Dispatch promise — the ONE place the shipping SLA is turned into dates.
//
// GROUND TRUTH (Ahmad, confirmed 20 Aug 2026; mirrored on /pages/shipping):
//   - order before 2PM Mon–Fri (Gulf time) → dispatched the same day
//     → delivered the NEXT BUSINESS DAY
//   - after 2PM, or on Sat/Sun → dispatched the next business day
//   - Saturday and Sunday are not business days. There is no same-day
//     delivery, ever, and no express service.
//   - Ras Al Khaimah and Fujairah may take one extra day — every surface that
//     names a day carries that caveat IN THE SAME ELEMENT.
//
// This store once lost a customer dispute over shipping wording. Every surface
// that names a day or runs a countdown derives it from here, so the promise
// can only ever be wrong in one place.
//
// Pure and clock-injected: no Date.now(), no Intl time zones. The UAE has no
// daylight saving, so Gulf time is a fixed UTC+4 and "UAE wall clock" is just
// the instant shifted by four hours and read through the UTC getters.

export const CUTOFF_HOUR = 14;
const UAE_OFFSET_MS = 4 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

// ─── Owner controls ───────────────────────────────────────────────────────────

/**
 * KILL SWITCH. 'safe' makes every surface drop named days and countdowns and
 * show the always-true wording ("Order before 2PM on a business day — delivered
 * the next business day"). Flip it the moment operations cannot keep the
 * promise (courier outage, stock move, unplanned closure).
 */
export const DISPATCH_MODE: 'live' | 'safe' = 'live';

/**
 * UAE calendar dates ('YYYY-MM-DD') with no dispatch and no delivery.
 * Entered conservatively: listing a day the store actually works only makes
 * the promise a day LATER than reality, which is the safe direction.
 * An UNLISTED holiday makes the promise a day too early — the unsafe one.
 */
export const HOLIDAYS: ReadonlySet<string> = new Set<string>([
  '2026-12-02', // UAE National Day (Eid Al Etihad)
  '2026-12-03', // UAE National Day
  '2027-01-01', // New Year's Day
]);

/**
 * The last date for which HOLIDAYS is known to be complete. After it, every
 * surface falls back to the safe wording BY ITSELF rather than silently
 * over-promising because nobody updated the list. Eid al-Fitr 2027 is
 * moon-sighted and expected around 9–11 March — so: verified to end February.
 * To extend: add the announced dates above, then move this forward.
 */
export const VERIFIED_THROUGH = '2027-02-28';

/**
 * Optional owner-written notice that REPLACES the lead and promise lines (the
 * caveat stays), e.g. during Eid: { en: 'Orders placed now ship on Monday 15
 * March', ar: '…' }. null = computed copy.
 *
 * It OVERRIDES EVERY STATE — including the kill switch, dates past
 * VERIFIED_THROUGH, unproven stock, and the moment before the clock arrives.
 * It has to: those are exactly the situations in which an owner writes a
 * notice (Eid falls after VERIFIED_THROUGH; a courier outage is what the kill
 * switch is for), and the "always true" safe wording is NOT true during an
 * unplanned closure.
 */
export const DISPATCH_NOTICE: { en: string; ar: string } | null = null;

// ─── Window ───────────────────────────────────────────────────────────────────

export interface DispatchWindow {
  /** The real instant of the cutoff this promise hangs on. */
  cutoffAt: Date;
  /** Milliseconds from `now` to that cutoff. Always > 0. */
  msLeft: number;
  /** The cutoff is today: order now and the parcel leaves today. */
  leavesToday: boolean;
  /**
   * UAE calendar days as UTC-midnight Dates. Format them with
   * `timeZone: 'UTC'` — they are dates, not instants.
   */
  today: Date;
  dispatchDay: Date;
  deliveryDay: Date;
  /** Whole UAE calendar days from today to delivery. 1 = tomorrow. */
  deliveryInDays: number;
}

const ymd = (d: Date) => d.toISOString().slice(0, 10);

function isBusinessDay(uaeDay: Date, holidays: ReadonlySet<string>): boolean {
  const wd = uaeDay.getUTCDay(); // 0 Sun … 6 Sat
  return wd >= 1 && wd <= 5 && !holidays.has(ymd(uaeDay));
}

function nextBusinessDay(uaeDay: Date, holidays: ReadonlySet<string>): Date {
  let d = new Date(uaeDay.getTime() + DAY_MS);
  // Bounded: a mis-entered holiday list must never hang a render.
  for (let i = 0; i < 30 && !isBusinessDay(d, holidays); i++) d = new Date(d.getTime() + DAY_MS);
  return d;
}

/**
 * @param guardMs Safety margin applied ONLY to the "leaves today" comparison,
 *   so the promise flips one minute EARLY at 2PM and never late. For those 60
 *   seconds we under-promise (name the later day) — the only safe direction.
 */
export function dispatchWindow(
  now: Date,
  holidays: ReadonlySet<string> = HOLIDAYS,
  guardMs = 60_000
): DispatchWindow {
  const uaeNow = new Date(now.getTime() + UAE_OFFSET_MS);
  const today = new Date(Date.UTC(uaeNow.getUTCFullYear(), uaeNow.getUTCMonth(), uaeNow.getUTCDate()));
  const cutoffToday = today.getTime() + CUTOFF_HOUR * HOUR_MS;

  // "Before 2PM" is strict: at 14:00:00.000 today's window has closed.
  const leavesToday = isBusinessDay(today, holidays) && uaeNow.getTime() + guardMs < cutoffToday;
  const dispatchDay = leavesToday ? today : nextBusinessDay(today, holidays);
  const deliveryDay = nextBusinessDay(dispatchDay, holidays);

  const cutoffAt = new Date(dispatchDay.getTime() + CUTOFF_HOUR * HOUR_MS - UAE_OFFSET_MS);

  return {
    cutoffAt,
    msLeft: cutoffAt.getTime() - now.getTime(),
    leavesToday,
    today,
    dispatchDay,
    deliveryDay,
    deliveryInDays: Math.round((deliveryDay.getTime() - today.getTime()) / DAY_MS),
  };
}

// ─── State machine ────────────────────────────────────────────────────────────
//
//   safe   SSR / clock unknown / kill switch / past VERIFIED_THROUGH / no stock
//          proof → "Order before 2PM on a business day · next business day"
//   live   cutoff is TODAY, 20min < left <= 6h → "Order within 2h 14m"
//   today  cutoff is today but outside that window → "Order before 2PM today".
//          At midnight "within 13h 29m" is noise; in the last 20 minutes a
//          relative "3m" invites a checkout that cannot finish in time, while
//          the absolute conditional stays literally true at 13:59.
//   next   cutoff is another day → "Delivered Wednesday · Order before 2PM Tuesday"

export type DispatchState = 'live' | 'today' | 'next' | 'safe';

export const LIVE_MAX_MS = 6 * HOUR_MS;
export const LIVE_MIN_MS = 20 * 60 * 1000;

export interface DispatchStateOptions {
  mode?: 'live' | 'safe';
  verifiedThrough?: string;
  /**
   * False when we cannot vouch that the goods are on the shelf (untracked or
   * oversold variants stay "available" at zero stock) — a named delivery day
   * would then be a guess.
   */
  stockOk?: boolean;
  /**
   * Another pressure signal (low stock) is already showing: never tick beside
   * it. One live signal at a time.
   */
  calm?: boolean;
}

export function dispatchState(w: DispatchWindow, opts: DispatchStateOptions = {}): DispatchState {
  const { mode = DISPATCH_MODE, verifiedThrough = VERIFIED_THROUGH, stockOk = true, calm = false } = opts;
  if (mode !== 'live' || !stockOk) return 'safe';
  // The promise spans today → delivery; all of it must be inside the verified range.
  if (ymd(w.deliveryDay) > verifiedThrough) return 'safe';
  if (!w.leavesToday) return 'next';
  if (calm) return 'today';
  return w.msLeft <= LIVE_MAX_MS && w.msLeft > LIVE_MIN_MS ? 'live' : 'today';
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

/** Hours and minutes left, minutes FLOORED — never over-state the time left. */
export function hoursMinutes(ms: number): { hours: number; minutes: number } {
  const totalMin = Math.max(0, Math.floor(ms / 60_000));
  return { hours: Math.floor(totalMin / 60), minutes: totalMin % 60 };
}

/**
 * Weekday for one of the UTC-midnight day values above. When the day is 6+
 * calendar days out (a long closure) the date is appended — a bare "Monday"
 * would be ambiguous. Latin digits in Arabic too: these lines already carry
 * dynamic Latin digits and one line must never mix digit systems.
 */
export function dayLabel(day: Date, isAr: boolean, withDate = false): string {
  const locale = isAr ? 'ar-AE-u-nu-latn' : 'en-GB';
  const opts: Intl.DateTimeFormatOptions = withDate
    ? { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }
    : { weekday: 'long', timeZone: 'UTC' };
  return new Intl.DateTimeFormat(locale, opts).format(day).replace(',', '');
}

/** True when the shopper's device is on the same calendar date as the UAE. */
export function deviceOnUaeDate(now: Date, w: DispatchWindow): boolean {
  return (
    now.getFullYear() === w.today.getUTCFullYear() &&
    now.getMonth() === w.today.getUTCMonth() &&
    now.getDate() === w.today.getUTCDate()
  );
}
