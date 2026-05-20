'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
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
      className={`md:hidden fixed bottom-[60px] left-0 right-0 z-20 bg-chako-bg/95 backdrop-blur-md border-t border-black/8 px-4 py-3 flex items-center gap-3 transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {featuredImage && (
        <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-chako-accent">
          <Image src={featuredImage} alt={title} fill className="object-cover" sizes="48px" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate text-chako-dark/60">{title}</p>
        <p className="text-sm font-bold">{formatPrice(price)}</p>
      </div>
      <button
        onClick={handleAdd}
        disabled={isLoading || !available}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm flex-shrink-0 transition-all ${
          !available
            ? 'bg-black/10 text-chako-dark/40 cursor-not-allowed'
            : added
            ? 'bg-green-600 text-white'
            : 'bg-chako-dark text-chako-bg active:scale-95'
        }`}
      >
        <ShoppingBag size={16} />
        {!available ? 'Sold Out' : added ? 'Added ✓' : 'Add to Cart'}
      </button>
    </div>
  );
}
