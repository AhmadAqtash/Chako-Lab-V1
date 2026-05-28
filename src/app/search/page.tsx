import { cookies } from 'next/headers';
import { searchProducts } from '@/lib/shopify';
import type { ShopifyLanguage } from '@/lib/shopify';
import ProductCard from '@/components/product/ProductCard';
import SearchInput from './SearchInput';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search',
};

interface Props {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: Props) {
  const query = searchParams.q?.trim() || '';
  const lang: ShopifyLanguage = cookies().get('chako_lang')?.value === 'ar' ? 'AR' : 'EN';
  const products = query ? await searchProducts(query, lang) : [];

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-10">
      <h1 className="text-fluid-heading font-bold mb-6">Search</h1>
      <SearchInput initialQuery={query} />

      {query && (
        <div className="mt-8">
          <p className="text-sm text-chako-dark/50 mb-6">
            {products.length > 0
              ? `${products.length} result${products.length === 1 ? '' : 's'} for "${query}"`
              : `No results for "${query}"`}
          </p>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-chako-accent rounded-3xl">
              <p className="text-chako-dark/40 text-sm font-medium">No products found.</p>
              <p className="text-chako-dark/30 text-xs mt-1">Try a different search term.</p>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="text-center py-20">
          <p className="text-chako-dark/30 text-sm">Type something to search for products</p>
        </div>
      )}
    </div>
  );
}
