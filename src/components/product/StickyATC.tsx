'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';
import { MoneyV2 } from '@/types/shopify';
import { ShoppingBag } from 'lucide-react';

interface Props {
  title: string;
  price: MoneyV2;
  variantId: string;
  available: boolean;
  triggerRef: React.RefObject<HTMLElement>;
  featuredImage?: string | null;
}

export default function StickyATC({ title, price, variantId, available, triggerRef, featuredImage }: Props) {
  const { addItem, isLoading } = useCart();
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

  async function handleAdd() {
    if (!available) return;
    await addItem(variantId);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div
      className={`sticky-atc md:hidden fixed left-0 right-0 z-20 bg-chako-bg/95 backdrop-blur-md border-t border-black/8 px-4 py-3 flex items-center gap-3 transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 58px)' }}
    >
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
  );
}
