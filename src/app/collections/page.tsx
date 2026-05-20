import { getProducts } from '@/lib/shopify';
import ProductCard from '@/components/product/ProductCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import type { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse all Chako Lab drinkware — kettles, bottles, tumblers, mugs, and more. Delivered across the UAE.',
};

export default async function CollectionsPage() {
  const products = await getProducts({ first: 48 }).catch(() => []);

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumb
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'All Products' },
        ]}
      />

      <div className="mb-6">
        <p className="text-xs font-semibold text-chako-dark/40 uppercase tracking-widest mb-1">Collection</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold">All Products</h1>
        <p className="text-sm text-chako-dark/55 mt-2 max-w-xl leading-relaxed">
          The full Chako Lab collection — crafted drinkware for every ritual.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 bg-chako-accent rounded-3xl">
          <p className="text-chako-dark/40 text-sm font-medium">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
