// Run with:  npm run test:quiz     (node --test, no dependencies)
//
// Ports the prototype's validation, per the handoff:
//   - a randomised reachability sweep asserting every result can be produced,
//     with zero runtime errors and zero paths failing to reach a result;
//   - the ten targeted scenario paths from brief §10, plus two new ones for
//     CarryGo and Split Cup.
//
// If a scenario fails, FIX THE SCENARIO OR REPORT IT — do not tune the scoring
// to make it pass. The point values were validated across 1,200 paths and
// changing them silently reintroduces bugs that only surface when a customer
// receives the wrong bottle.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { runQuiz, score, resolve, type Answers } from './engine.ts';
import { ALL_RESULT_IDS, KIDS_QUESTIONS, Q1, QUESTIONS, RESULTS } from './config.ts';

// Deterministic PRNG (mulberry32). A seeded sweep fails reproducibly; Math.random
// would give a test that passes on CI and fails on someone's laptop.
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomPath(rand: () => number): Answers {
  const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(rand() * xs.length)];
  const answers: Record<string, string | string[]> = {};

  const first = pick(Q1.options);
  answers[Q1.id] = first.id;

  if (first.path === 'kids') {
    let droppedToMain = false;
    for (const q of KIDS_QUESTIONS) {
      const opt = pick(q.options);
      answers[q.id] = opt.id;
      if (opt.path === 'main') droppedToMain = true;
    }
    // "13 or older" drops back into the main path at Q2.
    if (!droppedToMain) return answers;
  }

  for (const q of QUESTIONS) {
    if (q.multi) {
      const chosen = q.options.filter(() => rand() < 0.35).map((o) => o.id);
      if (chosen.length) answers[q.id] = chosen;
    } else {
      answers[q.id] = pick(q.options).id;
    }
  }
  return answers;
}

test('reachability sweep — every result is produced, no path fails', () => {
  const RUNS = 5000;
  const rand = rng(20260831);
  const seen = new Map<string, number>();

  for (let i = 0; i < RUNS; i++) {
    const answers = randomPath(rand);
    const { result, analytics } = runQuiz(answers);

    assert.ok(result, `run ${i} produced no result`);
    assert.ok(result.id in RESULTS, `run ${i} produced unknown result "${result.id}"`);
    // The GA4 payload must always be complete — an empty field silently poisons
    // the merchandising signal this quiz exists to generate.
    assert.ok(analytics.persona && analytics.series && analytics.lining, `run ${i} incomplete analytics`);
    // Result CTAs must be collection handles, never product handles.
    assert.ok(!result.collection.startsWith('chako'), `run ${i} links to a product, not a collection`);

    seen.set(result.id, (seen.get(result.id) ?? 0) + 1);
  }

  const unreachable = ALL_RESULT_IDS.filter((id) => !seen.has(id));
  assert.deepEqual(
    unreachable,
    [],
    `unreachable results: ${unreachable.join(', ')} — a result no answer path can produce is the exact bug that hid Twist and BaBa in v1`
  );

  // Distribution is printed, not asserted. Random answering over-represents
  // Titanium and PangPang by construction (two of four budget options and one
  // of three weight options feed titanium; one of five drink options is a hard
  // PangPang override). This is a reachability test, not a forecast.
  const dist = Array.from(seen.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id, n]) => `${id} ${((n / RUNS) * 100).toFixed(1)}%`)
    .join('  ');
  console.log(`    distribution over ${RUNS} runs: ${dist}`);
});

// ─── Scenario paths ───────────────────────────────────────────────────────────

