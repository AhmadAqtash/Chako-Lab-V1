// Run with:  npm test
//
// Guards the shipping promise shown on every PDP and in the cart. A wrong day
// here is a customer-facing delivery claim the store cannot keep — and this
// store has already lost one dispute over shipping wording.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  dispatchWindow, dispatchState, hoursMinutes, countdownParts, dayLabel, deviceOnUaeDate,
  HOLIDAYS, VERIFIED_THROUGH, URGENT_MS,
} from './dispatch.ts';

// Build an instant from a UAE wall-clock time (UTC+4). 2026-09-21 is a Monday.
const uae = (date: string, time: string) => new Date(`${date}T${time}+04:00`);
const day = (d: Date) => d.toISOString().slice(0, 10);
const NONE: ReadonlySet<string> = new Set();
// State with explicit options so these tests do not depend on the live constants
const state = (now: Date, o: Parameters<typeof dispatchState>[1] = {}) =>
  dispatchState(dispatchWindow(now, NONE), { mode: 'live', verifiedThrough: '2099-12-31', ...o });

test('Monday morning: leaves today, delivered tomorrow', () => {
  const w = dispatchWindow(uae('2026-09-21', '09:00:00'), NONE);
  assert.equal(w.leavesToday, true);
  assert.equal(day(w.dispatchDay), '2026-09-21');
  assert.equal(day(w.deliveryDay), '2026-09-22');
  assert.equal(w.deliveryInDays, 1);
  assert.equal(w.msLeft, 5 * 60 * 60 * 1000);
});

test('the promise flips one minute EARLY at 2PM, never late', () => {
  assert.equal(dispatchWindow(uae('2026-09-21', '13:58:59'), NONE).leavesToday, true);
  const guard = dispatchWindow(uae('2026-09-21', '13:59:00'), NONE);
  assert.equal(guard.leavesToday, false, 'inside the 60s guard we already name the later day');
  assert.equal(day(guard.deliveryDay), '2026-09-23');
  const at = dispatchWindow(uae('2026-09-21', '14:00:00'), NONE);
  assert.equal(at.leavesToday, false);
  assert.equal(day(at.dispatchDay), '2026-09-22');
  assert.equal(at.msLeft, 24 * 60 * 60 * 1000, 'countdown rolls to tomorrow’s cutoff');
  // With the guard off, the boundary itself is strict
  assert.equal(dispatchWindow(uae('2026-09-21', '13:59:59'), NONE, 0).leavesToday, true);
  assert.equal(dispatchWindow(uae('2026-09-21', '14:00:00'), NONE, 0).leavesToday, false);
});

test('Friday before 2PM: leaves Friday, delivered MONDAY — never Saturday, never "tomorrow"', () => {
  const w = dispatchWindow(uae('2026-09-25', '10:00:00'), NONE);
  assert.equal(w.leavesToday, true);
  assert.equal(day(w.deliveryDay), '2026-09-28');
  assert.equal(w.deliveryInDays, 3);
  assert.equal(dayLabel(w.deliveryDay, false), 'Monday');
});

test('Thursday after 2PM: Friday cutoff, Monday delivery', () => {
  const w = dispatchWindow(uae('2026-09-24', '15:00:00'), NONE);
  assert.equal(day(w.dispatchDay), '2026-09-25');
  assert.equal(day(w.deliveryDay), '2026-09-28');
});

test('Friday after 2PM, Saturday and Sunday all dispatch Monday, deliver Tuesday', () => {
  for (const [d, t] of [['2026-09-25', '14:01:00'], ['2026-09-26', '12:00:00'], ['2026-09-27', '23:59:00']]) {
    const w = dispatchWindow(uae(d, t), NONE);
    assert.equal(w.leavesToday, false, `${d} ${t}`);
    assert.equal(day(w.dispatchDay), '2026-09-28', `${d} ${t}`);
    assert.equal(day(w.deliveryDay), '2026-09-29', `${d} ${t}`);
  }
});

test('the UAE day, not the UTC day, decides — 22:30 UTC Sunday is Monday 02:30 in Dubai', () => {
  const w = dispatchWindow(new Date('2026-09-20T22:30:00Z'), NONE);
  assert.equal(w.leavesToday, true);
  assert.equal(day(w.dispatchDay), '2026-09-21');
  assert.equal(w.cutoffAt.toISOString(), '2026-09-21T10:00:00.000Z', '2PM Gulf = 10:00 UTC');
});

test('holidays push both dispatch and delivery', () => {
  const holidays = new Set(['2026-09-22']);
  const late = dispatchWindow(uae('2026-09-21', '15:00:00'), holidays);
  assert.equal(day(late.dispatchDay), '2026-09-23');
  assert.equal(day(late.deliveryDay), '2026-09-24');
  const early = dispatchWindow(uae('2026-09-21', '09:00:00'), holidays);
  assert.equal(early.leavesToday, true);
  assert.equal(day(early.deliveryDay), '2026-09-23', 'cannot arrive on the holiday');
  assert.equal(early.deliveryInDays, 2);
  // A holiday Monday is not a dispatch day at all
  const holidayMonday = dispatchWindow(uae('2026-09-21', '09:00:00'), new Set(['2026-09-21']));
  assert.equal(holidayMonday.leavesToday, false);
  assert.equal(day(holidayMonday.dispatchDay), '2026-09-22');
});

