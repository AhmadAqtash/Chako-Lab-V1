'use client';

import { useState, useEffect, useRef } from 'react';
import Link from '@/components/ui/LocalizedLink';
import ShopifyImage from '@/components/ui/ShopifyImage';
import { formatPrice, extractBaseName } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { Tag } from '@/components/ui/Tag';
import { SHOPIFY_API_VERSION } from '@/lib/shopify-config';
import type { MoneyV2 } from '@/types/shopify';
import Reveal from '@/components/ui/Reveal';

const STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

interface CardProduct {
  id: string;
  handle: string;
  title: string;
  productType: string;
  vendor: string;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: MoneyV2 };
  variants: { nodes: { id: string; availableForSale: boolean }[] };
}

const TABS = [
  { labelEn: 'LinLin',       labelAr: 'لين لين',    productType: 'LinLin Kettle', color: 'linlin'   as const },
  { labelEn: 'Milk Pod',     labelAr: 'ميلك بود',   productType: 'Milk Pod',      color: 'milkpod'  as const },
  { labelEn: 'Bawang',       labelAr: 'باوانج',     productType: 'Bawang Cup',    color: 'bawang'   as const },
  { labelEn: 'BoBo Tumbler', labelAr: 'تمبلر بوبو', productType: 'Thermos Cup',   color: 'bobo'     as const },
  { labelEn: 'Kada',         labelAr: 'كادا',       productType: 'Kada Bottle',   color: 'kada'     as const },
];

// Series tint backgrounds for product image areas
const TYPE_IMG_BG: Record<string, string> = {
  'LinLin Kettle': 'bg-chako-linlin-soft',
  'Milk Pod':      'bg-chako-milkpod-soft',
  'Bawang Cup':    'bg-chako-bawang-soft',
  'Thermos Cup':   'bg-chako-bobo-soft',
  'Kada Bottle':   'bg-chako-kada-soft',
};

// One aliased request, one bucket per tab. Family filtering happens in the
// Shopify search query (matches BASE product_type values regardless of
// @inContext) — never client-side against localized fields: under
// @inContext(language: AR) productType comes back translated, so comparing it
// to the English constants above matched nothing and Arabic showed no products.
const CARD_FIELDS = `
  id handle title productType vendor
  featuredImage { url altText }
  priceRange { minVariantPrice { amount currencyCode } }
  variants(first: 1) { nodes { id availableForSale } }
`;

const PRODUCTS_GQL = `
  query GetHotCategories($language: LanguageCode!) @inContext(language: $language) {
    ${TABS.map(
      (tab, i) =>
        `fam${i}: products(first: 24, sortKey: BEST_SELLING, query: "vendor:'Chako Lab' AND product_type:'${tab.productType}'") { nodes { ${CARD_FIELDS} } }`
    ).join('\n    ')}
  }
`;