const scenarios: { name: string; expect: string; answers: Answers }[] = [
  {
    name: 'toddler',
    expect: 'little-one-ppsu',
    answers: { q1: 'kid', k1: 'toddler', k2: 'nursery', k3: 'light' },
  },
  {
    name: 'toddler who needs it cold',
    expect: 'little-one-steel',
    answers: { q1: 'kid', k1: 'young', k2: 'school', k3: 'cold' },
  },
  {
    name: 'large volume, with cup holder',
    expect: 'long-hauler',
    answers: {
      q1: 'me', q2: 'water', q3: 'large', q4: 'cupholder-desk', q5: 'cupholder',
      q6: 'lid', q7: 'no', q8: 'neglect', q9: 'neutral', q10: 'mid',
    },
  },
  {
    name: 'large volume, no cup holder',
    expect: 'reservoir',
    answers: {
      q1: 'me', q2: 'water', q3: 'large', q4: 'office', q5: 'handle',
      q6: 'lid', q7: 'no', q8: 'neglect', q9: 'loud', q10: 'mid',
    },
  },
  {
    name: 'small-format coffee',
    expect: 'cafe-ritualist-small',
    answers: {
      q1: 'me', q2: 'coffee', q3: 'small', q4: 'tote', q5: 'bag',
      q6: 'straw', q7: 'no', q8: 'rinse', q9: 'pastel', q10: 'mid',
    },
  },
  {
    name: 'desk coffee',
    expect: 'desk-setter-ceramic',
    answers: {
      q1: 'me', q2: 'coffee', q3: 'small', q4: 'office', q5: 'bag',
      q6: 'lid', q7: 'no', q8: 'rinse', q9: 'neutral', q10: 'mid',
    },
  },
  {
    name: 'hot-and-iced switcher',
    expect: 'switch-up',
    answers: {
      q1: 'me', q2: 'coffee', q3: 'small', q4: 'cupholder-desk', q5: 'cupholder',
      q6: 'switch', q7: 'no', q8: 'rinse', q9: 'neutral', q10: 'mid',
    },
  },
  {
    name: 'matcha (hard override)',
    expect: 'brewer',
    answers: {
      q1: 'me', q2: 'brew', q3: 'large', q4: 'gym', q5: 'handle',
      q6: 'lid', q7: 'no', q8: 'neglect', q9: 'loud', q10: 'high',
    },
  },
  {
    name: 'weight-sensitive',
    expect: 'featherweight',
    answers: {
      q1: 'me', q2: 'water', q3: 'small', q4: 'tote', q5: 'bag',
      q6: 'lid', q7: 'lightest', q8: 'neglect', q9: 'metallic', q10: 'high',
    },
  },
  {
    name: 'home host',
    expect: 'host',
    answers: {
      q1: 'me', q2: 'coffee', q3: 'mid', q4: 'kitchen', q5: 'handle',
      q6: 'lid', q7: 'no', q8: 'rinse', q9: 'loud', q10: 'mid',
    },
  },
  {
    name: 'budget floor',
    expect: 'sensible-one',
    answers: {
      q1: 'me', q2: 'water', q3: 'mid', q4: 'gym', q5: 'handle',
      q6: 'lid', q7: 'no', q8: 'neglect', q9: 'loud', q10: 'low',
    },
  },
  // New series
  {
    name: 'CarryGo — big-ish, handled, mode-switching, water',
    expect: 'one-hander',
    answers: {
      q1: 'me', q2: 'water', q3: 'mid', q4: 'cupholder-desk', q5: 'handle',
      q6: 'switch', q7: 'no', q8: 'neglect', q9: 'loud', q10: 'mid',
    },
  },
  {
    name: 'Split Cup — straw-first, bag-carried, water',
    expect: 'straw-purist',
    answers: {
      q1: 'me', q2: 'water', q3: 'mid', q4: 'tote', q5: 'bag',
      q6: 'straw', q7: 'no', q8: 'rinse', q9: 'loud', q10: 'mid',
    },
  },
];

for (const s of scenarios) {
  test(`scenario: ${s.name} → ${s.expect}`, () => {
    const { result } = runQuiz(s.answers);
    assert.equal(result.id, s.expect);
  });
}

// ─── Guards on the rules most likely to drift ────────────────────────────────

test('budget outranks the weight preference', () => {
  const gramCounterOnAMidBudget: Answers = {
    q1: 'me', q2: 'water', q3: 'small', q4: 'tote', q5: 'bag',
    q6: 'lid', q7: 'lightest', q8: 'neglect', q9: 'metallic', q10: 'mid',
  };
  const { result } = runQuiz(gramCounterOnAMidBudget);
  assert.notEqual(result.id, 'featherweight', 'AED 140–200 must not produce an AED 349 titanium result');
});

