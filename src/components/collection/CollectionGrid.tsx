'use client';

import { useMemo, useState } from 'react';
import { Product } from '@/types/shopify';
import ProductCard from '@/components/product/ProductCard';
import { SlidersHorizontal, X, ChevronDown, LayoutGrid, Grid2x2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import SectionLabel from '@/components/ui/SectionLabel';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'az';

interface Props {
  products: Product[];
  title: string;
  description?: string;
  showCollectionHeader?: boolean;
}

export default function CollectionGrid({ products, title, description, showCollectionHeader = true }: Props) {
  const { t } = useLanguage();

  const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'featured', label: t('collection_sort_featured') },
    { value: 'price-asc', label: t('collection_sort_price_asc') },
    { value: 'price-desc', label: t('collection_sort_price_desc') },
    { value: 'newest', label: t('collection_sort_newest') },
    { value: 'az', label: t('collection_sort_az') },
  ];

  const [sort, setSort] = useState<SortKey>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [dense, setDense] = useState(false);

  const sorted = useMemo(() => {
    let list = [...products];

    if (inStockOnly) {
      list = list.filter((p) => p.variants.nodes.some((v) => v.availableForSale));
    }

    switch (sort) {
      case 'price-asc':
        list.sort(
          (a, b) =>
            parseFloat(a.priceRange.minVariantPrice.amount) -
            parseFloat(b.priceRange.minVariantPrice.amount)
        );
        break;
      case 'price-desc':
        list.sort(
          (a, b) =>
            parseFloat(b.priceRange.minVariantPrice.amount) -
            parseFloat(a.priceRange.minVariantPrice.amount)
        );
        break;
      case 'newest':
        list.sort((a, b) => {
          const aId = parseInt(a.id.split('/').pop() || '0', 10);
          const bId = parseInt(b.id.split('/').pop() || '0', 10);
          return bId - aId;
        });
        break;
      case 'az':
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return list;
  }, [products, sort, inStockOnly]);

  const activeFilterCount = (inStockOnly ? 1 : 0);
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Featured';

  return (
    <div>
      {/* Collection header */}
      {showCollectionHeader && (
        <div className="mb-6">
          <SectionLabel className="mb-2">{t('collection_all_label')}</SectionLabel>
          <h1 className="text-heading font-display font-bold">{title}</h1>
          {description && (
            <p className="text-sm text-chako-ink/55 mt-2 max-w-xl leading-relaxed">{description}</p>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 mb-5 py-2 border-y border-black/8">
        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            onClick={() => setInStockOnly(!inStockOnly)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-full text-xs font-semibold transition-all duration-150 active:scale-95 touch-manipulation',
              inStockOnly
                ? 'bg-chako-ink text-chako-cream'
                : 'bg-black/5 text-chako-ink/60 hover:bg-black/10 hover:text-chako-ink'
            )}
          >
            <SlidersHorizontal size={12} />
            {t('collection_in_stock')}
            {inStockOnly && (
              <X size={10} className="ml-0.5" onClick={(e) => { e.stopPropagation(); setInStockOnly(false); }} />
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={() => setInStockOnly(false)}
              className="text-xs text-chako-ink/40 hover:text-chako-ink transition-colors px-1 min-h-[44px] flex items-center touch-manipulation"
            >
              {t('collection_clear')}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-chako-ink/40 hidden sm:block">
            {sorted.length} product{sorted.length !== 1 ? 's' : ''}
          </span>

          {/* Grid density toggle */}
          <div className="flex items-center gap-0.5 bg-black/5 rounded-full p-1">
            <button
              onClick={() => setDense(false)}
              className={cn('p-2 rounded-full transition-colors touch-manipulation', !dense ? 'bg-chako-ink text-chako-cream' : 'text-chako-ink/50 hover:text-chako-ink')}
              aria-label="Comfortable grid"
            >
              <Grid2x2 size={14} />
            </button>
            <button
              onClick={() => setDense(true)}
              className={cn('p-2 rounded-full transition-colors touch-manipulation', dense ? 'bg-chako-ink text-chako-cream' : 'text-chako-ink/50 hover:text-chako-ink')}
              aria-label="Dense grid"
            >
              <LayoutGrid size={14} />
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-full text-xs font-semibold bg-black/5 text-chako-ink/70 hover:bg-black/10 hover:text-chako-ink transition-all duration-150 active:scale-95 touch-manipulation"
            >
              {sortLabel}
              <ChevronDown size={12} className={cn('transition-transform', sortOpen && 'rotate-180')} />
            </button>

            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 z-20 bg-white rounded-2xl shadow-lg border border-black/8 py-1.5 min-w-[180px]">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setSortOpen(false); }}
                      className={cn(
                        'w-full text-left px-4 py-3 min-h-[44px] text-xs font-semibold transition-colors touch-manipulation',
                        sort === opt.value
                          ? 'text-chako-ink bg-chako-ink/10'
                          : 'text-chako-ink/60 hover:text-chako-ink hover:bg-black/5'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      {sorted.length > 0 ? (
        <div
          className={cn(
            'grid gap-3 md:gap-4',
            dense
              ? 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          )}
        >
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-chako-accent rounded-3xl">
          {inStockOnly ? (
            <>
              <p className="text-chako-ink/40 text-sm font-medium">{t('collection_no_instock')}</p>
              <button
                onClick={() => setInStockOnly(false)}
                className="mt-3 text-xs font-semibold text-chako-ink hover:underline"
              >
                {t('collection_show_all')}
              </button>
            </>
          ) : (
            <>
              <p className="text-chako-ink/40 text-sm font-medium">{t('collection_no_products')}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
