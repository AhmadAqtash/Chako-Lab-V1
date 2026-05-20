'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Cart } from '@/types/shopify';
import toast from 'react-hot-toast';

interface CartContextValue {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  totalQuantity: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_ID_KEY = 'chako_cart_id';

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiCreateCart(): Promise<Cart> {
  const res = await fetch('/api/cart', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to create cart');
  return res.json();
}

async function apiGetCart(cartId: string): Promise<Cart | null> {
  const res = await fetch(`/api/cart/${encodeURIComponent(cartId)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
}

async function apiAddLines(cartId: string, lines: { merchandiseId: string; quantity: number }[]): Promise<Cart> {
  const res = await fetch(`/api/cart/${encodeURIComponent(cartId)}/lines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lines }),
  });
  if (!res.ok) throw new Error('Failed to add to cart');
  return res.json();
}

async function apiUpdateLines(cartId: string, lines: { id: string; quantity: number }[]): Promise<Cart> {
  const res = await fetch(`/api/cart/${encodeURIComponent(cartId)}/lines`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lines }),
  });
  if (!res.ok) throw new Error('Failed to update cart');
  return res.json();
}

async function apiRemoveLines(cartId: string, lineIds: string[]): Promise<Cart> {
  const res = await fetch(`/api/cart/${encodeURIComponent(cartId)}/lines`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lineIds }),
  });
  if (!res.ok) throw new Error('Failed to remove from cart');
  return res.json();
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initCart = useCallback(async () => {
    const storedId = localStorage.getItem(CART_ID_KEY);
    if (storedId) {
      try {
        const existing = await apiGetCart(storedId);
        if (existing) { setCart(existing); return; }
      } catch {
        // cart expired or token not yet configured — create fresh
      }
    }
    try {
      const newCart = await apiCreateCart();
      localStorage.setItem(CART_ID_KEY, newCart.id);
      setCart(newCart);
    } catch {
      // Storefront token not yet configured — cart will be available once token is set
    }
  }, []);

  useEffect(() => { initCart(); }, [initCart]);

  const addItem = useCallback(async (merchandiseId: string, quantity = 1) => {
    if (!cart) return;
    setIsLoading(true);
    try {
      const updated = await apiAddLines(cart.id, [{ merchandiseId, quantity }]);
      setCart(updated);
      setIsOpen(true);
      toast.success('Added to cart');
    } catch {
      toast.error('Could not add to cart');
    } finally {
      setIsLoading(false);
    }
  }, [cart]);

  const updateItem = useCallback(async (lineId: string, quantity: number) => {
    if (!cart) return;
    setIsLoading(true);
    try {
      const updated = await apiUpdateLines(cart.id, [{ id: lineId, quantity }]);
      setCart(updated);
    } catch {
      toast.error('Could not update cart');
    } finally {
      setIsLoading(false);
    }
  }, [cart]);

  const removeItem = useCallback(async (lineId: string) => {
    if (!cart) return;
    setIsLoading(true);
    try {
      const updated = await apiRemoveLines(cart.id, [lineId]);
      setCart(updated);
    } catch {
      toast.error('Could not remove item');
    } finally {
      setIsLoading(false);
    }
  }, [cart]);

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
