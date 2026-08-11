'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Cart } from '@/types/shopify';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';

// soldOut = the clicked product itself is unavailable (PRIMARY_SOLD_OUT):
// retrying the same add can never succeed, so callers must not.
export interface AddResult {
  ok: boolean;
  soldOut: boolean;
}

interface CartContextValue {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (merchandiseId: string, quantity?: number) => Promise<AddResult>;
  addItems: (
    lines: { merchandiseId: string; quantity: number }[],
    opts?: { suppressErrorToast?: boolean }
  ) => Promise<AddResult>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  totalQuantity: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_ID_KEY = 'chako_cart_id';

// ─── API helpers ──────────────────────────────────────────────────────────────

// lang rides along as ?lang= so the API routes fetch localized line content
async function apiCreateCart(lang: string): Promise<Cart> {
  const res = await fetch(`/api/cart?lang=${lang}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to create cart');
  return res.json();
}

async function apiGetCart(cartId: string, lang: string): Promise<Cart | null> {
  const res = await fetch(`/api/cart/${encodeURIComponent(cartId)}?lang=${lang}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
}

async function apiAddLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
  lang: string
): Promise<Cart & { rejected?: string[] }> {
  const res = await fetch(`/api/cart/${encodeURIComponent(cartId)}/lines?lang=${lang}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lines }),
  });
  if (!res.ok) {
    // Surface the server's error code (e.g. PRIMARY_SOLD_OUT) to the caller
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || 'Failed to add to cart');
  }
  return res.json();
}

async function apiUpdateLines(
  cartId: string,
  lines: { id: string; quantity: number }[],
  lang: string
): Promise<Cart & { removed?: string[] }> {
  const res = await fetch(`/api/cart/${encodeURIComponent(cartId)}/lines?lang=${lang}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lines }),
  });
  if (!res.ok) throw new Error('Failed to update cart');
  return res.json();
}

async function apiRemoveLines(cartId: string, lineIds: string[], lang: string): Promise<Cart> {
  const res = await fetch(`/api/cart/${encodeURIComponent(cartId)}/lines?lang=${lang}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lineIds }),
  });
  if (!res.ok) throw new Error('Failed to remove from cart');
  return res.json();
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { language, t } = useLanguage();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Resolves to a usable cart, or null if Shopify is unreachable.
  // Only replaces a stored cart id when Shopify confirms it's gone (404) —
  // a transient failure (network/5xx) must never wipe the customer's cart.
  // Re-runs on language change so existing cart lines re-localize.
  const initCart = useCallback(async (): Promise<Cart | null> => {
    const storedId = localStorage.getItem(CART_ID_KEY);
    if (storedId) {
      try {
        const existing = await apiGetCart(storedId, language);
        if (existing) { setCart(existing); return existing; }
        // null → genuine 404: cart expired, fall through and create fresh
      } catch {
        return null;
      }
    }
    try {
      const newCart = await apiCreateCart(language);
      localStorage.setItem(CART_ID_KEY, newCart.id);
      setCart(newCart);
      return newCart;
    } catch {
      return null;
    }
  }, [language]);

  useEffect(() => { initCart(); }, [initCart]);

  // All lines land in ONE cartLinesAdd call — a bundle add (product +
  // paired accessories) is atomic: one toast, no partial carts.
  // suppressErrorToast lets a caller retry a failed bundle (e.g. main product
  // only) without flashing "Could not add" before the retry's own outcome.
  const addItems = useCallback(async (
    lines: { merchandiseId: string; quantity: number }[],
    opts?: { suppressErrorToast?: boolean }
  ): Promise<AddResult> => {
    if (lines.length === 0) return { ok: false, soldOut: false };
    setIsLoading(true);
    try {
      // If init failed at page load (or hasn't finished), retry it now
      const target = cart ?? (await initCart());
      if (!target) {
        if (!opts?.suppressErrorToast) toast.error(t('cart_add_failed'));
        return { ok: false, soldOut: false };
      }
      const updated = await apiAddLines(target.id, lines, language);
      setCart(updated);
      setIsOpen(true);
      // The server drops accessories that sold out since the page rendered —
      // name them instead of pretending the whole bundle made it
      if (updated.rejected?.length) {
        for (const title of updated.rejected) {
          toast(t('cart_item_sold_out').replace('{item}', title), { icon: '⚠️' });
        }
      }
      toast.success(t('cart_added'));
      return { ok: true, soldOut: false };
    } catch (err) {
      const soldOut = err instanceof Error && err.message === 'PRIMARY_SOLD_OUT';
      // Sold-out always toasts, even on suppressed bundle attempts: callers
      // skip their retry for soldOut results, so nothing else will report it.
      // Other suppressed failures stay silent — the caller's main-only retry
      // runs unsuppressed and reports the final outcome once.
      if (soldOut) {
        toast.error(t('cart_sold_out'));
      } else if (!opts?.suppressErrorToast) {
        toast.error(t('cart_add_failed'));
      }
      return { ok: false, soldOut };
    } finally {
      setIsLoading(false);
    }
  }, [cart, initCart, language, t]);

  const addItem = useCallback(
    (merchandiseId: string, quantity = 1) => addItems([{ merchandiseId, quantity }]),
    [addItems]
  );

  const updateItem = useCallback(async (lineId: string, quantity: number) => {
    if (!cart) return;
    setIsLoading(true);
    try {
      const updated = await apiUpdateLines(cart.id, [{ id: lineId, quantity }], language);
      setCart(updated);
      // A line the customer tried to change hit zero stock and was removed —
      // never let an item vanish from the drawer without a word
      if (updated.removed?.length) {
        for (const title of updated.removed) {
          toast(t('cart_item_removed_oos').replace('{item}', title), { icon: '⚠️' });
        }
      }
    } catch {
      toast.error(t('cart_update_failed'));
    } finally {
      setIsLoading(false);
    }
  }, [cart, language, t]);

  const removeItem = useCallback(async (lineId: string) => {
    if (!cart) return;
    setIsLoading(true);
    try {
      const updated = await apiRemoveLines(cart.id, [lineId], language);
      setCart(updated);
    } catch {
      toast.error(t('cart_remove_failed'));
    } finally {
      setIsLoading(false);
    }
  }, [cart, language, t]);

  return (
    <CartContext.Provider value={{
      cart,
      isOpen,
      isLoading,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      addItems,
      updateItem,
      removeItem,
      totalQuantity: cart?.totalQuantity ?? 0,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
