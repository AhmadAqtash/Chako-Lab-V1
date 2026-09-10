// Run with:  npm test
//
// Guards the All Products browse order. This page is where the Meta ads land,
// so a regression here is paid traffic hitting the wrong first screen.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { inStockFirst, drinkwareFirst, isInStock } from './inventory.ts';

const P = (id: string, inStock = true, accessory = false) => ({
  id,
  availableForSale: inStock,
  variants: { nodes: [{ availableForSale: inStock }] },
  _accessory: accessory,
});
const isAcc = (p: ReturnType<typeof P>) => p._accessory;
const ids = (list: { id: string }[]) => list.map((p) => p.id);

test('drinkware, then accessories, then sold out', () => {
  const out = drinkwareFirst(
    [
      P('sticker-1', true, true),
      P('bottle-1'),
      P('bottle-oos', false),
      P('sticker-oos', false, true),
      P('bottle-2'),
    ],
    isAcc
  );
  assert.deepEqual(ids(out), ['bottle-1', 'bottle-2', 'sticker-1', 'bottle-oos', 'sticker-oos']);
});

test('best-selling order is preserved WITHIN each tier', () => {
  // Input is already in best-selling order; the sort must only re-tier, never
  // reshuffle, so a restock returns a product to its exact former rank.
  const out = drinkwareFirst(
    [P('a'), P('acc-1', true, true), P('b'), P('acc-2', true, true), P('c')],
    isAcc
  );
  assert.deepEqual(ids(out), ['a', 'b', 'c', 'acc-1', 'acc-2']);
});

test('a sold-out BOTTLE still sits below an in-stock STICKER', () => {
  // Deliberate: an unbuyable product is worth less than a cheap buyable one.
  const out = drinkwareFirst([P('bottle-oos', false), P('sticker', true, true)], isAcc);
  assert.deepEqual(ids(out), ['sticker', 'bottle-oos']);
});

test('the four stickers that opened the page are pushed past all drinkware', () => {
  // Mirrors the real BEST_SELLING order that prompted the change: four AED 15
  // stickers inside the first twelve cards, one of them at position 2.
  const live = [
    P('pangpang-pink-purple', false),
    P('mouth-sticker', true, true),
    P('amazing-eyes-sticker', false, true),
    P('pangpang-yellow-blue'),
    P('eyebrows-sticker', true, true),
    P('big-eye-sticker', true, true),
    P('pangpang-yellow-purple'),
    P('bawang-silver-black'),
  ];
  const out = ids(drinkwareFirst(live, isAcc));
  const firstAccessory = out.indexOf('mouth-sticker');
  const lastDrinkware = out.indexOf('bawang-silver-black');
  assert.ok(lastDrinkware < firstAccessory, 'every in-stock drinkware outranks every sticker');
  assert.deepEqual(out.slice(0, 4), [
    'pangpang-yellow-blue',
    'pangpang-yellow-purple',
    'bawang-silver-black',
    'mouth-sticker',
  ]);
});

test('unknown/unclassified products sort as drinkware, not accessories', () => {
  // The accessory list is the allowlist, so a NEW drinkware series that nobody
  // has classified yet still lands at the top rather than being buried.
  const out = drinkwareFirst([P('sticker', true, true), P('brand-new-series')], isAcc);
  assert.deepEqual(ids(out), ['brand-new-series', 'sticker']);
});

test('inStockFirst is unchanged — other surfaces still use it', () => {
  const out = inStockFirst([P('a', false), P('b'), P('c', false), P('d')]);
  assert.deepEqual(ids(out), ['b', 'd', 'a', 'c']);
});

test('isInStock prefers the product flag and fails open on unknown shapes', () => {
  assert.equal(isInStock({ availableForSale: false, variants: { nodes: [{ availableForSale: true }] } }), false);
  assert.equal(isInStock({ variants: { nodes: [{ availableForSale: true }] } }), true);
  assert.equal(isInStock({}), true, 'unknown shape must never bury a sellable product');
});
