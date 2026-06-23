'use client';

import Link from '@/components/ui/LocalizedLink';
import ShopifyImage from '@/components/ui/ShopifyImage';
import { useLocalePathname } from '@/lib/useLocalePathname';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/translations';
import { SHOPIFY_API_VERSION } from '@/lib/shopify-config';
import { ChevronDown } from 'lucide-react';

// Series list for the Categories dropdown (titanium intentionally excluded here —
// it has its own dedicated pill at the end of the nav).
// `type` = base productType: the site's collections are VIRTUAL (productType
// filters, see PRODUCT_TYPE_TO_COLLECTION) — Shopify collection(handle:)
// returns null for these handles, so thumbnails must come from products.
const SERIES: { handle: string; key: TranslationKey; type: string }[] = [
  { handle: 'linlin-kettles',   key: 'cat_linlin',   type: 'LinLin Kettle' },
  { handle: 'bawang-cups',      key: 'cat_bawang',   type: 'Bawang Cup' },
  { handle: 'milk-pods',        key: 'cat_milkpods', type: 'Milk Pod' },
  { handle: 'bobo-tumblers',    key: 'cat_bobo',     type: 'Thermos Cup' },
  { handle: 'kada-bottles',     key: 'cat_kada',     type: 'Kada Bottle' },
  { handle: 'pangpang-cups',    key: 'cat_pangpang', type: 'PangPang Cup' },
  { handle: 'baobao-food-cups', key: 'cat_baobao',   type: 'Food Cup' },
  { handle: 'pots',             key: 'cat_pots',     type: 'Pot' },
  { handle: 'mugs',             key: 'cat_mugs',     type: 'Coffee Mug' },
  { handle: 'square-cups',      key: 'cat_square',   type: 'Square Cup' },
];

/* ── Category thumbnails (client-side Storefront fetch, HotCategories pattern) ──
   One aliased query resolves every collection at once. Prefer the collection's
   own image; fall back to its first product's featuredImage. Results are cached
   in module scope per language so reopening the menu (or remounting the nav on
   navigation) never refetches. */
const STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

type CatThumb = { url: string; alt: string | null };
type ThumbMap = Record<string, CatThumb | null>;
type LangCode = 'EN' | 'AR';

const THUMBS_GQL = `
  query CategoryNavThumbs($language: LanguageCode!) @inContext(language: $language) {
    ${SERIES.map(
      ({ type }, i) =>
        `c${i}: products(first: 1, query: "vendor:'Chako Lab' AND product_type:'${type}'") {
          nodes { featuredImage { url altText } }
        }`
    ).join('\n    ')}
  }
`;

const thumbsCache: Partial<Record<LangCode, ThumbMap>> = {};
const thumbsInflight: Partial<Record<LangCode, Promise<ThumbMap | null>>> = {};

