'use client';

import { ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { fill } from '@/components/ui/fill';

export interface SoldProofProp {
  kind: 'series' | 'brand';
  /** Already cushioned and rounded down — see lib/sales-proof.ts */
  count: number;
  /** Localized series name ("PangPang Cups"); required when kind is 'series' */
  seriesName: string | null;
}

/**
 * "270+ PangPang Cups sold in the UAE" — one quiet line under the stars.
 *
 * Beside the rating is where a sold count reads as popularity evidence rather
 * than pressure, so it appears here and nowhere else: not by the button, not in
 * the sticky bar, not in the cart. Plain text, static — no flame, no pill, no
 * count-up. The series is NAMED because the figure is per series; a bare
 * "270+ sold" next to one colourway's stars would be read as that colourway's.
 */
export default function SoldProofLine({ proof }: { proof: SoldProofProp }) {
  const { t } = useLanguage();
  const series = proof.kind === 'series' && proof.seriesName;
  const count = (
    <bdi className="font-extrabold text-chako-ink/80 tabular-nums">{proof.count.toLocaleString('en-US')}</bdi>
  );

  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-[13px] font-semibold leading-5 text-chako-ink/70">
      <ShoppingBag size={13} className="mt-[3px] flex-shrink-0 text-chako-ink/40" aria-hidden="true" />
      <span>
        {series
          ? fill(t('pdp_sold_series'), { count, series })
          : fill(t('pdp_sold_brand'), { count })}
      </span>
    </p>
  );
}
