'use client';

import { useMemo, useState } from 'react';
import { Product } from '@/types/shopify';
import ProductCard from '@/components/product/ProductCard';
import { SlidersHorizontal, X, ChevronDown, LayoutGrid, Grid2x2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'az';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'az', label: 'A → Z' },
];

interface Props {
  products: Product[];
  title: string;
  description?: string;
  showCollectionHeader?: boolean;
}

export default function CollectionGrid({ products, title, description, showCollectionHeader = true }: Props) {
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
          <p className="text-xs font-semibold text-chako-dark/40 uppercase tracking-widest mb-1">Collection</p>
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-sm text-chako-dark/55 mt-2 max-w-xl leading-relaxed">{description}</p>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-5 py-3 border-y border-black/8">
        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <button
            onClick={() => setInStockOnly(!inStockOnly)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              inStockOnly
                ? 'bg-chako-dark text-chako-bg border-chako-dark'
                : 'border-black/10 text-chako-dark/60 hover:border-black/25 hover:text-chako-dark'
            )}
          >
            <SlidersHorizontal size={12} />
            In Stock
            {inStockOnly && (
              <X size={10} className="ml-0.5" onClick={(e) => { e.stopPropagation(); setInStockOnly(false); }} />
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={() => setInStockOnly(false)}
              className="text-xs text-chako-dark/40 hover:text-chako-dark transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-chako-dark/40 hidden sm:block">
            {sorted.length} product{sorted.length !== 1 ? 's' : ''}
          </span>

          {/* Grid density toggle */}
          <div className="hidden sm:flex items-center gap-0.5 bg-black/5 rounded-lg p-0.5">
            <button
              onClick={() => setDense(false)}
              className={cn('p-1.5 rounded-md transition-colors', !dense ? 'bg-white shadow-sm' : 'hover:bg-black/5')}
              aria-label="Comfortable grid"
            >
              <Grid2x2 size={14} />
            </button>
            <button
              onClick={() => setDense(true)}
              className={cn('p-1.5 rounded-md transition-colors', dense ? 'bg-white shadow-sm' : 'hover:bg-black/5')}
              aria-label="Dense grid"
            >
              <LayoutGrid size={14} />
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-black/10 hover:border-black/25 transition-colors"
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
                        'w-full text-left px-4 py-2 text-xs font-medium transition-colors',
                        sort === opt.value
                          ? 'text-chako-dark bg-chako-accent'
                          : 'text-chako-dark/60 hover:text-chako-dark hover:bg-black/5'
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
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
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
              <p className="text-chako-dark/40 text-sm font-medium">No in-stock products found.</p>
              <button
                onClick={() => setInStockOnly(false)}
                className="mt-3 text-xs font-semibold text-chako-dark hover:underline"
              >
                Show all products
              </button>
            </>
          ) : (
            <>
              <p className="text-chako-dark/40 text-sm font-medium">No products in this collection yet.</p>
              <p className="text-chako-dark/30 text-xs mt-1">Check back soon!</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