test('National Day 2026 is entered: a 1 Dec order cannot be promised for 2 Dec', () => {
  assert.ok(HOLIDAYS.has('2026-12-02') && HOLIDAYS.has('2026-12-03'));
  const w = dispatchWindow(uae('2026-12-01', '10:00:00'));
  assert.equal(w.leavesToday, true);
  assert.equal(day(w.deliveryDay), '2026-12-04');
});

test('delivery never lands on a weekend, and msLeft is always positive', () => {
  for (let h = 0; h < 24 * 7; h++) {
    const now = new Date(Date.UTC(2026, 8, 21, h, 17, 3));
    const w = dispatchWindow(now, NONE);
    assert.ok(w.msLeft > 0, now.toISOString());
    assert.ok(w.deliveryDay.getTime() > w.dispatchDay.getTime(), now.toISOString());
    const wd = w.deliveryDay.getUTCDay();
    assert.ok(wd >= 1 && wd <= 5, `delivery on a weekend at ${now.toISOString()}`);
  }
});

// ── state machine ───────────────────────────────────────────────────────────

test('the countdown is live EVERY hour of the week: "today" before the cutoff, "next" after it', () => {
  assert.equal(state(uae('2026-09-21', '00:01:00')), 'today');
  assert.equal(state(uae('2026-09-21', '08:00:00')), 'today');
  assert.equal(state(uae('2026-09-21', '13:58:59')), 'today');
  assert.equal(state(uae('2026-09-21', '13:59:00')), 'next', 'flips one minute EARLY, never late');
  assert.equal(state(uae('2026-09-21', '14:00:00')), 'next');
  assert.equal(state(uae('2026-09-21', '22:30:00')), 'next', 'evening: the main Instagram traffic');
  assert.equal(state(uae('2026-09-26', '12:00:00')), 'next', 'Saturday');
  assert.equal(state(uae('2026-09-27', '23:59:00')), 'next', 'Sunday night');
});

test('what the timer shows is the real time to the real next cutoff', () => {
  // Monday 11:45:51 → 2h 14m 09s to the 2PM cutoff (the 60s guard affects the flip, not the target)
  assert.deepEqual(countdownParts(dispatchWindow(uae('2026-09-21', '11:45:51'), NONE).msLeft),
    { days: 0, hours: 2, minutes: 14, seconds: 9 });
  // Saturday noon → Monday 2PM is 2 days and 2 hours away, and it delivers Tuesday
  const sat = dispatchWindow(uae('2026-09-26', '12:00:00'), NONE);
  assert.deepEqual(countdownParts(sat.msLeft), { days: 2, hours: 2, minutes: 0, seconds: 0 });
  assert.equal(dayLabel(sat.deliveryDay, false), 'Tuesday');
  // Friday evening → Monday 2PM; delivery Tuesday, four days out: never "tomorrow"
  const fri = dispatchWindow(uae('2026-09-25', '20:00:00'), NONE);
  assert.deepEqual(countdownParts(fri.msLeft), { days: 2, hours: 18, minutes: 0, seconds: 0 });
  assert.equal(fri.deliveryInDays, 4);
  // floored, never over-stated; never negative
  assert.deepEqual(countdownParts(1999), { days: 0, hours: 0, minutes: 0, seconds: 1 });
  assert.deepEqual(countdownParts(-5), { days: 0, hours: 0, minutes: 0, seconds: 0 });
});

test('the timer only changes colour in the last hour before a cutoff that is TODAY', () => {
  const urgent = (now: Date) => {
    const w = dispatchWindow(now, NONE);
    return state(now) === 'today' && w.msLeft <= URGENT_MS;
  };
  assert.equal(urgent(uae('2026-09-21', '12:59:00')), false);
  assert.equal(urgent(uae('2026-09-21', '13:00:00')), true);
  assert.equal(urgent(uae('2026-09-21', '13:58:00')), true);
  assert.equal(urgent(uae('2026-09-21', '14:30:00')), false, 'after the cutoff the next one is a day away');
  assert.equal(urgent(uae('2026-09-27', '13:30:00')), false, 'Sunday 1:30PM is NOT half an hour from a cutoff');
});

test('safe mode: kill switch, unproven stock, and past VERIFIED_THROUGH', () => {
  const noon = uae('2026-09-21', '12:00:00');
  assert.equal(state(noon, { mode: 'safe' }), 'safe');
  assert.equal(state(noon, { stockOk: false }), 'safe');
  assert.equal(state(noon, { verifiedThrough: '2026-09-21' }), 'safe', 'delivery day is past the verified range');
  assert.equal(state(noon, { verifiedThrough: '2026-09-22' }), 'today');
  // The shipped constants: live today, safe once the holiday list runs out
  assert.ok(VERIFIED_THROUGH >= '2026-12-31');
  assert.equal(dispatchState(dispatchWindow(uae('2027-03-01', '10:00:00'))), 'safe');
});

