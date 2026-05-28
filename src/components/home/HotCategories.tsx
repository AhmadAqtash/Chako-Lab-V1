'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice, extractBaseName } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
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
  { labelEn: 'LinLin',       labelAr: 'لين لين',      productType: 'LinLin Kettle' },
  { labelEn: 'Milk Pod',     labelAr: 'ميلك بود',      productType: 'Milk Pod'      },
  { labelEn: 'Bawang',       labelAr: 'باوانج',        productType: 'Bawang Cup'    },
  { labelEn: 'BoBo Tumbler', labelAr: 'تمبلر بوبو',    productType: 'Thermos Cup'   },
  { labelEn: 'Kada',         labelAr: 'كادا',          productType: 'Kada Bottle'   },
];

const PRODUCTS_GQL = `
  query GetAllChakoProducts($first: Int!, $query: String) {
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

export default function HotCategories() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [allProducts, setAllProducts] = useState<CardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [gridVisible, setGridVisible] = useState(true);
  const tabsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`https://${STORE}/api/2024-01/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': TOKEN,
          },
          body: JSON.stringify({
            query: PRODUCTS_GQL,
            variables: { first: 100, query: `vendor:'Chako Lab'` },
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
  }, []);

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

  const scrollTabs = (dir: number) => {
    tabsRef.current?.scrollBy({ left: dir * 160, behavior: 'smooth' });
  };

  const scrollGrid = (dir: number) => {
    const el = gridRef.current;
    if (!el) return;
    el.scrollBy({ left: (isAr ? -dir : dir) * el.offsetWidth, behavior: 'smooth' });
  };

  if (!loading && allProducts.length === 0) return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-8 py-16 md:py-20" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mb-8">
        <p className="text-xs font-semibold text-chako-dark/40 uppercase tracking-widest mb-2">
          {isAr ? 'الأكثر رواجاً' : 'Trending Now'}
        </p>
        <h2 className="text-3xl md:text-4xl font-bold">{isAr ? 'الفئات الرائجة' : 'Hot Categories'}</h2>
      </div>
      <p className="text-chako-dark/40 text-sm py-8">
        {isAr ? 'فشل تحميل المنتجات — تحقق من اتصال Shopify API.' : 'Products loading failed — check Shopify API connection.'}
      </p>
    </section>
  );

  return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-8 py-16 md:py-20" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mb-8">
        <p className="text-xs font-semibold text-chako-dark/40 uppercase tracking-widest mb-2">
          {isAr ? 'الأكثر رواجاً' : 'Trending Now'}
        </p>
        <h2 className="text-3xl md:text-4xl font-bold">{isAr ? 'الفئات الرائجة' : 'Hot Categories'}</h2>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => scrollTabs(-1)}
          className="flex-shrink-0 w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5 hover:scale-110 active:scale-95 transition-[transform,background-color] duration-150 touch-manipulation cursor-pointer"
          aria-label="Scroll tabs left"
        >
          <ChevronLeft size={16} />
        </button>
        <div
          ref={tabsRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide flex-1"
        >
          {TABS.map((tab, i) => (
            <button
              key={tab.productType}
              onClick={() => selectTab(i)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors touch-manipulation ${
                i === activeTab
                  ? 'bg-chako-dark text-chako-bg'
                  : 'border border-black/15 text-chako-dark/70 hover:border-black/30 hover:text-chako-dark'
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>
        <button
          onClick={() => scrollTabs(1)}
          className="flex-shrink-0 w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5 hover:scale-110 active:scale-95 transition-[transform,background-color] duration-150 touch-manipulation cursor-pointer"
          aria-label="Scroll tabs right"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Product grid */}
      <div className="relative">
        <button
          onClick={() => scrollGrid(-1)}
          className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-md rounded-full items-center justify-center hover:shadow-lg hover:scale-110 active:scale-95 transition-[transform,box-shadow] duration-150 cursor-pointer"
          aria-label="Previous products"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => scrollGrid(1)}
          className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-md rounded-full items-center justify-center hover:shadow-lg hover:scale-110 active:scale-95 transition-[transform,box-shadow] duration-150 cursor-pointer"
          aria-label="Next products"
        >
          <ChevronRight size={18} />
        </button>

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
                  <div className="aspect-square rounded-2xl bg-black/5 animate-pulse" />
                  <div className="mt-2 h-3 bg-black/5 animate-pulse rounded-md" />
                  <div className="mt-1.5 h-3 w-2/3 bg-black/5 animate-pulse rounded-md" />
                </div>
              ))
            : tabProducts.length === 0
            ? (
                <p className="text-chako-dark/40 text-sm py-8">
                  {isAr ? 'لا توجد منتجات في هذه الفئة بعد.' : 'No products available in this category yet.'}
                </p>
              )
            : tabProducts.map((product) => {
                const siblings = allProducts.filter(
                  (p) =>
                    p.productType === product.productType &&
                    extractBaseName(p.title) === extractBaseName(product.title)
                );
                const soldOut = !product.variants.nodes[0]?.availableForSale;
                const displayTitle = product.title.replace(/^Chako Lab\s+/i, '');

                return (
                  <div
                    key={product.id}
                    className="flex-none w-[calc(50%-6px)] md:w-[calc(25%-9px)] snap-start"
                  >
                    <Link href={`/products/${product.handle}`} className="group block">
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-chako-accent">
                        {product.featuredImage ? (
                          <Image
                            src={product.featuredImage.url}
                            alt={product.featuredImage.altText || product.title}
                            fill
                            sizes="(max-width: 640px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-chako-accent" />
                        )}

                        {soldOut && (
                          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                            <span className="-rotate-[10deg] bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg">
                              {isAr ? 'غير متوفر' : 'Sold Out'}
                            </span>
                          </div>
                        )}

                        {!soldOut && (
                          <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="block w-full text-center py-2 bg-chako-dark text-chako-bg text-xs font-semibold rounded-xl">
                              {isAr ? 'اختر الخيارات' : 'Choose Options'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2.5 px-0.5">
                        <p className="text-xs font-medium text-chako-dark/40 uppercase tracking-wider mb-0.5">
                          CHAKO LAB
                        </p>
                        <h3 className="text-sm font-semibold leading-snug line-clamp-2">
                          {displayTitle}
                        </h3>
                        <p className="text-sm font-bold mt-1">
                          {formatPrice(product.priceRange.minVariantPrice)}
                        </p>
                      </div>
                    </Link>

                    {/* Color swatches */}
                    {siblings.length > 1 && (
                      <div className="flex gap-1.5 mt-1.5 px-0.5 flex-wrap">
                        {siblings.slice(0, 5).map((sibling) => (
                          <Link
                            key={sibling.id}
                            href={`/products/${sibling.handle}`}
                            title={sibling.title}
                          >
                            <div
                              className={`w-5 h-5 rounded-full border-2 transition-[transform,box-shadow] duration-150 hover:scale-125 hover:shadow-md shadow-sm cursor-pointer ${
                                sibling.id === product.id
                                  ? 'border-chako-dark ring-1 ring-chako-dark/20 ring-offset-1'
                                  : 'border-white hover:border-chako-dark/30'
                              }`}
                              style={{
                                backgroundImage: sibling.featuredImage
                                  ? `url(${sibling.featuredImage.url})`
                                  : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundColor: sibling.featuredImage
                                  ? undefined
                                  : '#e5e5e5',
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
