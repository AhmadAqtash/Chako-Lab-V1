import { searchProducts } from '@/lib/shopify';
import { toShopifyLanguage, type Locale } from '@/lib/locale';
import type { Product } from '@/types/shopify';
import ProductCard from '@/components/product/ProductCard';
import SearchInput from './SearchInput';
import T from '@/components/ui/T';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search',
};

interface Props {
  params: { locale: Locale };
  searchParams: { q?: string };
}

export default async function SearchPage({ params, searchParams }: Props) {
  const query = searchParams.q?.trim() || '';
  const lang = toShopifyLanguage(params.locale);

  let products: Product[] = [];
  let searchFailed = false;
  if (query) {
    try {
      products = await searchProducts(query, lang);
    } catch {
      searchFailed = true;
    }
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-10">
      <h1 className="text-heading font-display font-bold mb-6"><T k="nav_search" /></h1>
      <SearchInput initialQuery={query} />

      {query && searchFailed && (
        <div className="mt-8 text-center py-20 bg-chako-accent rounded-3xl">
          <p className="text-chako-ink/40 text-sm font-medium"><T k="products_load_error" /></p>
        </div>
      )}

      {query && !searchFailed && (
        <div className="mt-8">
          <p className="text-sm text-chako-ink/50 mb-6">
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
              <p className="text-chako-ink/40 text-sm font-medium">No products found.</p>
              <p className="text-chako-ink/30 text-xs mt-1">Try a different search term.</p>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="text-center py-20">
          <p className="text-chako-ink/30 text-sm">Type something to search for products</p>
        </div>
      )}
    </div>
  );
}
