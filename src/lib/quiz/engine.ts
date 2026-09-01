// "Find Your Chako" — scoring and resolution.
//
// PURE MODULE. No React, no `@/` path aliases, no browser globals — so
// `node --test` can import it directly and the test file exercises exactly the
// code the site runs, not a copy of it.
//
// The resolution order below is the brief's §5, literally. Two of the results
// (Twist, BaBa) were previously unreachable because an earlier order collapsed
// them into other branches; that was a real bug. Do not reorder these steps
// without re-running engine.test.ts, which asserts every result is reachable.
//
// Historical note worth keeping: the reference implementation had a helper
// named `top` that collided with the browser global `window.top` and threw at
// parse time. Nothing here is named `top`.

import {
  QUESTIONS,
  KIDS_QUESTIONS,
  Q1,
  RESULTS,
  type AgeKey,
  type CapKey,
  type L,
  type LiningKey,
  type NeedKey,
  type QuizOption,
  type Result,
  type SeriesKey,
  type TierKey,
} from './config.ts';

export const SERIES_KEYS: readonly SeriesKey[] = [
  'kada', 'bawang', 'milkpod', 'bobo', 'pangpang',
  'linlin', 'twist', 'baba', 'carrygo', 'split',
];

export const LINING_KEYS: readonly LiningKey[] = ['steel', 'ceramic', 'titanium'];

// Tie-break order for the series axis, mirroring the resolution order below so
// a tie resolves the same way the steps would. Without a fixed order, ties fall
// to object key order and the engine stops being deterministic.
const SERIES_PRIORITY: readonly SeriesKey[] = [
  'linlin', 'pangpang', 'twist', 'carrygo', 'split',
  'bawang', 'baba', 'milkpod', 'bobo', 'kada',
];

/** Series too large to serve to someone who asked for ~500ml. */
const LARGE_SERIES: ReadonlySet<SeriesKey> = new Set<SeriesKey>(['bawang', 'baba', 'carrygo']);

/** Series a stated "1L+" is allowed to resolve to. CarryGo (870ml) is not one. */
const LARGE_ELIGIBLE: readonly SeriesKey[] = ['bawang', 'baba'];

/**
 * Series that actually have a ceramic variant, per the brief's §3 matrix.
 *
 * Kada is deliberately absent even though a 'Kada Bottle 700ml Ceramic'
 * (AED 199) launched late Aug 2026 — Ahmad ruled on 31 Aug 2026 to keep the
 * brief's routing (ceramic-leaning Kada types fall back to MilkPod/BaWang
 * Ceramic, which are valid in-stock products) rather than patch in a new
 * persona mid-audit. Revisit when the ceramic Kada earns its own result.
 */
const CERAMIC_CAPABLE: readonly SeriesKey[] = ['bawang', 'milkpod', 'bobo', 'linlin', 'twist'];

/** questionId → chosen optionId, or optionIds for the multi-select Q11. */
export type Answers = Readonly<Record<string, string | readonly string[]>>;

export interface Scored {
  readonly series: Record<SeriesKey, number>;
  readonly lining: Record<LiningKey, number>;
  readonly cap: CapKey | null;
  readonly tier: TierKey | null;
  readonly brew: boolean;
  readonly gift: boolean;
  readonly path: 'main' | 'kids';
  readonly age: AgeKey | null;
  readonly need: NeedKey | null;
  readonly pairings: readonly L[];
}

const ALL_QUESTIONS = [Q1, ...KIDS_QUESTIONS, ...QUESTIONS];

function findOption(questionId: string, optionId: string): QuizOption | undefined {
  return ALL_QUESTIONS.find((q) => q.id === questionId)?.options.find((o) => o.id === optionId);
}

export function score(answers: Answers): Scored {
  const series = Object.fromEntries(SERIES_KEYS.map((k) => [k, 0])) as Record<SeriesKey, number>;
  const lining = Object.fromEntries(LINING_KEYS.map((k) => [k, 0])) as Record<LiningKey, number>;

  let cap: CapKey | null = null;
  let tier: TierKey | null = null;
  let brew = false;
  let gift = false;
  let path: 'main' | 'kids' = 'main';
  let age: AgeKey | null = null;
  let need: NeedKey | null = null;
  const pairings: L[] = [];

  for (const [questionId, raw] of Object.entries(answers)) {
    const chosen = Array.isArray(raw) ? raw : [raw as string];
    for (const optionId of chosen) {
      const opt = findOption(questionId, optionId);
      if (!opt) continue;

      for (const [k, v] of Object.entries(opt.series ?? {})) series[k as SeriesKey] += v;
      for (const [k, v] of Object.entries(opt.lining ?? {})) lining[k as LiningKey] += v;

      if (opt.cap) cap = opt.cap;
      if (opt.tier) tier = opt.tier;
      if (opt.brew) brew = true;
      if (opt.gift) gift = true;
      if (opt.path) path = opt.path;
      if (opt.age) age = opt.age;
      if (opt.need) need = opt.need;
      if (opt.pairing) pairings.push(opt.pairing);
    }
  }

  return { series, lining, cap, tier, brew, gift, path, age, need, pairings };
}

/** Highest-scoring series, ties broken by SERIES_PRIORITY. Null if nothing scored. */
function leadingSeries(series: Record<SeriesKey, number>): SeriesKey | null {
  let best: SeriesKey | null = null;
  let bestScore = 0;
  for (const key of SERIES_PRIORITY) {
    if (series[key] > bestScore) {
      best = key;
      bestScore = series[key];
    }
  }
  return best;
}

