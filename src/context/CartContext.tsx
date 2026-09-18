'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Cart } from '@/types/shopify';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';
import { checkoutHref } from '@/lib/checkout';
import { noteServerDate } from '@/lib/server-clock';
import { prefetchCartUpsell } from '@/lib/useCartUpsell';
import { shippingBasis, freeShippingProgress } from '@/lib/shipping-config';
import { track, trackThen, numericId, type AtcSource, type TrackItem } from '@/lib/track';

// soldOut = the clicked product itself is unavailable (PRIMARY_SOLD_OUT):
// retrying the same add can never succeed, so callers must not.
export interface AddResult {
  ok: boolean;
  soldOut: boolean;
}

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface AddOptions {
  suppressErrorToast?: boolean;
  /** Where the add came from — the one dimension every lift question needs. */
  source?: AtcSource;
  /** Slider adds only: did this card carry the "Unlocks free shipping" strip? */
  unlockTag?: boolean;
  listIndex?: number;
}

export type CartOpenTrigger = 'auto_after_add' | 'manual';

interface CartContextValue {
  cart: Cart | null;
  /** True once the first cart load has settled (found, created, or failed). */
  cartReady: boolean;
  isOpen: boolean;
  isLoading: boolean;
  /** Why the drawer is open — read by the drawer's view_cart event. */
  openTrigger: CartOpenTrigger;
  openCart: () => void;
  closeCart: () => void;
  addItem: (merchandiseId: string, quantity?: number, opts?: AddOptions) => Promise<AddResult>;
  addItems: (lines: CartLineInput[], opts?: AddOptions) => Promise<AddResult>;
  /**
   * Adds the lines (lines[0] = the product, the rest = ticked accessories),
   * then goes straight to Shopify checkout without opening the drawer.
   * Whatever is already in the cart goes along.
   */
  buyNow: (lines: CartLineInput[]) => Promise<AddResult>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  totalQuantity: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_ID_KEY = 'chako_cart_id';

// ─── API helpers ──────────────────────────────────────────────────────────────
// Every helper hands its response to noteServerDate: these calls are uncached
// and happen on every page load anyway, so they double as the server-clock
// source for the dispatch countdown (lib/server-clock.ts) at no extra cost.

// lang rides along as ?lang= so the API routes fetch localized line content
async function apiCreateCart(lang: string): Promise<Cart> {
  const t0 = Date.now();
  const res = await fetch(`/api/cart?lang=${lang}`, { method: 'POST' });
  noteServerDate(res, t0);
  if (!res.ok) throw new Error('Failed to create cart');
  return res.json();
}

async function apiGetCart(cartId: string, lang: string): Promise<Cart | null> {
  const t0 = Date.now();
  const res = await fetch(`/api/cart/${encodeURIComponent(cartId)}?lang=${lang}`);
  noteServerDate(res, t0);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
}

async function apiAddLines(
  cartId: string,
  lines: CartLineInput[],
  lang: string
): Promise<Cart & { rejected?: string[] }> {
  const t0 = Date.now();
  const res = await fetch(`/api/cart/${encodeURIComponent(cartId)}/lines?lang=${lang}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lines }),
  });
  noteServerDate(res, t0);
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

// ─── Measurement ──────────────────────────────────────────────────────────────
// All cart events fire HERE, the single choke point, and only on confirmed
// success — so no surface can forget one and none is counted twice.

const basisOf = (cart: Cart | null) => (cart ? shippingBasis(cart.cost) : 0);

function itemsFor(cart: Cart, merchandiseIds: ReadonlySet<string>, quantities?: Map<string, number>): TrackItem[] {
  return cart.lines.nodes
    .filter((l) => merchandiseIds.has(l.merchandise.id))
    .map((l) => ({
      item_id: numericId(l.merchandise.id),
      item_group_id: numericId(l.merchandise.product.id),
      item_name: l.merchandise.product.title,
      item_brand: 'Chako Lab' as const,
      price: parseFloat(l.merchandise.price.amount),
      quantity: quantities?.get(l.merchandise.id) ?? l.quantity,
    }));
}

const valueOf = (items: TrackItem[]) => items.reduce((sum, i) => sum + i.price * i.quantity, 0);

function trackAdd(before: Cart | null, after: Cart, lines: CartLineInput[], opts: AddOptions | undefined, locale: string) {
  const qty = new Map(lines.map((l) => [l.merchandiseId, l.quantity]));
  const items = itemsFor(after, new Set(qty.keys()), qty);
  if (items.length === 0) return;
  const crossed = !freeShippingProgress(basisOf(before)).unlocked && freeShippingProgress(basisOf(after)).unlocked;
  track('add_to_cart', {
    ecommerce: { currency: after.cost.subtotalAmount.currencyCode, value: valueOf(items), items },
    atc_source: opts?.source ?? 'other',
    paired_count: Math.max(0, lines.length - 1),
    cart_value_after: basisOf(after),
    crossed_free_shipping: crossed,
    ...(opts?.unlockTag !== undefined ? { unlock_tag: opts.unlockTag } : {}),
    ...(opts?.listIndex !== undefined ? { index: opts.listIndex } : {}),
    locale,
  });
  if (crossed) {
    track('free_shipping_unlocked', { cart_value: basisOf(after), via: opts?.source ?? 'other', locale });
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { language, t } = useLanguage();
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartReady, setCartReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const openTrigger = useRef<CartOpenTrigger>('manual');

  // Resolves to a usable cart, or null if Shopify is unreachable.
  // Only replaces a stored cart id when Shopify confirms it's gone (404) —
  // a transient failure (network/5xx) must never wipe the customer's cart.
  // Re-runs on language change so existing cart lines re-localize.
  const initCart = useCallback(async (): Promise<Cart | null> => {
    try {
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
    } finally {
      setCartReady(true);
    }
  }, [language]);

  useEffect(() => { initCart(); }, [initCart]);

  // Back from Shopify checkout via the bfcache: this page is restored with its
  // old state — a Buy-it-now spinner still spinning and a header count that no
  // longer matches. Reset and re-read.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return;
      setIsLoading(false);
      initCart();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [initCart]);

  // All lines land in ONE cartLinesAdd call — a bundle add (product +
  // paired accessories) is atomic: no partial carts.
  // suppressErrorToast lets a caller retry a failed bundle (e.g. main product
  // only) without flashing "Could not add" before the retry's own outcome.
  const addItems = useCallback(async (lines: CartLineInput[], opts?: AddOptions): Promise<AddResult> => {
    if (lines.length === 0) return { ok: false, soldOut: false };
    setIsLoading(true);
    // Warm the "Make it a set" pool now, so its cards are ready by the time
    // this add opens the drawer
    prefetchCartUpsell(language);
    try {
      // If init failed at page load (or hasn't finished), retry it now
      const target = cart ?? (await initCart());
      if (!target) {
        if (!opts?.suppressErrorToast) toast.error(t('cart_add_failed'));
        return { ok: false, soldOut: false };
      }
      const updated = await apiAddLines(target.id, lines, language);
      setCart(updated);
      if (!isOpen) openTrigger.current = 'auto_after_add';
      setIsOpen(true);
      // The server drops accessories that sold out since the page rendered —
      // name them instead of pretending the whole bundle made it
      if (updated.rejected?.length) {
        for (const title of updated.rejected) {
          toast(t('cart_item_sold_out').replace('{item}', title), { icon: '⚠️' });
        }
      }
      // No success toast: the drawer opening IS the confirmation, and the
      // toaster sits bottom-centre — exactly on top of the Checkout button,
      // for 2.5s, at the most valuable moment of every add.
      trackAdd(target, updated, lines, opts, language);
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
  }, [cart, initCart, isOpen, language, t]);

  const addItem = useCallback(
    (merchandiseId: string, quantity = 1, opts?: AddOptions) => addItems([{ merchandiseId, quantity }], opts),
    [addItems]
  );

  const buyNow = useCallback(async (lines: CartLineInput[]): Promise<AddResult> => {
    if (lines.length === 0) return { ok: false, soldOut: false };
    setIsLoading(true);
    // On success the spinner is deliberately NEVER cleared: the page is
    // unloading, and re-enabling the buttons during a slow unload lets a
    // second tap put quantity 2 into checkout.
    let leaving = false;
    try {
      const target = cart ?? (await initCart());
      if (!target) {
        toast.error(t('cart_add_failed'));
        return { ok: false, soldOut: false };
      }
      const updated = await apiAddLines(target.id, lines, language);
      setCart(updated);
      trackAdd(target, updated, lines, { source: 'pdp_buy_now' }, language);

      // Something the shopper ticked did not make it, or there is nowhere to
      // send them: show the cart instead. Nobody lands in checkout missing an
      // item they chose, and nobody gets stranded.
      if (updated.rejected?.length || !updated.checkoutUrl) {
        for (const title of updated.rejected ?? []) {
          toast(t('cart_item_sold_out').replace('{item}', title), { icon: '⚠️' });
        }
        openTrigger.current = 'auto_after_add';
        setIsOpen(true);
        return { ok: true, soldOut: false };
      }

      leaving = true;
      const items = itemsFor(updated, new Set(updated.lines.nodes.map((l) => l.merchandise.id)));
      trackThen(
        'begin_checkout',
        {
          ecommerce: { currency: updated.cost.subtotalAmount.currencyCode, value: basisOf(updated), items },
          checkout_source: 'pdp_buy_now',
          free_shipping_unlocked: freeShippingProgress(basisOf(updated)).unlocked,
          units: updated.totalQuantity,
          locale: language,
        },
        () => window.location.assign(checkoutHref(updated.checkoutUrl, language))
      );
      return { ok: true, soldOut: false };
    } catch (err) {
      const soldOut = err instanceof Error && err.message === 'PRIMARY_SOLD_OUT';
      toast.error(t(soldOut ? 'cart_sold_out' : 'cart_add_failed'));
      return { ok: false, soldOut };
    } finally {
      if (!leaving) setIsLoading(false);
    }
  }, [cart, initCart, language, t]);

  const trackRemove = useCallback(
    (before: Cart, after: Cart, source: 'cart_trash' | 'qty_decrease' | 'oos_auto') => {
      const still = new Map(after.lines.nodes.map((l) => [l.id, l.quantity]));
      const gone = before.lines.nodes.filter((l) => (still.get(l.id) ?? 0) < l.quantity);
      if (gone.length === 0) return;
      const items: TrackItem[] = gone.map((l) => ({
        item_id: numericId(l.merchandise.id),
        item_group_id: numericId(l.merchandise.product.id),
        item_name: l.merchandise.product.title,
        item_brand: 'Chako Lab',
        price: parseFloat(l.merchandise.price.amount),
        quantity: l.quantity - (still.get(l.id) ?? 0),
      }));
      track('remove_from_cart', {
        ecommerce: { currency: before.cost.subtotalAmount.currencyCode, value: valueOf(items), items },
        remove_source: source,
        cart_value_after: basisOf(after),
        locale: language,
      });
    },
    [language]
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
      trackRemove(cart, updated, updated.removed?.length ? 'oos_auto' : 'qty_decrease');
      const crossed =
        !freeShippingProgress(basisOf(cart)).unlocked && freeShippingProgress(basisOf(updated)).unlocked;
      if (crossed) track('free_shipping_unlocked', { cart_value: basisOf(updated), via: 'cart_quantity', locale: language });
    } catch {
      toast.error(t('cart_update_failed'));
    } finally {
      setIsLoading(false);
    }
  }, [cart, language, t, trackRemove]);

  const removeItem = useCallback(async (lineId: string) => {
    if (!cart) return;
    setIsLoading(true);
    try {
      const updated = await apiRemoveLines(cart.id, [lineId], language);
      setCart(updated);
      trackRemove(cart, updated, 'cart_trash');
    } catch {
      toast.error(t('cart_remove_failed'));
    } finally {
      setIsLoading(false);
    }
  }, [cart, language, t, trackRemove]);

  const openCart = useCallback(() => {
    openTrigger.current = 'manual';
    setIsOpen(true);
  }, []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  return (
    <CartContext.Provider value={{
      cart,
      cartReady,
      isOpen,
      isLoading,
      openTrigger: openTrigger.current,
      openCart,
      closeCart,
      addItem,
      addItems,
      buyNow,
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
