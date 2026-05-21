'use client';

import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { X, ShoppingBag, Minus, Plus, Trash2, Clock } from 'lucide-react';
import { useEffect } from 'react';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem, isLoading } = useCart();
  const { t, isRTL } = useLanguage();

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
        className={`fixed top-0 h-full w-full max-w-md bg-chako-bg z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
          isRTL ? 'left-0' : 'right-0'
        } ${
          isOpen ? 'translate-x-0' : isRTL ? '-translate-x-full' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} />
            <span className="font-semibold text-lg">{t('cart_title')}</span>
            {(cart?.totalQuantity ?? 0) > 0 && (
              <span className="bg-chako-dark text-chako-bg text-xs font-bold px-2 py-0.5 rounded-full">
                {cart?.totalQuantity}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!cart || cart.lines.nodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={48} className="text-black/20" />
              <p className="text-chako-dark/60 font-medium">{t('cart_empty')}</p>
              <button
                onClick={closeCart}
                className="px-6 py-2 bg-chako-dark text-chako-bg rounded-full text-sm font-medium hover:bg-chako-dark/90 transition-colors"
              >
                {t('cart_continue')}
              </button>
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
                      <p className="text-xs text-chako-dark/50 mt-0.5">{line.merchandise.title}</p>
                    )}
                    <p className="text-sm font-semibold mt-1">
                      {formatPrice(line.cost.totalAmount)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 bg-black/5 rounded-full px-2 py-1">
                        <button
                          onClick={() => updateItem(line.id, line.quantity - 1)}
                          disabled={isLoading || line.quantity <= 1}
                          className="p-0.5 hover:bg-black/10 rounded-full transition-colors disabled:opacity-40"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-medium w-5 text-center">{line.quantity}</span>
                        <button
                          onClick={() => updateItem(line.id, line.quantity + 1)}
                          disabled={isLoading}
                          className="p-0.5 hover:bg-black/10 rounded-full transition-colors disabled:opacity-40"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(line.id)}
                        disabled={isLoading}
                        className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors disabled:opacity-40"
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
          <div className="px-6 py-4 border-t border-black/8 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-chako-dark/60">{t('cart_subtotal')}</span>
              <span className="font-semibold">{formatPrice(cart.cost.subtotalAmount)}</span>
            </div>
            <div className="flex items-center gap-2 bg-chako-highlight/30 rounded-xl px-3 py-2.5">
              <Clock size={14} className="flex-shrink-0 text-chako-dark/50" />
              <p className="text-xs font-medium text-chako-dark/70">
                {t('cart_order_2pm')}
              </p>
            </div>
            <p className="text-xs text-chako-dark/40 text-center">
              {t('cart_taxes_note')}
            </p>
            <a
              href={cart.checkoutUrl}
              className="block w-full text-center py-3.5 bg-chako-dark text-chako-bg font-semibold rounded-2xl hover:bg-chako-dark/90 transition-colors"
            >
              {t('cart_checkout')} — {formatPrice(cart.cost.subtotalAmount)}
            </a>
          </div>
        )}
      </div>
    </>
  );
}