function resolveKids(age: AgeKey | null, need: NeedKey | null): Result {
  // Under 6: PPSU unless cold is the stated non-negotiable, because PPSU will
  // not hold cold through a hot day.
  if (age === 'toddler' || age === 'young') {
    return need === 'cold' ? RESULTS['little-one-steel'] : RESULTS['little-one-ppsu'];
  }
  // 7–12. The "looks cool" route is deliberate: at this age the child chooses,
  // and the best kids bottle is the one that does not get abandoned in a locker.
  if (need === 'cool') return RESULTS['little-one-milkpod'];
  if (need === 'light') return RESULTS['little-one-ppsu'];
  return RESULTS['little-one-steel'];
}

export function resolve(s: Scored): Result {
  // 1 — kids path
  if (s.path === 'kids') return resolveKids(s.age, s.need);

  // 2 — hard override: matcha/loose leaf always means glass
  if (s.brew) return RESULTS.brewer;

  // 3 — budget floor. The adult entry tier, NOT the kids PPSU.
  if (s.tier === 'low') return RESULTS['sensible-one'];

  // 4 — budget outranks the weight preference. Someone who says AED 140–200
  //     and also says they notice every gram gets steel, not an AED 349 surprise.
  const titanium = s.tier === 'mid' ? 0 : s.lining.titanium;

  // 5
  if (titanium >= 3) return RESULTS.featherweight;

  // 6 — capacity is a HARD constraint, applied before anything else uses the
  //     winning series. A stated capacity must never lose to a carry or
  //     aesthetic preference.
  let winner = leadingSeries(s.series);
  if (s.cap === 'large' && (!winner || !LARGE_ELIGIBLE.includes(winner))) {
    winner = s.series.baba >= s.series.bawang ? 'baba' : 'bawang';
  }
  if (s.cap === 'small' && winner && LARGE_SERIES.has(winner)) {
    winner = 'milkpod';
  }

  // 7, 8, 9 — series that resolve regardless of lining.
  //   LinLin and PangPang have their own linings; Twist is ceramic-coated only,
  //   so a Twist win needs no lining branch.
  if (winner === 'linlin') return RESULTS.host;
  if (winner === 'pangpang') return RESULTS.brewer;
  if (winner === 'twist') return RESULTS['switch-up'];

  // 10 — the lining axis. Ceramic must beat steel outright: ties are common
  //      (Q2 "all of the above" and Q10 mid both add +1 to each) and steel is
  //      the safer landing — it is the lining that forgives a neglecter.
  if (s.lining.ceramic > s.lining.steel && s.lining.ceramic > 0) {
    // Kada, BaBa, CarryGo and Split have no ceramic variant. Rather than dump
    // every one of them on the large ceramic tumbler, hand the win to the
    // best-scoring series that CAN be ceramic — which is the brief's own
    // "fallbacks when a combination does not exist" table (§3): small/bag
    // answers land on MilkPod Ceramic, large/carry ones on BaWang Ceramic.
    //
    // This is load-bearing since CarryGo was added. CarryGo can out-score Twist
    // on the series axis (9 vs 7 for a mid-capacity mode-switcher), which knocks
    // Twist out before step 9; without this fallback a coffee drinker who asked
    // to switch modes was handed an 1100ml BaWang instead of the Twist the
    // brief intends. No point value changed — only where a steel-only win goes.
    const ceramicWinner = CERAMIC_CAPABLE.reduce<SeriesKey | null>(
      (best, k) => (s.series[k] > (best ? s.series[best] : 0) ? k : best),
      null
    );
    let target = winner && CERAMIC_CAPABLE.includes(winner) ? winner : ceramicWinner;

    // The capacity constraint applies HERE too. Step 6 clamps `winner`, but a
    // non-ceramic-capable winner hands the branch to ceramicWinner, computed
    // from raw scores — which quietly resold a stated "1L+" as a 520ml MilkPod
    // and a stated "~500ml" as the 1100ml BaWang (722 of the 86,400 possible
    // answer paths, all through the core coffee/juice segment; caught by the
    // launch audit's exhaustive sweep). Brief §3's fallback table is cap-aware:
    // large ceramic is always BaWang Ceramic, and small never is.
    if (s.cap === 'large') target = 'bawang';
    if (s.cap === 'small' && target === 'bawang') target = 'milkpod';

    if (target === 'milkpod') return RESULTS['cafe-ritualist-small'];
    if (target === 'bobo') return RESULTS['desk-setter-ceramic'];
    if (target === 'twist') return RESULTS['switch-up'];
    if (target === 'linlin') return RESULTS.host;
    return RESULTS['cafe-ritualist-large'];
  }

  // 11, 12 — new series, steel only, so they sit after the ceramic branch.
  if (winner === 'carrygo') return RESULTS['one-hander'];
  if (winner === 'split') return RESULTS['straw-purist'];

  // 13–16
  if (winner === 'bawang') return RESULTS['long-hauler'];
  if (winner === 'baba') return RESULTS.reservoir;
  if (winner === 'milkpod') return RESULTS['pocket-pod'];
  if (winner === 'bobo') return RESULTS['desk-setter'];

  // 17 — deliberately Kada. If someone answers contradictorily, a mid-priced
  //      steel water bottle is the least likely thing to be returned.
  return RESULTS['daily-driver'];
}

export interface QuizOutcome {
  readonly result: Result;
  readonly scored: Scored;
  /** GA4 payload, per the brief §8. */
  readonly analytics: { persona: string; series: string; lining: string };
}

export function runQuiz(answers: Answers): QuizOutcome {
  const scored = score(answers);
  const result = resolve(scored);
  return {
    result,
    scored,
    analytics: { persona: result.persona.en, series: result.series, lining: result.lining },
  };
}

/** Ordered questions for a given path, for the UI to walk. */
export function questionsFor(path: 'main' | 'kids'): readonly { id: string }[] {
  return path === 'kids' ? KIDS_QUESTIONS : QUESTIONS;
}
