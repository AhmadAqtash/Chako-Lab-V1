// Run with:  npm test
//
// Guards the honesty rules behind the conversion widgets: sold counts are
// always strictly below the real figure, the free-shipping bar never
// under-asks or unlocks early, the review quote is never edited and never
// carries a claim, and the cart slider never offers an accessory.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { floorNice, publishable, soldProof, SALES_SNAPSHOT, SERIES_MIN, SOLD_CUSHION } from './sales-proof.ts';
import { freeShippingProgress, unlocksWith, shippingBasis, FREE_SHIPPING_THRESHOLD } from './shipping-config.ts';
import { pickReviewQuote } from './review-quote.ts';
import { buildUpsellPool, orderUpsell, type UpsellItem } from './cart-upsell.ts';

// ── sold proof ──────────────────────────────────────────────────────────────

test('floorNice only ever rounds DOWN', () => {
  assert.equal(floorNice(283), 280);
  assert.equal(floorNice(280), 280);
  assert.equal(floorNice(1909), 1900);
  assert.equal(floorNice(9), 0);
  for (let n = 0; n < 5000; n += 7) assert.ok(floorNice(n) <= n, String(n));
});

test('every published number is STRICTLY below the real one, by at least the cushion', () => {
  // Arabic «أكثر من N» means strictly more than N, and a net-of-returns figure
  // can fall inside the 15-day return window — "N+" with N == real is not safe.
  for (const [type, real] of Object.entries(SALES_SNAPSHOT.byType)) {
    const p = soldProof(type);
    assert.ok(p, type);
    if (p.kind === 'series') {
      assert.ok(real >= SERIES_MIN, `${type} shown per-series below the minimum`);
      assert.ok(p.count <= real - SOLD_CUSHION, `${type}: claims ${p.count}, sold ${real}`);
      assert.ok(p.count < real);
    } else {
      assert.ok(real < SERIES_MIN, `${type} has ${real} units but fell back to brand`);
    }
  }
  const brand = publishable(SALES_SNAPSHOT.totalUnits);
  assert.ok(brand <= SALES_SNAPSHOT.totalUnits - SOLD_CUSHION);
});

test('the numbers on the site today', () => {
  assert.deepEqual(soldProof('PangPang Cup'), { kind: 'series', count: 270 });
  assert.deepEqual(soldProof('Bawang Cup'), { kind: 'series', count: 270 });
  assert.deepEqual(soldProof('LinLin Kettle'), { kind: 'series', count: 170 }, 'was exactly 180 — "180+" had no headroom');
  assert.deepEqual(soldProof('Kada Bottle'), { kind: 'series', count: 160 });
  assert.deepEqual(soldProof('Milk Pod'), { kind: 'series', count: 80 });
  assert.deepEqual(soldProof('Thermos Cup'), { kind: 'series', count: 80 });
});

test('small, mixed and unknown types get the brand line — never a borrowed number', () => {
  const brand = { kind: 'brand', count: 1900 };
  assert.deepEqual(soldProof('Split Cup'), brand);
  // 'Tumbler' lumps Twist + Bawang Lite + Dual-Layer Ti: a Bawang Lite page
  // must not show Bawang Cup's 270, nor a lumped Tumbler count
  assert.deepEqual(soldProof('Tumbler'), brand);
  assert.deepEqual(soldProof('Accessories'), brand);
  assert.deepEqual(soldProof('Pouch'), brand);
  assert.deepEqual(soldProof('Some New Series'), brand);
  assert.deepEqual(soldProof(undefined), brand);
});

// ── free-shipping maths ─────────────────────────────────────────────────────

test('free shipping unlocks AT the threshold; the ask is rounded up', () => {
  assert.deepEqual(freeShippingProgress(0), { unlocked: false, remaining: 250, ratio: 0 });
  assert.equal(freeShippingProgress(249.99).unlocked, false);
  assert.equal(freeShippingProgress(249.99).remaining, 1, 'never "AED 0 more"');
  assert.equal(freeShippingProgress(249.5).remaining, 1);
  assert.equal(freeShippingProgress(FREE_SHIPPING_THRESHOLD).unlocked, true, 'exactly 250.00 is free — Shopify’s rule is >=');
  assert.equal(freeShippingProgress(FREE_SHIPPING_THRESHOLD).remaining, 0);
  assert.equal(freeShippingProgress(900).ratio, 1);
  assert.equal(freeShippingProgress(NaN).remaining, 250);
  assert.equal(freeShippingProgress(149).remaining, 101);
});

test('unlocksWith is exact — AED 149 + AED 99 is 248, not free', () => {
  assert.equal(unlocksWith(149, 99), false);
  assert.equal(unlocksWith(149, 101), true);
  assert.equal(unlocksWith(99.5, 150.5), true);
  assert.equal(unlocksWith(0, 250), true);
});

