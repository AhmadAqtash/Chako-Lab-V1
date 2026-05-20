import { getProducts } from '@/lib/shopify';
import ProductCard from '@/components/product/ProductCard';
import Link from 'next/link';

export default async function FeaturedProducts() {
  const products = await getProducts({ first: 8 }).catch(() => []);

  if (!products.length) return null;

  return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-8 py-16 md:py-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs font-semibold text-chako-dark/40 uppercase tracking-widest mb-2">Bestsellers</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold">Featured Products</h2>
        </div>
        <Link
          href="/collections"
          className="text-sm font-medium text-chako-dark/60 hover:text-chako-dark transition-colors hidden md:block"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="text-center mt-8 md:hidden">
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 px-6 py-2.5 border border-black/10 text-sm font-medium rounded-full hover:bg-black/5 transition-colors"
        >
          View all products →
        </Link>
      </div>
    </section>
  );
}
