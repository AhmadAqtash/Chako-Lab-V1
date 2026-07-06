// ============================================================================
// Canonical product specs — the single source of truth for temperature
// retention and capacity shown anywhere on the site.
//
// BUSINESS RULES (set by Ahmad, 12 Jun 2026):
// - Every double-wall insulated product (stainless / ceramic-coated /
//   titanium) keeps drinks COLD for 36 hours and HOT for up to 18 hours.
//   This applies to ALL insulated products incl. Hanging Pot, Coffee Mug
//   and Baobao Food Cup.
// - Plastic-bodied products (Tritan / PPSU / "Plastic" in the name) are NOT
//   insulated — they must never show retention hours.
// - Capacity in ml must be shown on every PDP. Extracted from the product's
//   own handle/title/description first; if absent, the per-series fallback
//   below applies (sourced from the chakolab.net catalog + Sundooq listings).
// ============================================================================

import type { Product } from '@/types/shopify';
import { extractSpecs } from '@/lib/pdp-story';

export const RETENTION = { coldHours: 36, hotHours: 18 } as const;

const PLASTIC_RE = /plastic|tritan|ppsu|بلاستيك/i;

/** Plastic-bodied (non-insulated) detection — title, handle and description all count. */
export function isPlasticBody(p: Pick<Product, 'title' | 'handle' | 'description'>): boolean {
  return PLASTIC_RE.test(`${p.title} ${p.handle} ${p.description}`);
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

export interface ResolvedSpecs {
  capacityMl: number | null;
  /** null = plastic body or accessory, no retention claims allowed */
  retention: typeof RETENTION | null;
  plastic: boolean;
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
    return { capacityMl: null, retention: null, plastic: false, accessory: true };
  }

  const plastic = isPlasticBody(p);

  // Capacity: the product's own words win; series fallback otherwise
  const extracted = extractSpecs(`${p.handle.replace(/-/g, ' ')} ${p.title} ${p.description}`);
  let capacityMl = extracted.find((s) => s.suffix === 'ml')?.value ?? null;
  if (capacityMl === null) {
    const fb = CAPACITY_FALLBACK[baseType || p.productType];
    if (typeof fb === 'number') capacityMl = fb;
    else if (fb) capacityMl = plastic && fb.plastic ? fb.plastic : fb.default;
  }

  return { capacityMl, retention: plastic ? null : RETENTION, plastic, accessory: false };
}
