'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice, extractBaseName } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { Tag } from '@/components/ui/Tag';
import { SHOPIFY_API_VERSION } from '@/lib/shopify-config';
import type { MoneyV2 } from '@/types/shopify';

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

const PRODUCTS_GQL = `
  query GetAllChakoProducts($first: Int!, $query: String, $language: LanguageCode!) @inContext(language: $language) {
    products(first: $first, sortKey: BEST_SELLING, query: $query) {
      nodes {
        id handle title productType vendor
        featuredImage { url altText }
        priceRange { minVariantPrice { amount currencyCode } }
        variants(first: 1) { nodes { id availableForSale } }
      }
    }
  }
`;

const EASE = 'cubic-bezier(0.23,1,0.32,1)';

export default function HotCategories() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [allProducts, setAllProducts] = useState<CardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [gridVisible, setGridVisible] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { setRevealed(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
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
            variables: { first: 100, query: `vendor:'Chako Lab'`, language: isAr ? 'AR' : 'EN' },
          }),
        });
        const data = await res.json();
        const nodes = (data.data?.products?.nodes ?? []) as CardProduct[];
        setAllProducts(nodes.filter((p) => p.vendor === 'Chako Lab'));
      } catch (err) {
        console.error('[HotCategories] Shopify fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAr]);

  const tabProducts = allProducts
    .filter((p) => p.productType === TABS[activeTab].productType)
    .slice(0, 8);

  const selectTab = (idx: number) => {
    if (idx === activeTab) return;
    setGridVisible(false);
    setTimeout(() => {
      setActiveTab(idx);
      setGridVisible(true);
    }, 200);
  };

  if (!loading && allProducts.length === 0) return (
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
      ref={sectionRef}
      className="max-w-screen-xl mx-auto px-4 md:px-8 py-14 md:py-20"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Section heading */}
      <div
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'translateY(0)' : 'translateY(20px)',
          transition: `opacity 600ms ${EASE}, transform 600ms ${EASE}`,
        }}
      >
        <h2 className="text-heading font-display font-bold mb-6">
          {isAr ? 'الفئات الرائجة' : 'Shop the Drop'}
        </h2>
      </div>

      {/* Tab bar: Tag primitives, horizontal scroll on mobile, no arrows */}
      <div
        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-momentum pb-1 -mx-4 px-4 mb-7"
        style={{
          opacity: revealed ? 1 : 0,
          transition: `opacity 600ms ${EASE} 80ms`,
        }}
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
      </div>

      {/* Product grid: horizontal snap scroll */}
      <div className="relative">
        {/* Right-edge fade — mobile only */}
        <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-chako-bg to-transparent pointer-events-none z-10 md:hidden" />

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
                const siblings = allProducts.filter(
                  (p) =>
                    p.productType === product.productType &&
                    extractBaseName(p.title) === extractBaseName(product.title)
                );
                const soldOut = !product.variants.nodes[0]?.availableForSale;
                const displayTitle = product.title.replace(/^Chako Lab\s+/i, '');
                const imgBg = TYPE_IMG_BG[product.productType] ?? 'bg-chako-accent';

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
                          <Image
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
      </div>
    </section>
  );
}
