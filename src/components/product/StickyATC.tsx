'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';
import { MoneyV2 } from '@/types/shopify';
import { ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { addWithPairings } from '@/lib/add-with-pairings';
import type { CartLineInput } from '@/context/CartContext';
import DispatchStrip from '@/components/shipping/DispatchStrip';
import { FLAGS } from '@/lib/feature-flags';

interface Props {
  title: string;
  price: MoneyV2;
  variantId: string;
  available: boolean;
  triggerRef: React.RefObject<HTMLElement>;
  featuredImage?: string | null;
  /** The stepper quantity and ticked pairing accessories from the buy box.
   *  This bar is the FIRST call to action most mobile shoppers see (the real
   *  button starts below the fold), so it must add exactly what that button
   *  would — it used to add quantity 1 and silently drop every accessory. */
  quantity?: number;
  extraLines?: CartLineInput[];
  onAdded?: () => void;
  /** Shelf provably covers the chosen quantity — gates the dispatch strip */
  dispatchStockOk?: boolean;
}

export default function StickyATC({ title, price, variantId, available, triggerRef, featuredImage, quantity = 1, extraLines, onAdded, dispatchStockOk = false }: Props) {
  const { addItems, isLoading } = useCart();
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);


  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerRef]);

  // Broadcast visibility so fixed-position neighbors (FloatingContact) can
  // duck out of the bar's way. Cleanup releases them when the PDP unmounts.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('chako:sticky-atc', { detail: { visible } }));
    return () => {
      if (visible) {
        window.dispatchEvent(new CustomEvent('chako:sticky-atc', { detail: { visible: false } }));
      }
    };
  }, [visible]);

  async function handleAdd() {
    if (!available) return;
    const { ok } = await addWithPairings(
      addItems,
      { merchandiseId: variantId, quantity },
      extraLines ?? [],
      { source: 'pdp_sticky', onExtrasDropped: () => toast(t('pairing_add_failed'), { icon: '⚠️' }) }
    );
    if (!ok) return;
    onAdded?.();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div
      className={`sticky-atc md:hidden fixed left-0 right-0 z-20 bg-chako-bg/95 backdrop-blur-md border-t border-black/8 px-4 py-3 transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 58px)' }}
    >
      {/* The buy box starts below the fold on a phone, so THIS bar is the first
          call to action — and the only place urgency can be seen on arrival.
          Mounted only while the bar is showing: no hidden per-second ticking. */}
      {FLAGS.STICKY_DISPATCH && FLAGS.PDP_DISPATCH && visible && available && (
        <DispatchStrip stockOk={dispatchStockOk} />
      )}
      <div className="flex items-center gap-3">
      {featuredImage && (
        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-chako-accent">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={featuredImage} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate text-chako-ink/60">{title}</p>
        <p className="text-sm font-bold">{formatPrice(price)}</p>
      </div>
      <button
        onClick={handleAdd}
        disabled={isLoading || !available}
        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm flex-shrink-0 transition-all touch-manipulation ${
          !available
            ? 'bg-black/10 text-chako-ink/40 cursor-not-allowed'
            : added
            ? 'bg-green-600 text-white'
            : 'bg-chako-ink text-chako-cream active:scale-95'
        }`}
      >
        <ShoppingBag size={16} />
        {!available ? t('product_out_of_stock') : added ? t('product_added') : t('product_add_to_cart')}
      </button>
      </div>
    </div>
  );
}
