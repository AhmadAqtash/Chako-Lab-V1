'use client';

import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { X, ShoppingBag, Minus, Plus, Trash2, Clock } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem, isLoading } = useCart();
  const { t, isRTL, language } = useLanguage();
  const touchStartX = useRef<number | null>(null);

  // Open Shopify checkout in the storefront's current language
  function checkoutHref(url: string): string {
    try {
      const u = new URL(url);
      u.searchParams.set('locale', language);
      return u.toString();
    } catch {
      return url;
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (!isRTL && diff > 80) closeCart();
    if (isRTL && diff < -80) closeCart();
    touchStartX.current = null;
  }

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      <div
        className={`cart-drawer fixed top-0 h-full w-full max-w-md bg-chako-cream z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          isRTL ? 'left-0' : 'right-0'
        } ${
          isOpen ? 'translate-x-0' : isRTL ? '-translate-x-full' : 'translate-x-full'
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} />
            <span className="font-display font-bold text-xl">{t('cart_title')}</span>
            {(cart?.totalQuantity ?? 0) > 0 && (
              <span className="bg-chako-ink text-chako-cream text-xs font-bold px-2 py-0.5 rounded-full">
                {cart?.totalQuantity}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="w-11 h-11 flex items-center justify-center hover:bg-black/5 rounded-full transition-colors active:scale-95 touch-manipulation">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!cart || cart.lines.nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={48} className="text-black/20" />
              <p className="text-chako-ink/60 font-medium">{t('cart_empty')}</p>
              <Button variant="solid-ink" onClick={closeCart}>
                {t('cart_continue')}
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.lines.nodes.map((line) => (
                <li key={line.id} className="flex gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-chako-accent">
                    {line.merchandise.product.featuredImage && (
                      <Image
                        src={line.merchandise.product.featuredImage.url}
                        alt={line.merchandise.product.featuredImage.altText || line.merchandise.product.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-tight line-clamp-2">
                      {line.merchandise.product.title}
                    </p>
                    {line.merchandise.title !== 'Default Title' && (
                      <p className="text-xs text-chako-ink/50 mt-0.5">{line.merchandise.title}</p>
                    )}
                    <p className="text-sm font-semibold mt-1">
                      {formatPrice(line.cost.totalAmount)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 bg-black/5 rounded-xl px-1.5 py-1">
                        <button
                          onClick={() => updateItem(line.id, line.quantity - 1)}
                          disabled={isLoading || line.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center hover:bg-black/10 rounded-lg transition-colors disabled:opacity-40 active:scale-90 touch-manipulation"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="text-sm font-medium w-5 text-center">{line.quantity}</span>
                        <button
                          onClick={() => updateItem(line.id, line.quantity + 1)}
                          disabled={isLoading}
                          className="w-8 h-8 flex items-center justify-center hover:bg-black/10 rounded-lg transition-colors disabled:opacity-40 active:scale-90 touch-manipulation"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(line.id)}
                        disabled={isLoading}
                        className="w-9 h-9 flex items-center justify-center hover:bg-red-50 hover:text-red-500 rounded-full transition-colors disabled:opacity-40 active:scale-95 touch-manipulation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart && cart.lines.nodes.length > 0 && (
          <div className="px-6 pt-4 border-t border-black/8 space-y-4" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
            <div className="flex justify-between text-sm">
              <span className="text-chako-ink/60">{t('cart_subtotal')}</span>
              <span className="font-semibold">{formatPrice(cart.cost.subtotalAmount)}</span>
            </div>
            <div className="flex items-center gap-2 bg-chako-highlight/30 rounded-xl px-3 py-2.5">
              <Clock size={14} className="flex-shrink-0 text-chako-ink/50" />
              <p className="text-xs font-medium text-chako-ink/70">
                {t('cart_order_2pm')}
              </p>
            </div>
            <p className="text-xs text-chako-ink/40 text-center">
              {t('cart_taxes_note')}
            </p>
            <a
              href={checkoutHref(cart.checkoutUrl)}
              className="flex w-full items-center justify-center min-h-[56px] px-8 py-4 bg-chako-ink text-chako-cream font-display font-bold text-base rounded-2xl hover:bg-chako-ink/90 transition-all duration-150 active:scale-[0.98] touch-manipulation select-none"
            >
              {t('cart_checkout')} — {formatPrice(cart.cost.subtotalAmount)}
            </a>
          </div>
        )}
      </div>
    </>
  );
}
