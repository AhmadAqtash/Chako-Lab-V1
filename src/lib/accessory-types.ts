// Which base productTypes are accessories rather than drinkware.
//
// Its own module, with no imports, because server code (lib/shopify.ts) and a
// client component (SpecChips → lib/product-specs) both need it — pulling
// lib/shopify.ts into the client bundle would drag the whole server client in.
//
// WHY A LIST
// This catalogue has no single accessory type. Most add-ons are 'Accessories',
// but the Cup Pouches arrived typed 'Pouch' (17 Sep 2026) and the brush and
// phone rope carry types of their own. Every accessory check used to match the
// word "accessor", so all three were treated as drinkware: the pouch PDP
// claimed 36h cold / 18h hot and food-grade materials, and none of them ever
// reached the Accessories page. Add a new accessory type HERE and every surface
// follows — the Accessories page, the PDP specs and story, and the browse order.
//
// Deliberately an ACCESSORY list, not a drinkware list: an unrecognised type
// therefore sorts as drinkware and lands at the top. A new bottle series going
// live and being buried costs far more than a new accessory type ranking too
// high — and this catalogue gains drinkware series regularly (CarryGo, Split
// Cup and Bawang Lite all launched within a fortnight).

export const ACCESSORY_BASE_TYPES: readonly string[] = [
  'Accessories',
  'Pouch',
  'Cleaning Brush',
  'Rope',
];

const ACCESSORY_SET: ReadonlySet<string> = new Set(ACCESSORY_BASE_TYPES);

export function isAccessoryBaseType(baseType: string | null | undefined): boolean {
  return !!baseType && ACCESSORY_SET.has(baseType);
}

/**
 * For callers that may only hold a LOCALIZED productType — an /ar page whose
 * base-type lookup failed. The base list decides whenever a base type is
 * known; the regex is the old guard, kept as the fallback because Arabic
 * 'Accessories' arrives as إكسسوارات (and occasionally untranslated).
 */
export function looksLikeAccessory(
  baseType: string | null | undefined,
  localizedType?: string | null
): boolean {
  return (
    isAccessoryBaseType(baseType) ||
    /accessor|إكسسوار/i.test(baseType || localizedType || '')
  );
}
