'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Check, Truck, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { Cart } from '@/types/shopify';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCartUpsell } from '@/lib/useCartUpsell';
import { orderUpsell, type UpsellItem } from '@/lib/cart-upsell';
import { freeShippingProgress, unlocksWith } from '@/lib/shipping-config';
import { fillText } from '@/components/ui/fill';
import { formatPrice, extractBaseName, extractColorName, cn } from '@/lib/utils';
import { track, numericId, type TrackItem } from '@/lib/track';
import ShopifyImage from '@/components/ui/ShopifyImage';
import Link from '@/components/ui/LocalizedLink';

interface Props {
  cart: Cart;
  /** shippingBasis(cart.cost) */
  basis: number;
}

const LIST_ID = 'cart_make_it_a_set';
const BRAND = /\s*(?:Chako\s?Lab|شاكو لاب)\s*/gi;
const shortName = (title: string) => extractBaseName(title).replace(BRAND, ' ').replace(/\s+/g, ' ').trim();

/**
 * "Make it a set" — best-selling TUMBLERS (never accessories) under the cart's
 * line items. Rendered only while the drawer is open, so it unmounts on close:
 * that unmount IS the reset for everything frozen below.
 *
 * What it may and may not say:
 *  - There is no bundle discount, so the word "bundle" never appears and the
 *    title/sub make NO price or shipping claim — they are true in every cart.
 *  - The one claim lives on the card, computed per card, exactly: the green
 *    "Unlocks free shipping" strip shows only when THIS price takes THIS cart
 *    to AED 250. (AED 149 + AED 99 = 248 → no strip.)
 *
 * Guarding a AED 150+ one-tap action:
 *  - only the button adds, never the card body — a carousel swipe cannot buy;
 *  - the row is FROZEN while the drawer is open: membership and order never
 *    change under the thumb, an added card stays in place as "Added", and
 *    every Add is inert for 600ms after any cart mutation settles.
 */
