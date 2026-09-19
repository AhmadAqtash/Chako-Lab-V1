// Run with:  npm test
//
// The Buy-it-now button names a wallet by device. Naming the WRONG one (Google
// Pay to an iPhone, anything to a phone that cannot use it) is noise at best.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { walletForDevice } from './wallet-hint.ts';

const UA = {
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  iphoneInstagram: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22F76 Instagram 385.0.0.29.74 (iPhone15,2; iOS 18_5; en_AE; en; scale=3.00; 1179x2556)',
  ipad: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
  samsung: 'Mozilla/5.0 (Linux; Android 15; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36',
  pixel: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
  androidInstagram: 'Mozilla/5.0 (Linux; Android 14; SM-A546E Build/UP1A) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/139.0 Mobile Safari/537.36 Instagram 390.0.0.43.85 Android',
  huawei: 'Mozilla/5.0 (Linux; Android 12; HarmonyOS; ALN-AL00; HMSCore 6.13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0 HuaweiBrowser/15.0 Mobile Safari/537.36',
  macSafari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
  macChrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
};

test('iPhone → Apple Pay, including inside the Instagram in-app browser (57% of traffic)', () => {
  assert.equal(walletForDevice(UA.iphone), 'apple');
  assert.equal(walletForDevice(UA.iphoneInstagram), 'apple');
});

test('iPadOS reports itself as a Mac — the touch screen gives it away', () => {
  assert.equal(walletForDevice(UA.ipad, { maxTouchPoints: 5 }), 'apple');
});

test('Samsung and every other Android → Google Pay', () => {
  assert.equal(walletForDevice(UA.samsung), 'google');
  assert.equal(walletForDevice(UA.pixel), 'google');
  assert.equal(walletForDevice(UA.androidInstagram), 'google');
});

test('Huawei without Google services gets no wallet named', () => {
  assert.equal(walletForDevice(UA.huawei), null);
});

test('desktop: Apple Pay only on Safari on a Mac that has it; never on Chrome or Windows', () => {
  assert.equal(walletForDevice(UA.macSafari, { maxTouchPoints: 0, hasApplePaySession: true }), 'apple');
  assert.equal(walletForDevice(UA.macSafari, { maxTouchPoints: 0, hasApplePaySession: false }), null);
  assert.equal(walletForDevice(UA.macChrome, { maxTouchPoints: 0, hasApplePaySession: false }), null);
  assert.equal(walletForDevice(UA.windows), null);
  assert.equal(walletForDevice(''), null);
});
