// Order of the PDP "Perfect Pairing" carousel.
//
// Keyed on the BASE productType plus the handle: handles are locale-stable and
// base types are too, while the productType on the product itself is
// localized on /ar.

// 3D sticker packs lead the carousel on the series where they attach best
// (Ahmad, Jul 2026); other series keep catalogue order.
const STICKERS_FIRST_TYPES: ReadonlySet<string> = new Set([
  'LinLin Kettle', 'Bawang Cup', 'Thermos Cup', 'Bobo Cup',
  'PangPang Cup', 'Food Cup', 'Baobao Cup', 'Pot', 'Coffee Mug',
]);

// Series the Cup Pouches carry (Ahmad, 17 Sep 2026): Milk Pod, Kada, BoBo,
// Twist and Split Cup, plus CarryGo, which the pouch's own Shopify description
// names as compatible. 'Thermos Cup' is the BoBo Tumbler; 'Bobo Cup' is listed
// too so a future BoBo Cup range is covered. Everywhere else the pouches are
// left out, so nobody ticks a cup pouch onto a kettle or pot order.
const POUCH_TYPES: ReadonlySet<string> = new Set([
  'Milk Pod', 'Kada Bottle', 'Thermos Cup', 'Bobo Cup', 'Split Cup', 'CarryGo Tumbler',
]);

// Twist is a handle family, not a productType — its cups are typed 'Tumbler',
// which the Bawang Lite and Dual-Layer Ti tumblers share.
const isTwist = (handle: string) => /twist/i.test(handle);
const isSticker = (item: { handle: string }) => /sticker/i.test(item.handle);

export interface PairingPlan {
  stickersFirst: boolean;
  pouches: boolean;
}

export function pairingPlan(baseType: string, handle: string): PairingPlan {
  const pouches = POUCH_TYPES.has(baseType) || isTwist(handle);
  return {
    // The pouches sit directly after the stickers, so a pouch series always
    // leads with its stickers — including Kada, Milk Pod, Split Cup and
    // CarryGo, which kept catalogue order before the pouches arrived.
    stickersFirst: pouches || STICKERS_FIRST_TYPES.has(baseType) || isTwist(handle),
    pouches,
  };
}

/**
 * Stickers → pouches → every other accessory, on the pouch series.
 * Stickers → everything else, on the sticker series. Catalogue order otherwise.
 *
 * Partitions rather than sorts, so each group keeps the BEST_SELLING order it
 * arrived in.
 */
export function orderPairing<T extends { handle: string }>(
  accessories: T[],
  pouches: T[],
  plan: PairingPlan
): T[] {
  const offered = plan.pouches ? pouches : [];
  if (!plan.stickersFirst) return [...accessories, ...offered];
  return [
    ...accessories.filter(isSticker),
    ...offered,
    ...accessories.filter((a) => !isSticker(a)),
  ];
}
