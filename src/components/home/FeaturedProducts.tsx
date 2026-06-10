import { cookies } from 'next/headers';
import { getProducts } from '@/lib/shopify';
import type { ShopifyLanguage } from '@/lib/shopify';
import ProductCard from '@/components/product/ProductCard';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Link from 'next/link';
import T from '@/components/ui/T';

export default async function FeaturedProducts() {
  const lang: ShopifyLanguage = cookies().get('chako_lang')?.value === 'ar' ? 'AR' : 'EN';
  const products = await getProducts({ first: 8, language: lang }).catch(() => []);

  if (!products.length) return null;

  return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-8 py-16 md:py-20">
      <ScrollReveal>
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-label font-sans font-semibold text-chako-ink/40 uppercase tracking-widest mb-2">
              <T k="featured_label" />
            </p>
            <h2 className="text-heading font-display font-bold"><T k="featured_heading" /></h2>
          </div>
          <Link
            href="/collections"
            className="text-sm font-semibold text-chako-ink/50 hover:text-chako-ink transition-colors hidden md:block cursor-pointer underline underline-offset-4"
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
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-chako-ink text-sm font-semibold rounded-full hover:bg-chako-ink hover:text-chako-cream active:scale-[0.97] transition-[background-color,color,transform] duration-150 cursor-pointer touch-manipulation"
        >
          <T k="featured_view_all" /> →
        </Link>
      </ScrollReveal>
    </section>
  );
}
