// Run with:  npm run test:family     (node --test, no dependencies)
//
// Guards the family key. The dangerous direction is a FALSE MERGE — showing one
// product's reviews on a different product's page — so most of these assert
// that things stay APART.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { familyKey, FAMILY_OVERRIDES } from './family.ts';

const NO_GID = 'gid://shopify/Product/0';

test('colourways of the same product share a family', () => {
  const a = familyKey(NO_GID, 'Chako Lab Bawang Cup (Yellow & Blue)');
  const b = familyKey(NO_GID, 'Chako Lab Bawang Cup (Silver & Black)');
  assert.equal(a, b);
  assert.equal(a, 'bawang-cup');
});

test('MATERIAL variants never share a family — the whole point of the rule', () => {
  const steel = familyKey(NO_GID, 'Chako Lab Bawang Cup (Yellow & Blue)');
  const ceramic = familyKey(NO_GID, 'Chako Lab Bawang Cup Ceramic (Cream)');
  const titanium = familyKey(NO_GID, 'Chako Lab Bawang Ti Tumbler Titanium Frosty (Glacier)');
  assert.notEqual(steel, ceramic);
  assert.notEqual(steel, titanium);
  assert.notEqual(ceramic, titanium);
});

test('the two Shopify naming slips merge (Cup/Tumbler, ChakoLab/Chako Lab)', () => {
  // Steel: one colourway is titled "Bawang Tumbler", five "Bawang Cup"
  assert.equal(
    familyKey(NO_GID, 'Chako Lab Bawang Tumbler (Pink & Purple)'),
    familyKey(NO_GID, 'Chako Lab Bawang Cup (Yellow & Blue)')
  );
  // Ceramic: four are "ChakoLab Bawang Tumbler Ceramic", two "Chako Lab Bawang Cup Ceramic"
  assert.equal(
    familyKey(NO_GID, 'ChakoLab Bawang Tumbler Ceramic (Pink & Mint)'),
    familyKey(NO_GID, 'Chako Lab Bawang Cup Ceramic (Green)')
  );
});

test('finish variants of the same material pool (Ahmad, 1 Sep 2026)', () => {
  assert.equal(
    familyKey(NO_GID, 'Chako Lab Milk Pod Titanium 520ml (Purple)'),
    familyKey(NO_GID, 'Chako Lab Milk Pod Titanium Frosty 520ml (Aurora)')
  );
  // Crosses Shopify productTypes ('Tumbler' vs 'Bawang Cup') — which is why
  // family lookup must never bucket by productType first.
  assert.equal(
    familyKey(NO_GID, 'Chako Lab Bawang Tumbler Titanium (Matte Black)'),
    familyKey(NO_GID, 'Chako Lab Bawang Ti Tumbler Titanium Frosty (Glacier)')
  );
});

test('SIZE variants stay apart (Ahmad, 1 Sep 2026)', () => {
  assert.notEqual(
    familyKey(NO_GID, 'Chako Lab Kada Bottle 550ml (Taro Coco)'),
    familyKey(NO_GID, 'Chako Lab Kada Bottle 700ml (Lemon)')
  );
  assert.notEqual(
    familyKey(NO_GID, 'Chako Lab BaBa Cup 960ml (Blue)'),
    familyKey(NO_GID, 'Chako Lab BaBa Cup 1180ml (Green)')
  );
});

test('the mistitled AED 99 PPSU bottles split from the AED 179+ steel ones', () => {
  // These three carry titles identical to the stainless 700ml line. Without the
  // ID override the PDP would offer steel bottles at double the price as
  // "colours" of a PPSU one.
  const ppsuGids = Object.keys(FAMILY_OVERRIDES.SPLIT);
  assert.equal(ppsuGids.length, 3);
  const steel = familyKey(NO_GID, 'Chako Lab Kada Bottle 700ml (Lemon)');
  for (const gid of ppsuGids) {
    const ppsu = familyKey(gid, 'Chako Lab Kada Bottle 700ml (White & Blue)');
    assert.notEqual(ppsu, steel, `${gid} must not share a family with the steel 700ml`);
    assert.equal(ppsu, 'kada-bottle-700ml-ppsu');
  }
});

test('the key ignores the colourway, including nested and & separators', () => {
  assert.equal(familyKey(NO_GID, 'Chako Lab Fruit Box (Strawberry Pink)'), 'fruit-box');
  assert.equal(familyKey(NO_GID, 'Chako Lab Hand Towel (Yellow Cap)'), 'hand-towel');
  // No parenthetical at all (stickers) still yields a stable key
  assert.equal(familyKey(NO_GID, 'Chako Lab Mouth Sticker'), 'mouth-sticker');
});

test('a localized title would produce a DIFFERENT key — callers must pass English', () => {
  // Not a supported input; this pins the reason the index is un-contextualized.
  // Arabic titles are inconsistent per colourway, so grouping on them fragments.
  const en = familyKey(NO_GID, 'Chako Lab Bawang Cup (Yellow & Blue)');
  const ar = familyKey(NO_GID, 'كأس شاكو لاب باوانغ (أصفر وأزرق)');
  assert.notEqual(en, ar);
  assert.equal(ar, '', 'Arabic slugifies to empty — a loud failure, not a silent wrong merge');
});

test('every MERGE target is itself a terminal key (no chains)', () => {
  for (const [from, to] of Object.entries(FAMILY_OVERRIDES.MERGE)) {
    assert.ok(
      !(to in FAMILY_OVERRIDES.MERGE),
      `${from} -> ${to} -> ... : MERGE must not chain, resolution is single-pass`
    );
  }
});
