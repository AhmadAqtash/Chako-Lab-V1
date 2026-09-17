// Run with:  npm test
//
// Guards the PDP pairing-carousel order: which series get the Cup Pouches, and
// that they sit directly after the sticker packs.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { orderPairing, pairingPlan } from './pairing.ts';
import { isAccessoryBaseType, looksLikeAccessory } from './accessory-types.ts';

const item = (handle: string) => ({ handle });
const handles = (list: { handle: string }[]) => list.map((i) => i.handle);

// Live BEST_SELLING order (17 Sep 2026), trimmed: stickers are NOT contiguous
// at the top — a sleeve sits between them — which is why order must partition.
const ACCESSORIES = [
  'chako-lab-3d-amazing-eyes-sticker',
  'chako-lab-mouth-sticker',
  'chako-lab-mesh-cup-sleeve-pink',
  'chako-lab-eyebrows-stickers',
  'chako-lab-big-eye-sticker',
  'chako-lab-hand-towel-lemon',
  'chako-lab-milkmate-tumbler-handle-green',
].map(item);
const POUCHES = [
  'chako-lab-cup-pouch-small-yellow',
  'chako-lab-cup-pouch-large-blue',
].map(item);

const STICKERS = [
  'chako-lab-3d-amazing-eyes-sticker',
  'chako-lab-mouth-sticker',
  'chako-lab-eyebrows-stickers',
  'chako-lab-big-eye-sticker',
];
const REST = [
  'chako-lab-mesh-cup-sleeve-pink',
  'chako-lab-hand-towel-lemon',
  'chako-lab-milkmate-tumbler-handle-green',
];
const WITH_POUCHES = [...STICKERS, ...handles(POUCHES), ...REST];

const order = (baseType: string, handle: string) =>
  handles(orderPairing(ACCESSORIES, POUCHES, pairingPlan(baseType, handle)));

test('the five requested series (plus CarryGo): stickers → pouches → the rest', () => {
  const cases: [string, string][] = [
    ['Milk Pod', 'chako-lab-milk-pod-black'],
    ['Kada Bottle', 'chako-lab-kada-bottle-700ml-lemon'],
    ['Thermos Cup', 'chako-lab-bobo-tumbler-cup-berry-pink'],
    ['Tumbler', 'chako-lab-twist-tumbler-yellow-blue'],
    ['Split Cup', 'chako-lab-split-cup-570ml-yellow'],
    ['CarryGo Tumbler', 'chako-lab-carrygo-tumbler-pink'],
  ];
  for (const [type, handle] of cases) {
    assert.deepEqual(order(type, handle), WITH_POUCHES, `${type} / ${handle}`);
  }
});

test('series that never led with stickers now do, because the pouches follow them', () => {
  for (const type of ['Kada Bottle', 'Milk Pod', 'Split Cup', 'CarryGo Tumbler']) {
    assert.deepEqual(order(type, 'x').slice(0, 4), STICKERS, type);
  }
});

test('no pouches on series they do not carry', () => {
  // Sticker series keep stickers first, with no pouches
  for (const type of ['LinLin Kettle', 'Bawang Cup', 'PangPang Cup', 'Pot', 'Coffee Mug']) {
    const out = order(type, 'chako-lab-something');
    assert.deepEqual(out, [...STICKERS, ...REST], type);
  }
  // Non-sticker series keep plain catalogue order, with no pouches
  assert.deepEqual(order('Square Cup', 'chako-lab-square-cup-green-orange'), handles(ACCESSORIES));
});

test('a non-Twist Tumbler (Bawang Lite, Dual-Layer Ti) gets no pouches', () => {
  // They share productType 'Tumbler' with Twist; only the handle tells them apart.
  for (const handle of [
    'chako-lab-bawang-lite-tumbler-770ml-pink-mint',
    'chako-lab-dual-layer-ti-tumbler-brown',
  ]) {
    assert.deepEqual(order('Tumbler', handle), handles(ACCESSORIES), handle);
  }
});

test('nothing is dropped or duplicated', () => {
  const out = order('Kada Bottle', 'x');
  assert.equal(out.length, ACCESSORIES.length + POUCHES.length);
  assert.equal(new Set(out).size, out.length);
});

test('no pouches in stock → the carousel is just stickers then the rest', () => {
  const out = handles(orderPairing(ACCESSORIES, [], pairingPlan('Milk Pod', 'x')));
  assert.deepEqual(out, [...STICKERS, ...REST]);
});

test('every accessory TYPE is an accessory, not just "Accessories"', () => {
  for (const t of ['Accessories', 'Pouch', 'Cleaning Brush', 'Rope']) {
    assert.ok(isAccessoryBaseType(t), t);
    assert.ok(looksLikeAccessory(t, null), t);
  }
  for (const t of ['Tumbler', 'Kada Bottle', 'Split Cup', 'CarryGo Tumbler', '', undefined]) {
    assert.equal(isAccessoryBaseType(t), false, String(t));
  }
});

test('the regex fallback still catches localized accessories when the base type is unknown', () => {
  assert.ok(looksLikeAccessory(null, 'إكسسوارات'));
  assert.ok(looksLikeAccessory(undefined, 'Accessories'));
  // A known drinkware base type is never overridden by the fallback
  assert.equal(looksLikeAccessory('Milk Pod', 'إكسسوارات'), false);
});
