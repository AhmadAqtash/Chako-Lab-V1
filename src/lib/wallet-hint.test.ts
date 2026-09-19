// Run with:  npm test
//
// The Buy-it-now button names a wallet by device. Naming the WRONG one (Google
// Pay to an iPhone, Apple Pay to an Android), or naming one the browser cannot
// present, is noise at best.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { walletForDevice } from './wallet-hint.ts';

const UA = {
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  iphoneInstagram: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22F76 Instagram 385.0.0.29.74 (iPhone15,2; iOS 18_5; en_AE; en; scale=3.00; 1179x2556)',
  ipadClassic: 'Mozilla/5.0 (iPad; CPU OS 16_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
  ipadAsMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
  samsung: 'Mozilla/5.0 (Linux; Android 15; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36',
  pixel: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
  androidInstagram: 'Mozilla/5.0 (Linux; Android 14; SM-A546E Build/UP1A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/139.0 Mobile Safari/537.36 Instagram 390.0.0.43.85 Android',
  hipad: 'Mozilla/5.0 (Linux; Android 10; HiPad X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  huawei: 'Mozilla/5.0 (Linux; Android 12; HarmonyOS; ALN-AL00; HMSCore 6.13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0 HuaweiBrowser/15.0 Mobile Safari/537.36',
  macSafari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15',
  macChrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
};
const APPLE = { hasApplePaySession: true };
const GOOGLE = { hasPaymentRequest: true };

test('iPhone with Apple Pay → Apple Pay, including inside Instagram on iOS 16+', () => {
  assert.equal(walletForDevice(UA.iphone, APPLE), 'apple');
  assert.equal(walletForDevice(UA.iphoneInstagram, APPLE), 'apple');
});

test('an iPhone whose browser cannot present Apple Pay gets the generic line, not a promise', () => {
  assert.equal(walletForDevice(UA.iphone), null);
  assert.equal(walletForDevice(UA.iphoneInstagram, { hasApplePaySession: false }), null);
});

test('iPads: the classic UA, and iPadOS reporting itself as a Mac', () => {
  assert.equal(walletForDevice(UA.ipadClassic, APPLE), 'apple');
  assert.equal(walletForDevice(UA.ipadAsMac, { maxTouchPoints: 5, ...APPLE }), 'apple');
});

test('Samsung and every other Android browser with Payment Request → Google Pay', () => {
  assert.equal(walletForDevice(UA.samsung, GOOGLE), 'google');
  assert.equal(walletForDevice(UA.pixel, GOOGLE), 'google');
});

test('an Android in-app WebView without Payment Request is NOT told Google Pay', () => {
  // Instagram/Facebook/TikTok webviews expose no PaymentRequest unless the host
  // app opts in — Stripe cannot offer Google Pay there, so we do not name it
  assert.equal(walletForDevice(UA.androidInstagram), null);
  assert.equal(walletForDevice(UA.androidInstagram, { hasPaymentRequest: false }), null);
  // …and if the host app enables it one day, the line comes back by itself
  assert.equal(walletForDevice(UA.androidInstagram, GOOGLE), 'google');
});

test('an Android is never told Apple Pay — not even a tablet called "HiPad"', () => {
  assert.equal(walletForDevice(UA.hipad, GOOGLE), 'google');
  assert.equal(walletForDevice(UA.hipad, { ...GOOGLE, ...APPLE }), 'google');
  // and no iPhone can ever be told Google Pay
  assert.equal(walletForDevice(UA.iphone, { ...GOOGLE, ...APPLE }), 'apple');
  assert.equal(walletForDevice(UA.iphone, GOOGLE), null);
});

test('Huawei without Google services gets no wallet named', () => {
  assert.equal(walletForDevice(UA.huawei, GOOGLE), null);
});

test('desktop: Apple Pay only on Safari on a Mac that has it; never on Chrome or Windows', () => {
  assert.equal(walletForDevice(UA.macSafari, { maxTouchPoints: 0, ...APPLE }), 'apple');
  assert.equal(walletForDevice(UA.macSafari, { maxTouchPoints: 0 }), null);
  assert.equal(walletForDevice(UA.macChrome, { maxTouchPoints: 0, ...GOOGLE }), null);
  assert.equal(walletForDevice(UA.windows, GOOGLE), null);
  assert.equal(walletForDevice(''), null);
});