// The capacity guards iterate q2 AND q8 as well: the launch audit proved the
// original water-only version never exercised the ceramic branch, which had
// its own capacity bypass — 722 of 86,400 paths shipped a wrong-size product
// while 29 tests stayed green. Coffee + daily-rinse is the ceramic segment.
test('a stated 1L+ never resolves to a small bottle — steel AND ceramic paths', () => {
  for (const q2 of ['water', 'coffee', 'juice', 'all']) {
    for (const q4 of ['cupholder-desk', 'gym', 'tote', 'kitchen', 'office']) {
      for (const q5 of ['handle', 'strap', 'bag', 'cupholder']) {
        for (const q6 of ['straw', 'lid', 'switch']) {
          for (const q8 of ['rinse', 'neglect']) {
            const { result } = runQuiz({
              q1: 'me', q2, q3: 'large', q4, q5, q6,
              q7: 'no', q8, q9: 'loud', q10: 'mid',
            });
            assert.ok(
              ['long-hauler', 'reservoir', 'cafe-ritualist-large'].includes(result.id),
              `1L+ with ${q2}/${q4}/${q5}/${q6}/${q8} resolved to ${result.id}`
            );
          }
        }
      }
    }
  }
});

test('a stated ~500ml never resolves to an 870ml or larger bottle — steel AND ceramic paths', () => {
  // 1100ml cafe-ritualist-large joins the forbidden set: the original test
  // omitted it, which is exactly where the ceramic bypass hid.
  for (const q2 of ['water', 'coffee', 'juice', 'all']) {
    for (const q4 of ['cupholder-desk', 'gym', 'tote', 'kitchen', 'office']) {
      for (const q5 of ['handle', 'strap', 'bag', 'cupholder']) {
        for (const q6 of ['straw', 'lid', 'switch']) {
          for (const q8 of ['rinse', 'neglect']) {
            const { result } = runQuiz({
              q1: 'me', q2, q3: 'small', q4, q5, q6,
              q7: 'no', q8, q9: 'loud', q10: 'mid',
            });
            assert.ok(
              !['one-hander', 'long-hauler', 'reservoir', 'cafe-ritualist-large'].includes(result.id),
              `~500ml with ${q2}/${q4}/${q5}/${q6}/${q8} resolved to ${result.id}`
            );
          }
        }
      }
    }
  }
});

test('PangPang is winnable WITHOUT the matcha override (kitchen + straw route)', () => {
  // Adding Split Cup scoring silently killed this route (Split outran
  // PangPang's non-brew maximum on every path); Ahmad restored it on
  // 31 Aug 2026 via kitchen pangpang +2 → +3. This pins the route open.
  const { result } = runQuiz({
    q1: 'me', q2: 'water', q3: 'mid', q4: 'kitchen', q5: 'strap',
    q6: 'straw', q7: 'no', q8: 'neglect', q9: 'loud', q10: 'mid',
  });
  assert.equal(result.id, 'brewer');
});

test('a self-declared neglecter is never sent a ceramic lining', () => {
  for (const q2 of ['water', 'coffee', 'juice', 'all']) {
    const s = score({
      q1: 'me', q2, q3: 'mid', q4: 'office', q5: 'bag',
      q6: 'lid', q7: 'no', q8: 'neglect', q9: 'loud', q10: 'mid',
    });
    const result = resolve(s);
    assert.ok(
      !result.lining.includes('ceramic'),
      `"${q2}" + neglect produced ${result.id} (${result.lining})`
    );
  }
});

test('Twist still owns the mode-switch answer against CarryGo', () => {
  // The collision check. A coffee drinker who switches modes gets the
  // ceramic-coated Twist; a water drinker who wants volume gets CarryGo.
  const base = { q1: 'me', q3: 'mid', q4: 'cupholder-desk', q5: 'cupholder', q6: 'switch', q7: 'no', q9: 'loud', q10: 'mid' };
  assert.equal(runQuiz({ ...base, q2: 'coffee', q8: 'rinse' }).result.id, 'switch-up');
  assert.equal(runQuiz({ ...base, q2: 'water', q8: 'neglect', q5: 'handle' }).result.id, 'one-hander');
});

test('every result links to a real collection handle', () => {
  const KNOWN = new Set([
    'kada-bottles', 'bawang-cups', 'milk-pods', 'bobo-tumblers', 'pangpang-cups',
    'linlin-kettles', 'twist', 'titanium', 'more', 'carrygo-tumblers', 'split-cups',
  ]);
  for (const id of ALL_RESULT_IDS) {
    assert.ok(KNOWN.has(RESULTS[id].collection), `${id} → unknown collection "${RESULTS[id].collection}"`);
  }
});
