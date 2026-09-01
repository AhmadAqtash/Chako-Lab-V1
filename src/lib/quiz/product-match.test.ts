// Run with:  npm run test:quiz
//
// Guards the result → live-product mapping: every result must have a spec, and
// the ranking must never surface a sold-out card — that is the invariant that
// makes PDP-linking safe despite the brief's warning about dead product pages.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { MATCH_SPECS, rankMatches } from './product-match.ts';
import { ALL_RESULT_IDS } from './config.ts';

test('every quiz result has a product-match spec', () => {
  const missing = ALL_RESULT_IDS.filter((id) => !MATCH_SPECS[id]);
  assert.deepEqual(missing, [], `results with no spec: ${missing.join(', ')}`);
});

const P = (handle: string, title: string, inStock = true, price?: number) => ({
  handle,
  title,
  availableForSale: inStock,
  ...(price != null ? { priceRange: { minVariantPrice: { amount: String(price) } } } : {}),
});

test('rankMatches drops sold-out products entirely', () => {
  const ranked = rankMatches('one-hander', [
    P('carrygo-white', 'CarryGo Tumbler 870ml (White)', false),
    P('carrygo-purple', 'CarryGo Tumbler 870ml (Purple)', true),
  ]);
  assert.deepEqual(ranked.map((p) => p.handle), ['carrygo-purple']);
});

test('rankMatches returns [] when the whole family is sold out', () => {
  const ranked = rankMatches('straw-purist', [
    P('split-white', 'Split Cup 570ml (White)', false),
    P('split-pink', 'Split Cup 570ml (Pink)', false),
  ]);
  assert.deepEqual(ranked, []);
});

test('include/exclude carve the family correctly', () => {
  // 'Tumbler' term-matching pulls CarryGo in with Twist — the include must
  // filter it back out, and the exclude must drop the Twist HANDLE accessory.
  const ranked = rankMatches('switch-up', [
    P('carrygo-870', 'CarryGo Tumbler 870ml (White)'),
    P('twist-tumbler-handle-pink', 'Twist Tumbler Handle (Pink Purple)'),
    P('twist-tumbler-blue', 'Twist Tumbler (Blue & Pink)'),
  ]);
  assert.deepEqual(ranked.map((p) => p.handle), ['twist-tumbler-blue']);
});

test('steel specs exclude ceramic, titanium and Ti variants', () => {
  const ranked = rankMatches('long-hauler', [
    P('bawang-ceramic', 'Bawang Tumbler Ceramic (Cream)'),
    P('bawang-ti-frosty', 'Bawang Ti Tumbler Titanium Frosty (Yellow)'),
    P('bawang-steel', 'Bawang Cup (Yellow & Blue)'),
  ]);
  assert.deepEqual(ranked.map((p) => p.handle), ['bawang-steel']);
});

test('Q9 look preference reorders colourways without excluding any', () => {
  const family = [
    P('split-yellow', 'Split Cup 570ml (Yellow)'),
    P('split-silver', 'Split Cup 570ml (Silver)'),
    P('split-pink', 'Split Cup 570ml (Pink)'),
  ];
  assert.equal(rankMatches('straw-purist', family, 'neutral')[0].handle, 'split-silver');
  assert.equal(rankMatches('straw-purist', family, 'pastel')[0].handle, 'split-pink');
  // No preference → BEST_SELLING order stands.
  assert.equal(rankMatches('straw-purist', family)[0].handle, 'split-yellow');
  // Preference never shrinks the pool.
  assert.equal(rankMatches('straw-purist', family, 'neutral').length, 3);
});

test('prefer outranks colour preference (Reservoir leads with the 1180ml)', () => {
  const ranked = rankMatches('reservoir', [
    P('baba-960-white', 'BaBa Cup 960ml (White)'),
    P('baba-1180-green', 'BaBa Cup 1180ml (Green)'),
  ], 'neutral');
  assert.equal(ranked[0].handle, 'baba-1180-green');
});

test('in-stock status always outranks a preferred variant', () => {
  const ranked = rankMatches('reservoir', [
    P('baba-1180-green', 'BaBa Cup 1180ml (Green)', false),
    P('baba-960-white', 'BaBa Cup 960ml (White)', true),
  ]);
  assert.deepEqual(ranked.map((p) => p.handle), ['baba-960-white']);
});

test('unknown result id ranks nothing', () => {
  assert.deepEqual(rankMatches('nonexistent', [P('x', 'X')]), []);
});

test('sensible-one selects by price ceiling and prefers the 700ml the copy names', () => {
  // Mirrors the live tier: the AED-99 700ml PPSU carries no material token in
  // title or handle, so only the price ceiling can admit it while keeping the
  // AED-179+ steel 700ml out.
  const kadas = [
    P('kada-bottle-550ml-taro-coco', 'Kada Bottle 550ml (Taro Coco)', true, 169),
    P('kada-bottle-500ml-ppsu-pink-green', 'Kada Bottle 500ml PPSU (Pink & Green)', true, 99),
    P('kada-bottle-700ml-white-blue', 'Kada Bottle 700ml (White & Blue)', true, 99),
    P('kada-bottle-700ml-pink-guava', 'Kada Bottle 700ml (Pink Guava)', true, 179),
    P('kada-bottle-700ml-ceramic-black', 'Kada Bottle 700ml Ceramic (Black)', true, 199),
  ];
  const ranked = rankMatches('sensible-one', kadas);
  assert.equal(ranked[0].handle, 'kada-bottle-700ml-white-blue', 'the AED-99 700ml leads');
  assert.ok(!ranked.some((p) => p.handle === 'kada-bottle-700ml-pink-guava'), 'AED-179 steel excluded');
  assert.ok(!ranked.some((p) => p.handle === 'kada-bottle-550ml-taro-coco'), 'AED-169 steel excluded');
});

test('a price-gated spec excludes products whose price is unknown', () => {
  // maxPrice must never guess: no price on the object → out.
  const ranked = rankMatches('sensible-one', [P('kada-mystery', 'Kada Bottle Mystery')]);
  assert.deepEqual(ranked, []);
});

test('host excludes the Tritan plastic kettles that would sit under a 36H COLD pill', () => {
  const ranked = rankMatches('host', [
    P('linlin-kettle-plastic-yellow', 'LinLin Kettle Plastic (Yellow)'),
    P('linlin-kettle-stainless-strap-orange', 'LinLin Kettle Stainless Strap (Orange)'),
    P('linlin-kettle-green-pink', 'LinLin Kettle (Green & Pink)'),
  ]);
  assert.deepEqual(ranked.map((p) => p.handle), ['linlin-kettle-green-pink']);
});