test('the basis is the LOWER of subtotal and total, so a discount cannot fake an unlock', () => {
  const money = (amount: string) => ({ amount });
  assert.equal(shippingBasis({ subtotalAmount: money('260'), totalAmount: money('234') }), 234);
  assert.equal(shippingBasis({ subtotalAmount: money('199'), totalAmount: money('199') }), 199);
  assert.equal(shippingBasis({ subtotalAmount: money('199'), totalAmount: null }), 199);
  assert.equal(shippingBasis({ subtotalAmount: money('199'), totalAmount: money('0') }), 199, 'a zero total is not a discount');
});

// ── review quote ────────────────────────────────────────────────────────────

const R = (over: Partial<Parameters<typeof pickReviewQuote>[0][number]>) => ({
  uuid: 'u', rating: 5, body: 'Keeps my water cold all day and it looks adorable on my desk.',
  verifiedBuyer: true, reviewerName: 'Sara', writtenFor: null, ...over,
});

test('only whole, unedited, verified 5-star reviews are quotable', () => {
  assert.equal(pickReviewQuote([R({ rating: 4 })], false), null);
  assert.equal(pickReviewQuote([R({ verifiedBuyer: false })], false), null, 'unverified never');
  assert.equal(pickReviewQuote([R({ body: 'Nice product, love it' })], false), null, 'too short');
  assert.equal(pickReviewQuote([R({ body: 'a'.repeat(151) })], false), null, 'too long is skipped, never truncated');
  assert.equal(pickReviewQuote([R({ body: 'First paragraph here, which is long enough.\n\nSecond paragraph.' })], false), null);
  assert.equal(pickReviewQuote([R({})], false)?.text, 'Keeps my water cold all day and it looks adorable on my desk.');
});

test('a quote may not carry a claim the store cannot stand behind', () => {
  const skip = (body: string) => assert.equal(pickReviewQuote([R({ body })], false), null, body);
  skip('Lovely bottle and it arrived the very next day, so happy with it!');
  skip('Super fast delivery and the colour is exactly like the photos online.');
  skip('Great price for the quality, honestly cheaper than I expected it to be.');
  skip('Keeps ice for 2 days straight, my whole family is obsessed with it now.');
  skip('الكوب جميل جداً والتوصيل كان ممتازاً، أنصح الجميع بتجربته فعلاً.');
  skip('جودة ممتازة مقابل السعر، الكوب يحافظ على البرودة طوال اليوم.');
});

test('prefers the shopper’s language, then this colourway; ties are stable', () => {
  const ar = R({ uuid: 'ar', body: 'الكوب رائع جداً ويحافظ على برودة الماء طوال اليوم، أنصح به بشدة.' });
  const en = R({ uuid: 'en' });
  assert.equal(pickReviewQuote([en, ar], true)?.uuid, 'ar');
  assert.equal(pickReviewQuote([ar, en], false)?.uuid, 'en');

  const sibling = R({ uuid: 'sib', writtenFor: 'Pink & Purple' });
  assert.equal(pickReviewQuote([sibling, en], false)?.uuid, 'en');
  assert.equal(pickReviewQuote([sibling], false)?.writtenFor, 'Pink & Purple', 'attribution survives');

  const a = R({ uuid: 'aaa' }); const b = R({ uuid: 'bbb' });
  assert.equal(pickReviewQuote([b, a], false)?.uuid, 'aaa');
  assert.equal(pickReviewQuote([a, b], false)?.uuid, 'aaa');
});

test('a named reviewer beats an anonymous one', () => {
  const anon = R({ uuid: 'aaa', reviewerName: 'Anonymous' });
  const named = R({ uuid: 'zzz', reviewerName: 'Mariam' });
  assert.equal(pickReviewQuote([anon, named], false)?.uuid, 'zzz');
  assert.equal(pickReviewQuote([anon], false)?.uuid, 'aaa', 'anonymous is still quotable when it is all there is');
});

test('an owner pin wins only if it passes every rule', () => {
  const good = R({ uuid: 'good' });
  const pinnedOk = R({ uuid: 'pin', writtenFor: 'Blue', body: 'My daughter carries it to school every single day, she loves it.' });
  const pinnedBad = R({ uuid: 'bad', body: 'Arrived next day and the quality is honestly amazing, love it.' });
  assert.equal(pickReviewQuote([good, pinnedOk], false, 'pin')?.uuid, 'pin');
  assert.equal(pickReviewQuote([good, pinnedBad], false, 'bad')?.uuid, 'good', 'a pin cannot bypass the claim filter');
  assert.equal(pickReviewQuote([good], false, 'missing')?.uuid, 'good');
});

// ── cart slider: pool ───────────────────────────────────────────────────────

