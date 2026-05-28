import { getProducts } from '@/lib/shopify';
import ProductCard from '@/components/product/ProductCard';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Link from 'next/link';
import T from '@/components/ui/T';

export default async function FeaturedProducts() {
  const products = await getProducts({ first: 8 }).catch(() => []);

  if (!products.length) return null;

  return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-8 py-16 md:py-20">
      <ScrollReveal>
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-chako-dark/40 uppercase tracking-widest mb-2">
              <T k="featured_label" />
            </p>
            <h2 className="text-2xl md:text-3xl font-bold"><T k="featured_heading" /></h2>
          </div>
          <Link
            href="/collections"
            className="text-sm font-medium text-chako-dark/60 hover:text-chako-dark transition-colors hidden md:block cursor-pointer"
          >
            <T k="featured_view_all" /> →
          </Link>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {products.map((product, i) => (
          <ScrollReveal key={product.id} delay={i * 80}>
            <ProductCard product={product} />
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal className="text-center mt-8 md:hidden">
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 px-6 py-2.5 border border-black/10 text-sm font-medium rounded-full hover:bg-black/5 transition-colors cursor-pointer"
        >
          <T k="featured_view_all" /> →
        </Link>
      </ScrollReveal>
    </section>
  );
}