export default function CartSetSlider({ cart, basis }: Props) {
  const { addItem, closeCart, isLoading } = useCart();
  const { t, language, isRTL } = useLanguage();
  const { items, families, loading } = useCartUpsell(language, true);

  // FREEZE: computed once, the first time the pool is available for this open.
  const frozen = useRef<UpsellItem[] | null>(null);
  if (!frozen.current && items.length > 0) {
    const lines = cart.lines.nodes.map((l) => ({
      productId: l.merchandise.product.id,
      unitPrice: parseFloat(l.merchandise.price.amount),
    }));
    frozen.current = orderUpsell(items, families, lines, basis);
  }
  const row = frozen.current ?? [];

  const [added, setAdded] = useState<ReadonlySet<string>>(new Set());
  const [soldOut, setSoldOut] = useState<ReadonlySet<string>>(new Set());
  const [pending, setPending] = useState<string | null>(null);
  const [announce, setAnnounce] = useState('');

  // 600ms cool-down after ANY cart mutation settles (add, quantity, remove)
  const [cooling, setCooling] = useState(false);
  const wasLoading = useRef(false);
  useEffect(() => {
    if (wasLoading.current && !isLoading) {
      setCooling(true);
      const id = setTimeout(() => setCooling(false), 600);
      wasLoading.current = isLoading;
      return () => clearTimeout(id);
    }
    wasLoading.current = isLoading;
  }, [isLoading]);

  const below = !freeShippingProgress(basis).unlocked;
  const unlocks = (item: UpsellItem) => below && unlocksWith(basis, parseFloat(item.price.amount));
  // In a row where SOME cards carry the strip, the others reserve its height so
  // every image lines up; the row changes height once, at the crossing.
  const anyStrip = row.some((i) => !added.has(i.id) && unlocks(i));

  const trackItems = useMemo<TrackItem[]>(
    () =>
      row.map((i, index) => ({
        item_id: numericId(i.variantId),
        item_group_id: numericId(i.id),
        item_name: i.title,
        item_brand: 'Chako Lab',
        price: parseFloat(i.price.amount),
        quantity: 1,
        index,
      })),
    [row]
  );

  // view_item_list: once per open, after the row has been >=50% visible for 1s
  const scroller = useRef<HTMLDivElement>(null);
  const viewed = useRef(false);
  useEffect(() => {
    const el = scroller.current;
    if (!el || viewed.current || row.length === 0) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        clearTimeout(timer);
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          timer = setTimeout(() => {
            if (viewed.current) return;
            viewed.current = true;
            track('view_item_list', {
              ecommerce: { item_list_id: LIST_ID, item_list_name: 'Make it a set', items: trackItems },
              locale: language,
            });
          }, 1000);
        }
      },
      { threshold: [0, 0.5, 1] }
    );
    io.observe(el);
    return () => { clearTimeout(timer); io.disconnect(); };
  }, [row.length, trackItems, language]);

  if (row.length === 0) {
    // Hold the space with skeletons only while we genuinely expect cards
    if (!loading) return null;
    return (
      <div className="mt-auto" aria-hidden="true">
        <div className="mt-3 border-t border-black/8 pt-3">
          <div className="h-5 w-32 rounded bg-black/5" />
          <div className="mt-3 flex gap-3 overflow-hidden">
            {[0, 1].map((i) => (
              <div key={i} className="set-card h-24 w-[min(280px,78vw)] flex-shrink-0 rounded-2xl border-2 border-black/8 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  async function handleAdd(item: UpsellItem, index: number) {
    if (pending || isLoading || cooling) return;
    setPending(item.id);
    const { ok, soldOut: gone } = await addItem(item.variantId, 1, {
      source: 'cart_set_slider',
      unlockTag: unlocks(item),
      listIndex: index,
    });
    setPending(null);
    if (ok) {
      setAdded((prev) => new Set(prev).add(item.id));
      setAnnounce(`${shortName(item.title)} — ${t('cart_added')}`);
    } else if (gone) {
      setSoldOut((prev) => new Set(prev).add(item.id));
    }
  }

  function handleInspect(item: UpsellItem, index: number) {
    track('select_item', {
      ecommerce: { item_list_id: LIST_ID, item_list_name: 'Make it a set', items: [trackItems[index]] },
      locale: language,
    });
    closeCart();
  }

  // Desktop chevrons. scrollLeft runs negative in RTL, so "next" flips sign.
  function page(dir: 1 | -1) {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * (isRTL ? -1 : 1) * el.clientWidth * 0.8, behavior: 'smooth' });
  }
  const Prev = isRTL ? ChevronRight : ChevronLeft;
  const Next = isRTL ? ChevronLeft : ChevronRight;

  return (
    <section className="mt-auto" aria-label={t('cart_set_title')}>
      <div className="mt-3 border-t border-black/8 pt-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display font-bold text-base leading-5">{t('cart_set_title')}</h3>
            <p className="set-sub mt-0.5 text-[12px] leading-[18px] text-chako-ink/60 truncate">{t('cart_set_sub')}</p>
          </div>
          <div className="hidden md:flex flex-shrink-0 gap-1">
            <button type="button" onClick={() => page(-1)} aria-label={t('cart_set_prev')} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 transition-colors">
              <Prev size={16} />
            </button>
            <button type="button" onClick={() => page(1)} aria-label={t('cart_set_next')} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 transition-colors">
              <Next size={16} />
            </button>
          </div>
        </div>

        {/* data-hscroll: the drawer's swipe-to-close ignores touches that start here */}
        <div
          ref={scroller}
          data-hscroll
          role="group"
          aria-label={t('cart_set_title')}
          className="mt-2.5 -mx-4 flex gap-3 overflow-x-auto overscroll-x-contain snap-x snap-mandatory scrollbar-hide px-4 scroll-ps-4 pb-1"
        >
          {row.map((item, index) => {
            const isAdded = added.has(item.id);
            const isGone = soldOut.has(item.id);
            const isPending = pending === item.id;
            const strip = !isAdded && !isGone && unlocks(item);
            const colour = extractColorName(item.title);
            const name = shortName(item.title);

            return (
              <div
                key={item.id}
                className="set-card flex w-[min(280px,78vw)] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border-2 border-black/8"
              >
                {strip ? (
                  <p className="set-unlock flex items-center gap-1 bg-green-50 px-2.5 py-1 text-[11px] font-bold leading-[14px] text-green-700">
                    <Truck size={12} className="flex-shrink-0 rtl:-scale-x-100" aria-hidden="true" />
                    {t('cart_set_unlocks')}
                  </p>
                ) : (
                  anyStrip && <div className="h-[22px]" aria-hidden="true" />
                )}

                <div className="set-card-row flex items-center gap-3 p-2.5">
                  <Link
                    href={`/products/${item.handle}`}
                    onClick={() => handleInspect(item, index)}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <span className="relative block h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-xl bg-chako-accent">
                      {item.image && (
                        <ShopifyImage src={item.image} alt="" fill sizes="72px" className="object-cover" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold leading-[17px]">{name}</span>
                      {colour && <span className="block truncate text-[11px] leading-[15px] text-chako-ink/50">{colour}</span>}
                      <bdi className="mt-0.5 block text-sm font-extrabold">{formatPrice(item.price)}</bdi>
                    </span>
                  </Link>

                  {/* ONLY this button adds. font-bold sits on the same element
                      as bg-chako-ink so the titanium theme flips both together. */}
                  <button
                    type="button"
                    onClick={() => handleAdd(item, index)}
                    disabled={isAdded || isGone || isPending || isLoading || cooling}
                    aria-label={fillText(t('cart_set_add_aria'), { item: name, price: formatPrice(item.price) })}
                    className={cn(
                      'flex min-h-[44px] min-w-[64px] flex-shrink-0 items-center justify-center gap-1 rounded-xl px-2.5 text-xs font-bold transition-colors touch-manipulation',
                      isAdded
                        ? 'bg-green-600 text-white'
                        : isGone
                        ? 'bg-black/5 text-chako-ink/40'
                        : 'bg-chako-ink text-chako-cream active:scale-95 disabled:opacity-60'
                    )}
                  >
                    {isPending ? (
                      <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                    ) : isAdded ? (
                      <><Check size={13} strokeWidth={3} aria-hidden="true" />{t('cart_set_added')}</>
                    ) : isGone ? (
                      t('product_out_of_stock')
                    ) : (
                      <><Plus size={13} strokeWidth={3} aria-hidden="true" />{t('cart_set_add')}</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Always mounted so the add is announced (see PairingCarousel) */}
        <p aria-live="polite" className="sr-only">{announce}</p>
      </div>
    </section>
  );
}
