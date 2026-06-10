'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Cart } from '@/types/shopify';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';

interface CartContextValue {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (merchandiseId: string, quantity?: number) => Promise<boolean>;
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

async function apiAddLines(cartId: string, lines: { merchandiseId: string; quantity: number }[], lang: string): Promise<Cart> {
  const res = await fetch(`/api/cart/${encodeURIComponent(cartId)}/lines?lang=${lang}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lines }),
  });
  if (!res.ok) throw new Error('Failed to add to cart');
  return res.json();
}

async function apiUpdateLines(cartId: string, lines: { id: string; quantity: number }[], lang: string): Promise<Cart> {
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
  const { language } = useLanguage();
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

  const addItem = useCallback(async (merchandiseId: string, quantity = 1): Promise<boolean> => {
    setIsLoading(true);
    try {
      // If init failed at page load (or hasn't finished), retry it now
      const target = cart ?? (await initCart());
      if (!target) {
        toast.error('Could not add to cart');
        return false;
      }
      const updated = await apiAddLines(target.id, [{ merchandiseId, quantity }], language);
      setCart(updated);
      setIsOpen(true);
      toast.success('Added to cart');
      return true;
    } catch {
      toast.error('Could not add to cart');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [cart, initCart, language]);

  const updateItem = useCallback(async (lineId: string, quantity: number) => {
    if (!cart) return;
    setIsLoading(true);
    try {
      const updated = await apiUpdateLines(cart.id, [{ id: lineId, quantity }], language);
      setCart(updated);
    } catch {
      toast.error('Could not update cart');
    } finally {
      setIsLoading(false);
    }
  }, [cart, language]);

  const removeItem = useCallback(async (lineId: string) => {
    if (!cart) return;
    setIsLoading(true);
    try {
      const updated = await apiRemoveLines(cart.id, [lineId], language);
      setCart(updated);
    } catch {
      toast.error('Could not remove item');
    } finally {
      setIsLoading(false);
    }
  }, [cart, language]);

  return (
    <CartContext.Provider value={{
      cart,
      isOpen,
      isLoading,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
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
