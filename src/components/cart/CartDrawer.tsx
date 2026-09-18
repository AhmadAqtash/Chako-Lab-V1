'use client';

import { useEffect, useRef, useState } from 'react';
import { X, ShoppingBag, Minus, Plus, Trash2, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice, formatPriceExact, cn } from '@/lib/utils';
import { checkoutHref } from '@/lib/checkout';
import { FLAGS } from '@/lib/feature-flags';
import {
  shippingBasis, freeShippingProgress, FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_FEE, SHOP_CURRENCY, PRICES_INCLUDE_VAT,
} from '@/lib/shipping-config';
import { track, trackThen, numericId, type TrackItem } from '@/lib/track';
import { fill } from '@/components/ui/fill';
import ShopifyImage from '@/components/ui/ShopifyImage';
import { Button } from '@/components/ui/Button';
import FreeShippingBar from '@/components/cart/FreeShippingBar';
import CartSetSlider from '@/components/cart/CartSetSlider';
import DispatchPromise from '@/components/shipping/DispatchPromise';

const money = (amount: number) => formatPrice({ amount: String(amount), currencyCode: SHOP_CURRENCY });

// LAYOUT (mobile-first; 375x667 and the ~550px-tall Instagram in-app browser
// are the hard cases — height rules live in globals.css under ".cart-drawer"):
//   header          PINNED  48px
//   free-ship bar   PINNED  64px, constant in every non-empty state
//   scroll region   the ONLY vertical scroller: compact line rows, then the
//                   "Make it a set" slider (mt-auto). The slider is never
//                   pinned, so it can only ever sit below the line items —
//                   it can never take space from them.
//   footer          PINNED  dispatch promise → subtotal → shipping → checkout.
//                   Its one job is Checkout: no payment icons, no discount
//                   field, no second CTA.
export default function CartDrawer() {
  const { cart, cartReady, isOpen, openTrigger, closeCart, updateItem, removeItem, isLoading } = useCart();
  const { t, isRTL, language } = useLanguage();

  const lines = cart?.lines.nodes ?? [];
  const hasLines = lines.length > 0;
  const basis = cart ? shippingBasis(cart.cost) : 0;
  const { unlocked } = freeShippingProgress(basis);

  // A named delivery day is only honest when every line is provably on the
  // shelf: untracked / oversellable variants stay "available" at zero stock.
  const stockOk = hasLines && lines.every((l) => {
    const q = l.merchandise.quantityAvailable;
    return typeof q === 'number' && q >= l.quantity;
  });

  // ── Swipe to close ────────────────────────────────────────────────────────
  // Needs an AXIS check and a TARGET check: the drawer now scrolls a lot and
  // contains a horizontal carousel. Without them, a vertical scroll with some
  // sideways drift — or swiping the carousel backwards — closed the cart.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  function handleTouchStart(e: React.TouchEvent) {
    const inCarousel = (e.target as Element | null)?.closest?.('[data-hscroll]');
    touchStart.current = inCarousel ? null : { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    const towardClose = isRTL ? dx < 0 : dx > 0;
    if (towardClose && Math.abs(dx) > 80 && Math.abs(dx) > 2 * Math.abs(dy)) closeCart();
  }

  // ── Dialog behaviour ──────────────────────────────────────────────────────
  const closeBtn = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    if (isOpen) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      closeBtn.current?.focus({ preventScroll: true });
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = '';
      };
    }
    returnFocus.current?.focus?.({ preventScroll: true });
    returnFocus.current = null;
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, closeCart]);

  // ── Measurement ───────────────────────────────────────────────────────────
  const trackItems = (): TrackItem[] =>
    lines.map((l) => ({
      item_id: numericId(l.merchandise.id),
      item_group_id: numericId(l.merchandise.product.id),
      item_name: l.merchandise.product.title,
      item_brand: 'Chako Lab',
      price: parseFloat(l.merchandise.price.amount),
      quantity: l.quantity,
    }));

  const viewedThisOpen = useRef(false);
  useEffect(() => {
    if (!isOpen) { viewedThisOpen.current = false; return; }
    if (viewedThisOpen.current || !hasLines || !cart) return;
    viewedThisOpen.current = true;
    const p = freeShippingProgress(basis);
    track('view_cart', {
      ecommerce: { currency: cart.cost.subtotalAmount.currencyCode, value: basis, items: trackItems() },
      open_trigger: openTrigger,
      free_shipping_remaining: p.remaining,
      free_shipping_unlocked: p.unlocked,
      locale: language,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, hasLines]);

  function handleCheckout(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!cart) return;
    // Let modified clicks (new tab) through untouched; the href is the fallback
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const href = checkoutHref(cart.checkoutUrl, language);
    trackThen(
      'begin_checkout',
      {
        ecommerce: { currency: cart.cost.subtotalAmount.currencyCode, value: basis, items: trackItems() },
        checkout_source: 'cart_drawer',
        free_shipping_unlocked: unlocked,
        units: cart.totalQuantity,
        locale: language,
      },
      () => window.location.assign(href)
    );
  }

  // ── Flash a line that was not here a moment ago ───────────────────────────
  // After a slider add, the shopper should see WHICH line appeared, without any
  // scrolling (auto-scroll inside a fixed, transformed drawer misbehaves on iOS).
  const knownLines = useRef<Set<string> | null>(null);
  const [flash, setFlash] = useState<ReadonlySet<string>>(new Set());
  useEffect(() => {
    const ids = new Set(lines.map((l) => l.id));
    const known = knownLines.current;
    knownLines.current = ids;
    if (!known || !isOpen) return;
    const fresh = Array.from(ids).filter((id) => !known.has(id));
    if (fresh.length === 0) return;
    setFlash(new Set(fresh));
    const timer = setTimeout(() => setFlash(new Set()), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  const threshold = money(FREE_SHIPPING_THRESHOLD);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={closeCart} aria-hidden="true" />
      )}

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('cart_title')}
        aria-hidden={!isOpen}
        // Off-screen is not the same as gone: without `inert` the closed drawer's
        // buttons and links sit in the tab / VoiceOver order of every page.
        {...(!isOpen ? ({ inert: '' } as object) : {})}
        className={cn(
          'cart-drawer fixed top-0 h-full supports-[height:100dvh]:h-[100dvh] w-full max-w-md bg-chako-cream z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out',
          isRTL ? 'left-0' : 'right-0',
          isOpen ? 'translate-x-0' : isRTL ? '-translate-x-full' : 'translate-x-full'
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* R1 — header */}
        <div className="cart-header flex h-12 flex-shrink-0 items-center justify-between border-b border-black/8 px-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} aria-hidden="true" />
            <span className="font-display font-bold text-lg">{t('cart_title')}</span>
            {(cart?.totalQuantity ?? 0) > 0 && (
              <span className="bg-chako-ink text-chako-cream text-xs font-bold px-2 py-0.5 rounded-full">
                {cart?.totalQuantity}
              </span>
            )}
          </div>
          <button
            ref={closeBtn}
            onClick={closeCart}
            aria-label="Close"
            className="-me-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-black/5 transition-colors active:scale-95 touch-manipulation"
          >
            <X size={20} />
          </button>
        </div>

        {/* R2 — free-shipping bar */}
        {FLAGS.CART_BAR && <FreeShippingBar ready={cartReady} hasLines={hasLines} basis={basis} />}

        {/* R3 — the only vertical scroller */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4">
          {!cartReady ? null : !hasLines ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag size={48} className="text-black/20" aria-hidden="true" />
              <p className="text-chako-ink/60 font-medium">{t('cart_empty')}</p>
              <Button variant="solid-ink" onClick={closeCart}>
                {t('cart_continue')}
              </Button>
            </div>
          ) : (
            <div className="flex min-h-full flex-col py-3">
              <ul className="space-y-3">
                {lines.map((line) => (
                  <li
                    key={line.id}
                    className={cn(
                      '-mx-2 flex gap-3 rounded-xl px-2 py-1 transition-colors duration-700',
                      flash.has(line.id) && 'bg-chako-highlight/40'
                    )}
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-chako-accent">
                      {line.merchandise.product.featuredImage && (
                        <ShopifyImage
                          src={line.merchandise.product.featuredImage.url}
                          alt={line.merchandise.product.featuredImage.altText || line.merchandise.product.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium leading-[17px] line-clamp-2">
                        {line.merchandise.product.title}
                      </p>
                      {line.merchandise.title !== 'Default Title' && (
                        <p className="mt-0.5 text-[11px] text-chako-ink/50">{line.merchandise.title}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded-xl bg-black/5 px-1.5 py-1">
                          <button
                            onClick={() => updateItem(line.id, line.quantity - 1)}
                            disabled={isLoading || line.quantity <= 1}
                            aria-label="Decrease quantity"
                            className="relative flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/10 transition-colors disabled:opacity-40 active:scale-90 touch-manipulation before:absolute before:-inset-1.5"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-5 text-center text-sm font-medium tabular-nums">{line.quantity}</span>
                          <button
                            onClick={() => updateItem(line.id, line.quantity + 1)}
                            disabled={isLoading}
                            aria-label="Increase quantity"
                            className="relative flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/10 transition-colors disabled:opacity-40 active:scale-90 touch-manipulation before:absolute before:-inset-1.5"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(line.id)}
                          disabled={isLoading}
                          aria-label="Remove"
                          className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40 active:scale-95 touch-manipulation before:absolute before:-inset-1"
                        >
                          <Trash2 size={14} />
                        </button>
                        <bdi className="ms-auto text-sm font-semibold tabular-nums">
                          {formatPriceExact(line.cost.totalAmount)}
                        </bdi>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Rendered only while open: unmounting IS its reset, and a closed
                  drawer must not keep cards, links and a fetch alive */}
              {FLAGS.CART_SLIDER && isOpen && cart && <CartSetSlider cart={cart} basis={basis} />}
            </div>
          )}
        </div>

        {/* R4 — footer */}
        {cartReady && cart && hasLines && (
          <div
            className="cart-footer flex-shrink-0 space-y-2 border-t border-black/8 px-4 pt-2.5"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
            {FLAGS.PDP_DISPATCH && isOpen && <DispatchPromise variant="cart" stockOk={stockOk} />}

            <div>
              <div className="flex justify-between text-sm leading-5">
                <span className="text-chako-ink/60">{t('cart_subtotal')}</span>
                <bdi className="font-semibold tabular-nums">{formatPriceExact(cart.cost.subtotalAmount)}</bdi>
              </div>

              {/* An ADD-ON line, never a summary row — so the subtotal on the
                  button is not contradicted by a figure printed above it.
                  "after discounts" rides in BOTH states: a code typed at Shopify
                  checkout is invisible to this cart, and can turn an "unlocked"
                  AED 260 into AED 234 + AED 25. */}
              {FLAGS.CART_BAR && (
                <p className={cn('flex items-center gap-1 text-[12px] leading-4', unlocked ? 'font-semibold text-green-700' : 'text-chako-ink/70')}>
                  {unlocked && <Check size={12} strokeWidth={3} className="flex-shrink-0" aria-hidden="true" />}
                  <span>
                    {unlocked
                      ? fill(t('cart_shipping_free'), { threshold: <bdi>{threshold}</bdi> })
                      : fill(t('cart_shipping_paid'), {
                          fee: <bdi>{money(FLAT_SHIPPING_FEE)}</bdi>,
                          threshold: <bdi>{threshold}</bdi>,
                        })}
                  </span>
                </p>
              )}

              {!PRICES_INCLUDE_VAT && (
                <p className="text-[11px] leading-[15px] text-chako-ink/40">{t('cart_taxes_note')}</p>
              )}
            </div>

            <a
              href={checkoutHref(cart.checkoutUrl, language)}
              onClick={handleCheckout}
              className="cart-checkout flex w-full items-center justify-center min-h-[52px] px-8 py-3.5 bg-chako-ink text-chako-cream font-display font-bold text-base rounded-2xl hover:bg-chako-ink/90 transition-all duration-150 active:scale-[0.98] touch-manipulation select-none"
            >
              {t('cart_checkout')}
              {/* own element with symmetric margins, so the spacing survives RTL */}
              <span className="mx-1.5" aria-hidden="true">—</span>
              <bdi>{formatPriceExact(cart.cost.subtotalAmount)}</bdi>
            </a>
          </div>
        )}
      </div>
    </>
  );
}
