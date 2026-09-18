'use client';

import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShoppingBag } from 'lucide-react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { gsap, prefersReducedMotion } from '@/lib/gsapClient';
import { addWithPairings } from '@/lib/add-with-pairings';

interface Props {
  variantId: string;
  available: boolean;
  quantity?: number;
  /** Paired accessory lines added alongside the main product (one atomic cart call) */
  extraLines?: { merchandiseId: string; quantity: number }[];
  /** Fires after a successful add — lets the PDP clear pairing checkboxes */
  onAdded?: () => void;
}

export default function AddToCartButton({ variantId, available, quantity = 1, extraLines, onAdded }: Props) {
  const { addItems, isLoading } = useCart();
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

    // Bundle attempt → main-only retry → say so if the accessories were lost.
    // Shared with the sticky bar (lib/add-with-pairings.ts).
    const { ok } = await addWithPairings(
      addItems,
      { merchandiseId: variantId, quantity },
      extraLines ?? [],
      { source: 'pdp_button', onExtrasDropped: () => toast(t('pairing_add_failed'), { icon: '⚠️' }) }
    );

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
    onAdded?.();
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
    <div>
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
