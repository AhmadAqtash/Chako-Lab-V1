// ============================================================================
// Canonical product specs — the single source of truth for temperature
// retention and capacity shown anywhere on the site.
//
// BUSINESS RULES (set by Ahmad, 12 Jun 2026; amended 20 Aug 2026):
// - Every double-wall insulated product (stainless / ceramic-coated /
//   titanium) keeps drinks COLD for 36 hours and HOT for up to 18 hours.
//   This applies to ALL insulated products incl. Hanging Pot, Coffee Mug
//   and Baobao Food Cup.
// - EXCEPTION (Ahmad, 20 Aug 2026): the Milk Pod series does not hold
//   temperature like the rest of the range — COLD 10h / HOT 8h, across
//   every Milk Pod including the ceramic and titanium variants. The
//   supplier descriptions on the steel Milk Pods independently say
//   "up to 8 hours", which corroborates this.
// - Plastic-bodied products (Tritan / PPSU / "Plastic" in the name) are NOT
//   insulated — they must never show retention hours.
// - Capacity in ml must be shown on every PDP. Extracted from the product's
//   own handle/title/description first; if absent, the per-series fallback
//   below applies (sourced from the chakolab.net catalog + Sundooq listings).
// ============================================================================

import type { Product } from '@/types/shopify';
import { extractSpecs } from '@/lib/pdp-story';

export interface Retention {
  readonly coldHours: number;
  readonly hotHours: number;
}

/** The canon for double-wall insulated bodies, unless overridden below. */
export const RETENTION: Retention = { coldHours: 36, hotHours: 18 };

// Per-series exceptions to that canon. Matched on the base productType with a
// locale-proof handle fallback: under @inContext productType comes back
// TRANSLATED, so an AR page whose base-type fetch failed would otherwise miss
// the override and OVERSTATE the claim — the expensive direction to be wrong.
const RETENTION_OVERRIDES: { typeKey: string; handle: RegExp; retention: Retention }[] = [
  { typeKey: 'Milk Pod', handle: /milk-?pod/i, retention: { coldHours: 10, hotHours: 8 } },
];

function retentionFor(
  p: Pick<Product, 'handle' | 'productType'>,
  baseType?: string | null
): Retention {
  const type = baseType || p.productType;
  const hit = RETENTION_OVERRIDES.find((o) => o.typeKey === type || o.handle.test(p.handle));
  return hit ? hit.retention : RETENTION;
}

// Arabic descriptions transliterate "Tritan" inconsistently — تريتان, ترتان and
// ترينتان all appear across the catalogue, so the AR spelling is matched
// loosely. Without this, two BaBa Cups escaped plastic detection on /ar and
// advertised 36h/18h insulation on a non-insulated Tritan body (20 Aug 2026).
const PLASTIC_RE = /plastic|tritan|ppsu|بلاستيك|تر[يا]?ن?تان/i;

// A plastic COMPONENT is not a plastic BODY. The ceramic Milk Pods are 316
// steel with a ceramic lining and a "BPA-free plastic lid" — matching that
// phrase classified them as plastic and stripped their retention claim
// entirely (found 20 Aug 2026). Component mentions are removed before the
// body test. Verified against the full 155-product catalogue: this
// reclassifies exactly the three ceramic Milk Pods and nothing else — every
// genuine Tritan/PPSU body (Square Cup, BaBa, PPSU Kada, Lunch Box) names the
// material against "body", "bottle" or "cup", never against a component noun.
const PLASTIC_COMPONENT_RE =
  /\b(?:plastic|tritan|ppsu)\s+(?:lid|cap|straw|handle|seal|ring|base|spout|valve|parts?|components?)\b|(?:غطاء|مقبض|ماصة|شفاطة|حلقة|قاعدة|أجزاء|أختام)\s+(?:بلاستيكية?|تر[يا]?ن?تان)/gi;

/** Plastic-bodied (non-insulated) detection — title, handle and description all count. */
export function isPlasticBody(p: Pick<Product, 'title' | 'handle' | 'description'>): boolean {
  const text = `${p.title} ${p.handle} ${p.description}`.replace(PLASTIC_COMPONENT_RE, ' ');
  return PLASTIC_RE.test(text);
}

/**
 * Capacity fallbacks by productType (base, language-stable when fetched via
 * getProductBaseType; the localized productType still matches the EN keys on
 * EN pages — callers should pass the base type when they have it).
 * Values in ml, from the chakolab.net catalog / Sundooq listings.
 */
const CAPACITY_FALLBACK: Record<string, number | { default: number; plastic?: number }> = {
  'LinLin Kettle': { default: 1000, plastic: 1150 },
  'Bawang Cup': 1100,
  'Tumbler': 1100, // Bawang Tumbler Titanium lives under this type
  'Thermos Cup': 485, // BoBo
  'Milk Pod': 520,
  'PangPang Cup': 600,
  'Coffee Mug': 400,
  'Food Cup': 450, // Baobao
  'Kada Bottle': 550,
};

// Not everything non-plastic is double-wall steel: single-wall borosilicate
// glassware and non-drinkware boxes must never carry the 36h/18h canon (the
// Aug 2026 audit caught the code default about to hand retention chips to
// glass teapots the moment their collection went navigable).
const NON_INSULATED_TYPES = new Set(['Glass Cup', 'Teapot', 'Fruit Box']);

export interface ResolvedSpecs {
  capacityMl: number | null;
  /** null = plastic body, uninsulated type or accessory: no retention claims allowed */
  retention: Retention | null;
  plastic: boolean;
  /** true = non-plastic but not vacuum-insulated (glass, boxes): no retention, no plastic copy */
  uninsulated: boolean;
  /** true = accessory (handles/straps/sleeves/towels/pads): no drinkware specs at all */
  accessory: boolean;
}

/**
 * Resolve the displayable specs for a product. `baseType` should be the
 * language-stable productType when available (falls back to p.productType).
 */
export function resolveSpecs(
  p: Pick<Product, 'title' | 'handle' | 'description' | 'productType'>,
  baseType?: string | null
): ResolvedSpecs {
  // Accessories (handles, straps, sleeves, towels, heating pads) are not
  // drinkware — they must never carry capacity or temperature-retention
  // claims, so they exit before any extraction or fallback logic runs.
  // Regex (not equality) so the guard survives AR pages where a failed
  // base-type fetch falls back to the localized productType (إكسسوارات).
  if (/accessor|إكسسوار/i.test(baseType || p.productType)) {
    return { capacityMl: null, retention: null, plastic: false, uninsulated: false, accessory: true };
  }

  const plastic = isPlasticBody(p);
  const uninsulated = !plastic && NON_INSULATED_TYPES.has(baseType || p.productType);

  // Capacity: the product's own words win; series fallback otherwise.
  // Title outranks description outranks handle — handles carry stale numbers
  // (kada-bottle-500ml-ppsu is titled and sold as 550ml) and extractSpecs
  // takes the first match in the string.
  const extracted = extractSpecs(`${p.title} ${p.description} ${p.handle.replace(/-/g, ' ')}`);
  let capacityMl = extracted.find((s) => s.suffix === 'ml')?.value ?? null;
  if (capacityMl === null) {
    const fb = CAPACITY_FALLBACK[baseType || p.productType];
    if (typeof fb === 'number') capacityMl = fb;
    else if (fb) capacityMl = plastic && fb.plastic ? fb.plastic : fb.default;
  }

  return {
    capacityMl,
    retention: plastic || uninsulated ? null : retentionFor(p, baseType),
    plastic,
    uninsulated,
    accessory: false,
  };
}
