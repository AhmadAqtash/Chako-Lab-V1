'use client';

import type { PairingItem } from '@/lib/shopify';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice, cn } from '@/lib/utils';
import ShopifyImage from '@/components/ui/ShopifyImage';
import Link from '@/components/ui/LocalizedLink';
import { Check } from 'lucide-react';

interface Props {
  items: PairingItem[];
  /** variantIds currently ticked — selection state lives in ProductDetails */
  selected: Set<string>;
  onToggle: (variantId: string) => void;
}

// Sundooq-style "Perfect Pairing" checkbox carousel: ticked accessories ride
// along with the main Add to Cart in a single atomic cart call.
export default function PairingCarousel({ items, selected, onToggle }: Props) {
  const { t } = useLanguage();
  if (items.length === 0) return null;

  const selectedItems = items.filter((i) => selected.has(i.variantId));
  const selectedTotal = selectedItems.reduce((sum, i) => sum + parseFloat(i.price.amount), 0);
  const currency = items[0].price.currencyCode;

  return (
    <div className="border-t border-black/8 pt-4">
      <h3 className="font-display font-bold text-lg leading-tight">{t('pairing_title')}</h3>
      <p className="text-sm text-chako-ink/60 font-medium mt-0.5 mb-3">{t('pairing_subtitle')}</p>

      <div
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1"
        role="group"
        aria-label={t('pairing_title')}
      >
        {items.map((item) => {
          const isOn = selected.has(item.variantId);
          return (
            <div
              key={item.variantId}
              className={cn(
                'relative flex-shrink-0 w-36 snap-start rounded-2xl border-2 bg-white transition-colors duration-150',
                isOn ? 'border-chako-ink' : 'border-black/8 hover:border-black/20'
              )}
            >
              {/* Whole card toggles the checkbox */}
              <button
                type="button"
                onClick={() => onToggle(item.variantId)}
                aria-pressed={isOn}
                aria-label={item.title}
                className="w-full text-start p-3 pb-2 touch-manipulation"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute top-2.5 start-2.5 z-10 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors duration-150',
                    isOn ? 'bg-chako-ink border-chako-ink text-chako-cream' : 'bg-white border-black/25'
                  )}
                >
                  {isOn && <Check size={13} strokeWidth={3.5} />}
                </span>
                <span className="block relative w-full aspect-square rounded-xl overflow-hidden bg-chako-accent mb-2">
                  {item.image && (
                    <ShopifyImage
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="144px"
                      className="object-cover"
                    />
                  )}
                </span>
                <span className="block text-xs font-semibold leading-snug line-clamp-2 min-h-[2rem]">
                  {item.title}
                </span>
                <span className="block text-sm font-extrabold mt-1">{formatPrice(item.price)}</span>
              </button>
              <Link
                href={`/products/${item.handle}`}
                className="block px-3 pb-2.5 text-[11px] font-semibold text-chako-ink/40 hover:text-chako-ink underline underline-offset-2 transition-colors"
              >
                {t('pairing_view_details')}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Always mounted: a live region inserted after first selection is not
          announced by most screen readers — only its content may change */}
      <p
        aria-live="polite"
        className={cn(
          'text-xs font-semibold text-chako-ink/70',
          selectedItems.length > 0 ? 'mt-2' : 'sr-only'
        )}
      >
        {selectedItems.length > 0
          ? t('pairing_selected')
              .replace('{n}', String(selectedItems.length))
              .replace('{total}', formatPrice({ amount: String(selectedTotal), currencyCode: currency }))
          : ''}
      </p>
    </div>
  );
}