// ── formatting ──────────────────────────────────────────────────────────────

test('time left is floored to the minute — never over-stated', () => {
  assert.deepEqual(hoursMinutes(((2 * 60 + 14) * 60 + 59) * 1000), { hours: 2, minutes: 14 });
  assert.deepEqual(hoursMinutes(59_999), { hours: 0, minutes: 0 });
  assert.deepEqual(hoursMinutes(-5), { hours: 0, minutes: 0 });
});

test('day labels localize, keep Latin digits, and add the date for long closures', () => {
  const tue = new Date(Date.UTC(2026, 8, 22));
  assert.equal(dayLabel(tue, false), 'Tuesday');
  assert.equal(dayLabel(tue, true), 'الثلاثاء');
  assert.equal(dayLabel(tue, false, true), 'Tuesday 22 September');
  assert.match(dayLabel(tue, true, true), /22/, 'Latin digits in Arabic');
  assert.doesNotMatch(dayLabel(tue, true, true), /[٠-٩]/);
});

test('"today"/"tomorrow" only when the device is on the UAE date', () => {
  const now = uae('2026-09-21', '09:00:00');
  const w = dispatchWindow(now, NONE);
  // A device in Dubai (or anywhere on the same calendar date) — uses local getters
  const sameDate = new Date(2026, 8, 21, 9, 0, 0);
  assert.equal(deviceOnUaeDate(sameDate, w), true);
  assert.equal(deviceOnUaeDate(new Date(2026, 8, 20, 23, 0, 0), w), false);
});

// ── the ticking text ────────────────────────────────────────────────────────

import { dispatchDuration } from './translations.ts';

test('English SPOKEN duration is words — a speech engine reads "36m" as "36 metres"', () => {
  assert.equal(dispatchDuration(2, 14, false), '2 hours 14 minutes');
  assert.equal(dispatchDuration(1, 1, false), '1 hour 1 minute');
  assert.equal(dispatchDuration(0, 42, false), '42 minutes');
  assert.equal(dispatchDuration(6, 0, false), '6 hours');
  assert.equal(dispatchDuration(0, 0, false), '0 minutes');
  for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m++) {
    assert.doesNotMatch(dispatchDuration(h, m, false, 1), /\d[dhm]\b/, 'no abbreviations');
  }
});

test('Arabic duration follows the count grammar — singular, dual, plural, then singular again', () => {
  assert.equal(dispatchDuration(1, 0, true), 'ساعة');
  assert.equal(dispatchDuration(2, 14, true), 'ساعتين و14 دقيقة');
  assert.equal(dispatchDuration(3, 1, true), '3 ساعات ودقيقة');
  assert.equal(dispatchDuration(5, 2, true), '5 ساعات ودقيقتين');
  assert.equal(dispatchDuration(1, 7, true), 'ساعة و7 دقائق');
  assert.equal(dispatchDuration(0, 10, true), '10 دقائق');
  assert.equal(dispatchDuration(0, 11, true), '11 دقيقة');
  assert.equal(dispatchDuration(0, 42, true), '42 دقيقة');
  // hours past ten take the singular again (the old window never reached them)
  assert.equal(dispatchDuration(11, 0, true), '11 ساعة');
  assert.equal(dispatchDuration(22, 50, true), '22 ساعة و50 دقيقة');
  // days: only on evenings and weekends, never more than three
  assert.equal(dispatchDuration(22, 50, false, 1), '1 day 22 hours 50 minutes');
  assert.equal(dispatchDuration(0, 5, false, 2), '2 days 5 minutes');
  assert.equal(dispatchDuration(22, 50, true, 1), 'يوم و22 ساعة و50 دقيقة');
  assert.equal(dispatchDuration(2, 0, true, 2), 'يومين وساعتين');
  assert.equal(dispatchDuration(0, 0, true, 3), '3 أيام');
  // Latin digits only — these lines must never mix digit systems
  for (let h = 0; h <= 6; h++) for (let m = 0; m < 60; m++) {
    assert.doesNotMatch(dispatchDuration(h, m, true), /[٠-٩]/);
  }
});

test('across a whole week the countdown is always positive and never longer than a long weekend', () => {
  for (let min = 0; min < 7 * 24 * 60; min += 7) {
    const now = new Date(Date.UTC(2026, 8, 21, 0, min, 0));
    const w = dispatchWindow(now, NONE);
    assert.ok(w.msLeft > 0, now.toISOString());
    // Friday 2PM → Monday 2PM is the longest gap: exactly 3 days
    assert.ok(w.msLeft <= 3 * 24 * 60 * 60 * 1000, now.toISOString());
  }
});
