// Product families — the single definition of "the same product in another colour".
//
// WHY THIS EXISTS
// A shopper looking at the Yellow & Blue Bawang and the Silver & Black Bawang is looking
// at one product in two colours. Reviews, and the PDP colour-swatch row, should treat them
// as one thing. Colourways merge; MATERIAL variants stay apart (steel Bawang and ceramic
// Bawang are different products and must never share reviews).
//
// PURE MODULE — no network, no React, no `@/` aliases — so `node --test` runs it directly.
//
// ─── WHY THE KEY COMES FROM THE UN-CONTEXTUALIZED (ENGLISH) TITLE ────────────────────────
// Not the localized title: Shopify's Arabic titles are inconsistent per colourway — كأس vs
// كوب for "cup", باوانج/باوانغ/باونج for Bawang, لينلين vs لين لين, غلاية vs إبريق. Grouping
// on them yields 108 Arabic families against 52 English ones, so an Arabic shopper would see
// a different, smaller review pool than an English one on the identical product.
//
// Not the handle either: handles in this store are already stale and even mismatched —
// chako-lab-bawang-ti-tumbler-titanium-frosty-sunny-yellow is titled "(Bamboo Green)", and
// the 550ml PPSU bottles carry 500ml handles. The colour suffix therefore cannot be reliably
// stripped from a handle.
//
// So: derive from the English title, and override by PRODUCT ID (immutable) where the English
// title itself is wrong.

/** Slug of a family, e.g. 'bawang-cup' or 'milk-pod-titanium-520ml'. */
export type FamilyKey = string;

// ─── MERGE: English titles that name ONE family in two different ways ────────────────────
// Keyed on the derived slug. Ahmad chose (1 Sep 2026) to keep these as permanent code
// overrides rather than rename the Shopify products, because the store is shared with
// sundooq.me. These entries are NOT temporary — do not "clean them up".
const MERGE: Readonly<Record<FamilyKey, FamilyKey>> = {
  // Shopify data slip: one steel Bawang colourway is titled "Bawang Tumbler", the other five
  // "Bawang Cup". Same AED 149-169 steel cup.
  'bawang-tumbler': 'bawang-cup',

  // Shopify data slip: four ceramic Bawangs are titled "ChakoLab Bawang Tumbler Ceramic",
  // two "Chako Lab Bawang Cup Ceramic". Same AED 169 ceramic cup. (The brand token is
  // stripped before this lookup, so "ChakoLab" vs "Chako Lab" is already handled.)
  'bawang-tumbler-ceramic': 'bawang-cup-ceramic',

  // Ahmad's call: finish variants of the SAME material are one family, so the frosted and
  // plain titanium of a series pool together. Milk Pod Ti AED 279 + Ti Frosty AED 299.
  'milk-pod-titanium-frosty-520ml': 'milk-pod-titanium-520ml',

  // Same rule, Bawang: Matte Black AED 319 + Frosty AED 349. NOTE these two sit in DIFFERENT
  // Shopify productTypes ('Tumbler' vs 'Bawang Cup'), which is why family lookup must never
  // bucket by productType first.
  'bawang-tumbler-titanium': 'bawang-ti-tumbler-titanium-frosty',
};

// ─── SPLIT: products whose English title is missing the material that distinguishes them ──
// Keyed on the Shopify product GID because it is immutable — handles in this store change.
//
// These three are AED 99 PPSU bottles titled exactly like the AED 179-199 STAINLESS 700ml
// bottles. Without this, one family would contain both, and the PDP would offer steel
// bottles at double the price as "colours" of a PPSU one — a live merchandising bug today,
// before reviews enter the picture at all.
const SPLIT: Readonly<Record<string, FamilyKey>> = {
  'gid://shopify/Product/10801208525138': 'kada-bottle-700ml-ppsu', // …-700ml-white-blue
  'gid://shopify/Product/10801313317202': 'kada-bottle-700ml-ppsu', // …-700ml-brown-blue
  'gid://shopify/Product/10801173365074': 'kada-bottle-700ml-ppsu', // …-700ml-pink-green
};

/** Trailing "(Pink & Green)" — the colourway, which is exactly what a family ignores. */
const COLOURWAY_SUFFIX = /\s*\([^)]*\)\s*$/;

/** Matches both "Chako Lab" and the mistyped "ChakoLab". */
const BRAND_TOKEN = /chako\s*lab/gi;

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * The family a product belongs to.
 *
 * @param productGid  Shopify GID — used only for SPLIT overrides.
 * @param englishTitle  The UN-CONTEXTUALIZED title. Passing a localized title is a bug:
 *                      it silently produces a different family on /ar. Callers get this
 *                      from the catalogue-wide family index, never from a localized fetch.
 */
export function familyKey(productGid: string, englishTitle: string): FamilyKey {
  const override = SPLIT[productGid];
  if (override) return override;

  const derived = slugify(englishTitle.replace(COLOURWAY_SUFFIX, '').replace(BRAND_TOKEN, ' '));
  return MERGE[derived] ?? derived;
}

/** Exposed for the validation script + tests, which assert every entry still matches a product. */
export const FAMILY_OVERRIDES = { MERGE, SPLIT } as const;