function loadCategoryThumbs(language: LangCode): Promise<ThumbMap | null> {
  const cached = thumbsCache[language];
  if (cached) return Promise.resolve(cached);
  const inflight = thumbsInflight[language];
  if (inflight) return inflight;

  const promise = (async () => {
    try {
      const res = await fetch(`https://${STORE}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': TOKEN,
        },
        body: JSON.stringify({ query: THUMBS_GQL, variables: { language } }),
      });
      const data = await res.json();
      const map: ThumbMap = {};
      SERIES.forEach(({ handle }, i) => {
        const img = data.data?.[`c${i}`]?.nodes?.[0]?.featuredImage ?? null;
        map[handle] = img?.url ? { url: img.url, alt: img.altText ?? null } : null;
      });
      thumbsCache[language] = map;
      return map;
    } catch (err) {
      console.error('[CategoryNav] thumbs fetch failed:', err);
      return null; // not cached — next open retries
    } finally {
      delete thumbsInflight[language];
    }
  })();
  thumbsInflight[language] = promise;
  return promise;
}

const PANEL_MAX_W = 400; // px — clamped to 92vw on small screens

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function CategoryNav() {
  // Locale-stripped pathname: comparisons below stay locale-agnostic
  const pathname = useLocalePathname();
  const { t, language, isRTL } = useLanguage();
  const isAr = language === 'ar';
  const [openCats, setOpenCats] = useState(false);
  // panelShown drives the entrance transition (flips true a frame after mount)
  const [panelShown, setPanelShown] = useState(false);
  const [thumbs, setThumbs] = useState<ThumbMap>({});
  const [catsPos, setCatsPos] = useState<{ top: number; left: number; width: number; originX: number }>(
    { top: 0, left: 0, width: PANEL_MAX_W, originX: 0 }
  );
  const catsRef = useRef<HTMLDivElement>(null);
  const catsBtnRef = useRef<HTMLButtonElement>(null);
  const onTitanium = pathname === '/collections/titanium';

  // close dropdown on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (catsRef.current && !catsRef.current.contains(e.target as Node)) setOpenCats(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // close on route change
  useEffect(() => { setOpenCats(false); }, [pathname]);

  // close dropdown on scroll (prevents the fixed panel from detaching/floating)
  useEffect(() => {
    if (!openCats) return;
    const close = () => setOpenCats(false);
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, [openCats]);

  // close on Escape, returning focus to the trigger
  useEffect(() => {
    if (!openCats) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenCats(false);
        catsBtnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openCats]);

  // entrance: flip panelShown a frame after the panel mounts so the
  // opacity/scale transition actually runs (reduced motion: show instantly)
  useEffect(() => {
    if (!openCats) { setPanelShown(false); return; }
    if (reducedMotion()) { setPanelShown(true); return; }
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPanelShown(true));
    });
    return () => { cancelAnimationFrame(raf1); if (raf2) cancelAnimationFrame(raf2); };
  }, [openCats]);

  // load thumbnails when the menu opens (module cache → instant on reopen);
  // text-only rows render meanwhile, thumb boxes reserved so nothing shifts
  useEffect(() => {
    if (!openCats) return;
    const lang: LangCode = isAr ? 'AR' : 'EN';
    const cached = thumbsCache[lang];
    if (cached) { setThumbs(cached); return; }
    let cancelled = false;
    loadCategoryThumbs(lang).then((map) => {
      if (!cancelled && map) setThumbs(map);
    });
    return () => { cancelled = true; };
  }, [openCats, isAr]);

  const openCatsPanel = () => {
    const r = catsBtnRef.current?.getBoundingClientRect();
    if (r) {
      const vw = window.innerWidth;
      const width = Math.min(vw * 0.92, PANEL_MAX_W);
      // Anchor to the trigger (its end edge in RTL), clamped inside the viewport
      let left = isRTL ? r.right - width : r.left;
      left = Math.min(left, vw - width - 8);
      left = Math.max(8, left);
      setCatsPos({ top: r.bottom + 8, left, width, originX: r.left + r.width / 2 - left });
    }
    setOpenCats((v) => !v);
  };

  const noMotion = reducedMotion();

  const linkBase = 'flex-shrink-0 px-3 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap';
  const linkIdle = onTitanium
    ? 'text-white/70 hover:text-white hover:bg-white/10'
    : 'text-chako-ink/70 hover:text-chako-ink hover:bg-black/5';
  const linkActive = onTitanium
    ? 'bg-white/15 text-white'
    : 'bg-chako-ink text-chako-cream';

  const isActive = (href: string) => pathname === href;

  return (
    <div className="sticky top-12 md:top-14 z-20 border-b border-black/8 bg-chako-bg">
      <nav className="flex items-center md:justify-center gap-1 px-4 md:px-8 py-2 md:py-2.5 max-w-screen-xl mx-auto overflow-x-auto overflow-y-visible scrollbar-hide">
        {/* Home */}
        <Link href="/" className={cn(linkBase, isActive('/') ? linkActive : linkIdle)}>
          {t('nav_home')}
        </Link>

        {/* Shop All */}
        <Link href="/collections" className={cn(linkBase, isActive('/collections') ? linkActive : linkIdle)}>
          {t('nav_all_products')}
        </Link>

        {/* Categories dropdown */}
        <div className="relative" ref={catsRef}>
          <button
            ref={catsBtnRef}
            type="button"
            onClick={openCatsPanel}
            onPointerEnter={() => { void loadCategoryThumbs(isAr ? 'AR' : 'EN'); }}
            className={cn(linkBase, 'inline-flex items-center gap-1', openCats ? linkActive : linkIdle)}
            aria-expanded={openCats}
            aria-haspopup="true"
          >
            {t('nav_categories')}
            <ChevronDown size={15} className={cn('transition-transform', openCats && 'rotate-180')} />
          </button>
          {openCats && (
            <div
              className="cat-dropdown fixed z-[70] max-h-[70vh] overflow-y-auto bg-chako-cream rounded-2xl shadow-xl border border-black/8 p-2"
              style={{
                top: catsPos.top,
                left: catsPos.left,
                width: catsPos.width,
                transformOrigin: `${catsPos.originX}px top`,
                opacity: panelShown ? 1 : 0,
                transform: panelShown ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(-6px)',
                transition: noMotion
                  ? undefined
                  : 'opacity 250ms var(--ease-spring), transform 250ms var(--ease-spring)',
              }}
            >
              <div className="grid grid-cols-2 gap-1">
                {SERIES.map(({ handle, key }, i) => {
                  const thumb = thumbs[handle];
                  return (
                    // Outer div owns the stagger fade; the Link owns the hover
                    // lift so the two transforms never fight each other
                    <div
                      key={handle}
                      style={{
                        opacity: panelShown ? 1 : 0,
                        transform: panelShown ? 'none' : 'translateY(6px)',
                        transition: noMotion
                          ? undefined
                          : `opacity 220ms ease-out ${40 + i * 22}ms, transform 220ms var(--ease-out-strong) ${40 + i * 22}ms`,
                      }}
                    >
                      <Link
                        href={`/collections/${handle}`}
                        className="flex items-center gap-3 min-w-0 rounded-xl px-2.5 py-2 text-sm font-medium text-chako-ink/80 hover:text-chako-ink hover:bg-black/5 motion-safe:hover:-translate-y-[2px] transition-[transform,background-color,color] duration-200"
                      >
                        {/* Thumb box is always reserved (44px) — cream placeholder
                            until the image arrives, so rows never shift */}
                        <span className="relative w-11 h-11 flex-none rounded-xl overflow-hidden bg-[#EAE2D3]">
                          {thumb && (
                            <ShopifyImage
                              src={thumb.url}
                              alt={thumb.alt || t(key)}
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          )}
                        </span>
                        <span className="truncate">{t(key)}</span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* New */}
        <Link href="/collections/new" className={cn(linkBase, isActive('/collections/new') ? linkActive : linkIdle)}>
          {t('nav_new')}
        </Link>

        {/* Titanium — premium gold pill, always present */}
        <Link
          href="/collections/titanium"
          className={cn(
            'flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ms-1',
            onTitanium
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#F2D272] text-[#1a1a1a] shadow-md'
              : 'titanium-pill ps-7 shadow-sm'
          )}
        >
          {t('cat_titanium')}
        </Link>
      </nav>
    </div>
  );
}
