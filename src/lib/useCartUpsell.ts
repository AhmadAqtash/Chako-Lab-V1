'use client';

import { useEffect, useState } from 'react';
import type { UpsellItem, FamilyMap } from '@/lib/cart-upsell';

export interface UpsellData {
  items: UpsellItem[];
  families: FamilyMap;
}

const EMPTY: UpsellData = { items: [], families: {} };

// Module-scope cache per language: reopening the drawer, or remounting it on
// navigation, never refetches. A page reload does — which is how new stock
// and new best-sellers eventually reach a long-lived tab.
const cache = new Map<string, UpsellData>();
const inflight = new Map<string, Promise<UpsellData>>();

function load(language: string): Promise<UpsellData> {
  const existing = inflight.get(language);
  if (existing) return existing;
  const p = fetch(`/api/upsell?lang=${language}`)
    .then((r) => (r.ok ? r.json() : EMPTY))
    .then((d: Partial<UpsellData>) => {
      const data: UpsellData = {
        items: Array.isArray(d.items) ? d.items : [],
        families: d.families && typeof d.families === 'object' ? d.families : {},
      };
      // An empty answer is not cached: it is usually a transient failure, and
      // caching it would hide the slider for the rest of the session.
      if (data.items.length) cache.set(language, data);
      return data;
    })
    .catch(() => EMPTY)
    .finally(() => inflight.delete(language));
  inflight.set(language, p);
  return p;
}

/** Warm the pool without a component — called when an add-to-cart STARTS, so
 *  the cards are ready by the time the drawer auto-opens. */
export function prefetchCartUpsell(language: string): void {
  if (!cache.has(language)) void load(language);
}

/**
 * The "Make it a set" pool. Lazy: nothing is fetched until `enabled` first
 * turns true, so the vast majority of page views — which never open the cart —
 * pay nothing. `loading` lets the slider hold its height with skeletons.
 */
export function useCartUpsell(language: string, enabled: boolean): UpsellData & { loading: boolean } {
  const [data, setData] = useState<UpsellData>(() => cache.get(language) ?? EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const hit = cache.get(language);
    if (hit) {
      setData(hit);
      return;
    }
    let live = true;
    setLoading(true);
    load(language).then((next) => {
      if (!live) return;
      setData(next);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [language, enabled]);

  return { ...data, loading };
}
