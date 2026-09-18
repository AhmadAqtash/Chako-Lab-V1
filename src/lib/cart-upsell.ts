// "Make it a set" — which tumblers the cart drawer offers.
//
// Two steps, because the cart changes on the client but the catalogue is
// fetched on the server:
//   1. buildUpsellPool (server): best-selling, in-stock DRINKWARE, a couple of
//      colourways per product family.
//   2. orderUpsell (client): what THIS cart should see, in what order.
//
// Accessories never appear here (Ahmad, 18 Sep 2026): the slider exists to add
// a second AED 149–199 tumbler, which is also what carries a one-tumbler cart
// over the free-shipping line. Stickers are sold on the product page.
//
// There is no bundle discount, so nothing here may imply one. The only
// incentive is real and computed per card: "this one takes you over AED 250".

import { freeShippingProgress, unlocksWith } from './shipping-config.ts';

export interface UpsellItem {
  id: string;
  handle: string;
  title: string;
  image: string | null;
  price: { amount: string; currencyCode: string };
  variantId: string;
  familyKey: string;
}

/** product GID → family key, for every DRINKWARE product in the catalogue. */
export type FamilyMap = Record<string, string>;

interface PoolOptions<T> {
  familyOf: (p: T) => string;
  isAccessory: (p: T) => boolean;
  inStock: (p: T) => boolean;
  toItem: (p: T, familyKey: string) => UpsellItem | null;
  maxFamilies?: number;
  perFamily?: number;
}

/** `products` must arrive in BEST_SELLING order; that order is preserved. */
export function buildUpsellPool<T>(products: readonly T[], opts: PoolOptions<T>): UpsellItem[] {
  const { familyOf, isAccessory, inStock, toItem, maxFamilies = 16, perFamily = 2 } = opts;
  const perFamilyCount = new Map<string, number>();
  const pool: UpsellItem[] = [];

  for (const p of products) {
    if (isAccessory(p) || !inStock(p)) continue;
    const key = familyOf(p);
    const n = perFamilyCount.get(key) ?? 0;
    if (n >= perFamily) continue;
    if (n === 0 && perFamilyCount.size >= maxFamilies) continue;
    const item = toItem(p, key);
    if (!item) continue;
    perFamilyCount.set(key, n + 1);
    pool.push(item);
  }
  return pool;
}

export interface CartLineLite {
  productId: string;
  unitPrice: number;
}

export const UPSELL_MAX = 6;
export const UPSELL_MIN = 2;
/** A AED 349 titanium piece must not ambush a AED 149 cart. */
export const PRICE_CAP_FLOOR = 199;

const priceOf = (i: UpsellItem) => parseFloat(i.price.amount);

/**
 * The row for THIS cart:
 *  1. nothing already in the cart;
 *  2. nothing pricier than max(AED 199, the dearest thing already in the cart);
 *  3. families NOT in the cart, one card each, best-selling order kept —
 *     a second colourway of something you just chose reads as "reconsider";
 *  4. …except ONE sibling colourway of the cart's lead tumbler, at index 1
 *     (never first): it is the literal "set" — one for you, one to gift;
 *  5. below the free-shipping line, cards that would cross it come first
 *     (stable partition — never sorted by price);
 *  6. at most UPSELL_MAX, and nothing at all below UPSELL_MIN (a one-card
 *     "slider" is a banner).
 */
export function orderUpsell(
  pool: readonly UpsellItem[],
  families: FamilyMap,
  cartLines: readonly CartLineLite[],
  basis: number
): UpsellItem[] {
  const inCart = new Set(cartLines.map((l) => l.productId));
  const cartFamilies = new Set(cartLines.map((l) => families[l.productId]).filter(Boolean));
  const cap = Math.max(PRICE_CAP_FLOOR, ...cartLines.map((l) => l.unitPrice));

  const eligible = pool.filter((i) => !inCart.has(i.id) && priceOf(i) <= cap);

  // Lead = the dearest DRINKWARE line (only drinkware is in the family map)
  const lead = cartLines
    .filter((l) => families[l.productId])
    .reduce<CartLineLite | null>((best, l) => (!best || l.unitPrice > best.unitPrice ? l : best), null);
  const leadFamily = lead ? families[lead.productId] : undefined;
  const sibling = leadFamily ? eligible.find((i) => i.familyKey === leadFamily) : undefined;

  const seen = new Set<string>();
  const others: UpsellItem[] = [];
  for (const i of eligible) {
    if (cartFamilies.has(i.familyKey) || seen.has(i.familyKey)) continue;
    seen.add(i.familyKey);
    others.push(i);
  }

  const below = !freeShippingProgress(basis).unlocked;
  const unlocks = (i: UpsellItem) => unlocksWith(basis, priceOf(i));
  const ranked = below ? [...others.filter(unlocks), ...others.filter((i) => !unlocks(i))] : others;

  const row = [...ranked];
  if (sibling) row.splice(Math.min(1, row.length), 0, sibling);
  const limited = row.slice(0, UPSELL_MAX);
  return limited.length >= UPSELL_MIN ? limited : [];
}