export default function HotCategories() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  // One bucket per tab, same order as TABS
  const [families, setFamilies] = useState<CardProduct[][]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [gridVisible, setGridVisible] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://${STORE}/api/${SHOPIFY_API_VERSION}/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': TOKEN,
          },
          body: JSON.stringify({
            query: PRODUCTS_GQL,
            variables: { language: isAr ? 'AR' : 'EN' },
          }),
          signal: ctrl.signal,
        });
        const data = await res.json();
        setFamilies(
          TABS.map((_, i) => (data.data?.[`fam${i}`]?.nodes ?? []) as CardProduct[])
        );
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('[HotCategories] Shopify fetch failed:', err);
      }
      if (!ctrl.signal.aborted) setLoading(false);
    };
    load();
    // Abort on language change/unmount so a slow stale-language response
    // can never overwrite the current one
    return () => ctrl.abort();
  }, [isAr]);

  const familyProducts = families[activeTab] ?? [];
  const tabProducts = familyProducts.slice(0, 8);

  const selectTab = (idx: number) => {
    if (idx === activeTab) return;
    setGridVisible(false);
    setTimeout(() => {
      setActiveTab(idx);
      setGridVisible(true);
    }, 200);
  };

  if (!loading && families.flat().length === 0) return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-8 py-14 md:py-20" dir={isAr ? 'rtl' : 'ltr'}>
      <h2 className="text-heading font-display font-bold mb-8">
        {isAr ? 'الفئات الرائجة' : 'Shop the Drop'}
      </h2>
      <p className="text-chako-ink/40 text-sm py-8">
        {isAr ? 'فشل تحميل المنتجات' : 'Products loading failed - check Shopify connection.'}
      </p>
    </section>
  );

  const activeBg = TYPE_IMG_BG[TABS[activeTab].productType] ?? 'bg-chako-accent';

  return (
    <section
      className="max-w-screen-xl mx-auto px-4 md:px-8 py-14 md:py-20"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Section heading */}
      <Reveal variant="up">
        <h2 className="text-heading font-display font-bold mb-6">
          {isAr ? 'الفئات الرائجة' : 'Shop the Drop'}
        </h2>
      </Reveal>

      {/* Tab bar: Tag primitives, horizontal scroll on mobile, no arrows */}
      <Reveal
        variant="fade"
        delay={80}
        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-momentum pb-1 -mx-4 px-4 mb-7"
      >
        {TABS.map((tab, i) => (
          <Tag
            key={tab.productType}
            label={isAr ? tab.labelAr : tab.labelEn}
            active={i === activeTab}
            color={tab.color}
            size="md"
            onClick={() => selectTab(i)}
          />
        ))}
      </Reveal>

      {/* Product grid: horizontal snap scroll (tab-switch animation stays
          inline below — Reveal only fades the whole rail in on scroll) */}
      <Reveal variant="fade" delay={160} className="relative">
        {/* Scroll-end fade — mobile only (left edge in RTL) */}
        <div className="absolute right-0 rtl:right-auto rtl:left-0 top-0 bottom-2 w-12 bg-gradient-to-l rtl:bg-gradient-to-r from-chako-bg to-transparent pointer-events-none z-10 md:hidden" />

        <div
          ref={gridRef}
          className={`flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 transition-[opacity,transform] duration-200 ease-out ${
            gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-none w-[calc(50%-6px)] md:w-[calc(25%-9px)] snap-start"
                >
                  <div className="aspect-[4/5] rounded-2xl bg-black/5 animate-pulse" />
                  <div className="mt-2 h-3 bg-black/5 animate-pulse rounded-md" />
                  <div className="mt-1.5 h-3 w-2/3 bg-black/5 animate-pulse rounded-md" />
                </div>
              ))
            : tabProducts.length === 0
            ? (
                <p className="text-chako-ink/40 text-sm py-8">
                  {isAr ? 'لا توجد منتجات في هذه الفئة بعد.' : 'No products in this category yet.'}
                </p>
              )
            : tabProducts.map((product, idx) => {
                // Same family bucket by construction; group color variants by
                // base name (works per-locale since all titles share the locale)
                const siblings = familyProducts.filter(
                  (p) => extractBaseName(p.title) === extractBaseName(product.title)
                );
                const soldOut = !product.variants.nodes[0]?.availableForSale;
                const displayTitle = product.title.replace(/^Chako Lab\s+/i, '');
                // Key on the tab's EN constant — product.productType is localized
                const imgBg = TYPE_IMG_BG[TABS[activeTab].productType] ?? 'bg-chako-accent';

                return (
                  <div
                    key={product.id}
                    className="flex-none w-[calc(50%-6px)] md:w-[calc(25%-9px)] snap-start"
                    style={{
                      opacity: gridVisible ? 1 : 0,
                      transform: gridVisible ? 'translateY(0)' : 'translateY(8px)',
                      transition: `opacity 200ms ease-out ${idx * 30}ms, transform 200ms ease-out ${idx * 30}ms`,
                    }}
                  >
                    <Link href={`/products/${product.handle}`} className="group block">
                      <div className={`relative aspect-[4/5] rounded-2xl overflow-hidden ${imgBg}`}>
                        {product.featuredImage ? (
                          <ShopifyImage
                            src={product.featuredImage.url}
                            alt={product.featuredImage.altText || product.title}
                            fill
                            sizes="(max-width: 640px) 50vw, 25vw"
                            className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
                          />
                        ) : (
                          <div className={`w-full h-full ${imgBg}`} />
                        )}

                        {soldOut && (
                          <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                            <span className="-rotate-[8deg] bg-chako-ink text-chako-cream text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                              {isAr ? 'غير متوفر' : 'Sold Out'}
                            </span>
                          </div>
                        )}

                        {!soldOut && (
                          <div className="absolute inset-x-0 bottom-0 p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                            <span className="block w-full text-center py-2.5 bg-chako-ink text-chako-cream text-xs font-semibold rounded-xl">
                              {isAr ? 'اختر الخيارات' : 'Choose Options'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2.5 px-0.5">
                        <h3 className="text-sm font-semibold leading-snug line-clamp-2 mb-1">
                          {displayTitle}
                        </h3>
                        <p className="font-display font-bold text-sm text-chako-ink">
                          {formatPrice(product.priceRange.minVariantPrice)}
                        </p>
                      </div>
                    </Link>

                    {siblings.length > 1 && (
                      <div className="flex gap-1.5 mt-1.5 px-0.5 flex-wrap">
                        {siblings.slice(0, 5).map((sibling) => (
                          <Link
                            key={sibling.id}
                            href={`/products/${sibling.handle}`}
                            title={sibling.title}
                          >
                            <div
                              className={`w-5 h-5 rounded-full border-2 transition-[transform,box-shadow] duration-150 hover:scale-125 shadow-sm cursor-pointer ${
                                sibling.id === product.id
                                  ? 'border-chako-ink ring-1 ring-chako-ink/20 ring-offset-1'
                                  : 'border-white hover:border-chako-ink/30'
                              }`}
                              style={{
                                backgroundImage: sibling.featuredImage
                                  ? `url(${sibling.featuredImage.url})`
                                  : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundColor: sibling.featuredImage ? undefined : '#e5e5e5',
                              }}
                            />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
        </div>
      </Reveal>
    </section>
  );
}
