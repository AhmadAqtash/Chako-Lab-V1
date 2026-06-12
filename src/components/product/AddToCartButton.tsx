'use client';

import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShoppingBag } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { gsap, prefersReducedMotion } from '@/lib/gsapClient';

interface Props {
  variantId: string;
  available: boolean;
  quantityAvailable: number;
  quantity?: number;
}

export default function AddToCartButton({ variantId, available, quantityAvailable, quantity = 1 }: Props) {
  const { addItem, isLoading } = useCart();
  const { t } = useLanguage();
  const [added, setAdded] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  async function handleAdd() {
    if (!available) return;

    // Press-in feel right away, before the network round-trip
    if (!prefersReducedMotion() && btnRef.current) {
      gsap.to(btnRef.current, { scale: 0.94, duration: 0.1, ease: 'power2.out' });
    }

    const ok = await addItem(variantId, quantity);

    if (!prefersReducedMotion() && btnRef.current) {
      // Elastic release — slightly overshoots, then settles
      gsap.to(btnRef.current, { scale: 1, duration: 0.6, ease: 'elastic.out(1.1, 0.4)' });
      if (ok && iconRef.current) {
        // The bag does a happy little swing
        gsap.fromTo(
          iconRef.current,
          { rotation: 0, y: 0 },
          {
            keyframes: [
              { rotation: -14, y: -3, duration: 0.12 },
              { rotation: 10, duration: 0.12 },
              { rotation: 0, y: 0, duration: 0.3, ease: 'elastic.out(1.2, 0.4)' },
            ],
          }
        );
      }
    }

    if (!ok) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (!available) {
    return (
      <button
        disabled
        className="w-full py-4 bg-black/5 text-chako-ink/40 font-semibold rounded-2xl text-sm cursor-not-allowed"
      >
        {t('product_out_of_stock')}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {quantityAvailable > 0 && quantityAvailable <= 5 && (
        <p className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
          {t('product_only_left').replace('{n}', String(quantityAvailable))}
        </p>
      )}
      <button
        ref={btnRef}
        onClick={handleAdd}
        disabled={isLoading}
        className={cn(
          'w-full py-4 font-semibold rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors touch-manipulation will-change-transform',
          added
            ? 'bg-green-600 text-white'
            : 'bg-chako-ink text-chako-cream hover:bg-chako-ink/90',
          isLoading && 'opacity-70 cursor-wait'
        )}
      >
        <span ref={iconRef} className="inline-flex">
          <ShoppingBag size={18} />
        </span>
        {added ? t('product_added') : t('product_add_to_cart')}
      </button>
    </div>
  );
}