interface P { id: string; family: string; acc?: boolean; oos?: boolean; price?: string }
const item = (p: P, familyKey: string): UpsellItem => ({
  id: p.id, handle: p.id, title: p.id, image: null,
  price: { amount: p.price ?? '149', currencyCode: 'AED' }, variantId: `v-${p.id}`, familyKey,
});
const pool = (products: P[], perFamily = 2, maxFamilies = 16) =>
  buildUpsellPool(products, {
    familyOf: (p) => p.family,
    isAccessory: (p) => !!p.acc,
    inStock: (p) => !p.oos,
    toItem: item,
    perFamily, maxFamilies,
  });

const CATALOGUE: P[] = [
  { id: 'mouth-sticker', family: 'stickers', acc: true },
  { id: 'pang-yellow', family: 'pangpang' },
  { id: 'pang-pink', family: 'pangpang' },
  { id: 'pang-white', family: 'pangpang' },
  { id: 'bawang-silver', family: 'bawang', oos: true },
  { id: 'bawang-pink', family: 'bawang', price: '169' },
  { id: 'pouch', family: 'pouch', acc: true },
  { id: 'linlin-blue', family: 'linlin', price: '179' },
  { id: 'kada-ppsu', family: 'kada-ppsu', price: '99' },
  { id: 'milkpod-ti', family: 'milkpod-ti', price: '349' },
  { id: 'bobo-green', family: 'bobo', price: '139' },
];
const FAMILIES = Object.fromEntries(CATALOGUE.filter((p) => !p.acc).map((p) => [p.id, p.family]));
const ids = (list: UpsellItem[]) => list.map((i) => i.id);

test('the pool is drinkware only, in stock, at most two per family, best-selling order kept', () => {
  assert.deepEqual(ids(pool(CATALOGUE)), [
    'pang-yellow', 'pang-pink', 'bawang-pink', 'linlin-blue', 'kada-ppsu', 'milkpod-ti', 'bobo-green',
  ]);
  assert.deepEqual(ids(pool(CATALOGUE, 2, 1)), ['pang-yellow', 'pang-pink'], 'maxFamilies caps variety');
});

// ── cart slider: what THIS cart sees ────────────────────────────────────────

test('one PangPang in the cart: other families, ONE sibling at index 1, nothing in the cart, no AED 349 ambush', () => {
  const row = orderUpsell(pool(CATALOGUE), FAMILIES, [{ productId: 'pang-yellow', unitPrice: 149 }], 149);
  assert.deepEqual(ids(row), ['bawang-pink', 'pang-pink', 'linlin-blue', 'bobo-green', 'kada-ppsu']);
  assert.ok(!ids(row).includes('pang-yellow'), 'already in the cart');
  assert.ok(!ids(row).includes('milkpod-ti'), 'AED 349 is above max(199, 149)');
  assert.equal(row.filter((i) => i.familyKey === 'pangpang').length, 1, 'at most one sibling');
  assert.equal(row[1].id, 'pang-pink', 'the sibling is second, never first');
});

test('below the line, cards that unlock free shipping lead; best-selling order holds inside each group', () => {
  // basis 149: needs 101 → 169/179/139 unlock, the AED 99 Kada does not (=248)
  const row = orderUpsell(pool(CATALOGUE), FAMILIES, [{ productId: 'pang-yellow', unitPrice: 149 }], 149);
  assert.equal(ids(row).at(-1), 'kada-ppsu', 'the non-unlocker sinks');
  assert.deepEqual(ids(row).filter((id) => id !== 'pang-pink' && id !== 'kada-ppsu'), ['bawang-pink', 'linlin-blue', 'bobo-green']);
  // Above the line there is no reordering at all
  const above = orderUpsell(pool(CATALOGUE), FAMILIES, [{ productId: 'pang-yellow', unitPrice: 149 }], 300);
  assert.deepEqual(ids(above), ['bawang-pink', 'pang-pink', 'linlin-blue', 'kada-ppsu', 'bobo-green']);
});

test('a dearer cart lifts the price cap; an accessory-only cart gets no sibling', () => {
  const rich = orderUpsell(pool(CATALOGUE), FAMILIES, [{ productId: 'other-ti', unitPrice: 349 }], 349);
  assert.ok(ids(rich).includes('milkpod-ti'));
  // AED 15 cart needs AED 235: no single card unlocks, so best-selling order is untouched
  const stickers = orderUpsell(pool(CATALOGUE), FAMILIES, [{ productId: 'mouth-sticker', unitPrice: 15 }], 15);
  assert.deepEqual(ids(stickers), ['pang-yellow', 'bawang-pink', 'linlin-blue', 'kada-ppsu', 'bobo-green']);
  assert.equal(stickers.filter((i) => i.familyKey === 'pangpang').length, 1, 'no sibling without a drinkware lead');
});

test('never more than six cards, and never a one-card "slider"', () => {
  const big: P[] = Array.from({ length: 12 }, (_, i) => ({ id: `p${i}`, family: `f${i}` }));
  assert.equal(orderUpsell(pool(big), {}, [], 0).length, 6);
  assert.deepEqual(orderUpsell(pool([{ id: 'only', family: 'f' }]), {}, [], 0), []);
});
