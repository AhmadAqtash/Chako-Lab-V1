'use client';

import { Truck, RotateCcw, Shield, CreditCard, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/translations';

const BADGE_DEFS: { Icon: React.ElementType; labelKey: TranslationKey; subKey: TranslationKey; wide?: boolean; highlight?: boolean }[] = [
  { Icon: Truck, labelKey: 'product_free_shipping', subKey: 'product_free_shipping_sub' },
  { Icon: RotateCcw, labelKey: 'product_easy_returns', subKey: 'product_easy_returns_sub' },
  { Icon: Shield, labelKey: 'product_authentic', subKey: 'product_authentic_sub' },
  { Icon: CreditCard, labelKey: 'product_secure', subKey: 'product_secure_sub' },
  { Icon: Clock, labelKey: 'product_order_2pm', subKey: 'product_order_2pm_sub', wide: true, highlight: true },
];

export default function TrustBadges() {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-2 pt-2">
      {BADGE_DEFS.map(({ Icon, labelKey, subKey, wide, highlight }) => (
        <div
          key={labelKey}
          className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 ${wide ? 'col-span-2' : ''} ${highlight ? 'bg-chako-highlight/30' : 'bg-chako-accent'}`}
        >
          <Icon size={16} className="flex-shrink-0 mt-0.5 text-chako-ink/50" />
          <div>
            <p className="text-xs font-semibold">{t(labelKey)}</p>
            <p className="text-[11px] text-chako-ink/45 leading-tight">{t(subKey)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
