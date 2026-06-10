'use client';

import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

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

  async function handleAdd() {
    if (!available) return;
    const ok = await addItem(variantId, quantity);
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
        onClick={handleAdd}
        disabled={isLoading}
        className={cn(
          'w-full py-4 font-semibold rounded-2xl text-sm flex items-center justify-center gap-2 transition-all touch-manipulation',
          added
            ? 'bg-green-600 text-white'
            : 'bg-chako-ink text-chako-cream hover:bg-chako-ink/90 active:scale-[0.98]',
          isLoading && 'opacity-70 cursor-wait'
        )}
      >
        <ShoppingBag size={18} />
        {added ? t('product_added') : t('product_add_to_cart')}
      </button>
    </div>
  );
}
