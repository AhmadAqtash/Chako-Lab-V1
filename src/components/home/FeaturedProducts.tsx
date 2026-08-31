import { getProducts } from '@/lib/shopify';
import { inStockFirst } from '@/lib/inventory';
import { toShopifyLanguage, type Locale } from '@/lib/locale';
import ProductCard from '@/components/product/ProductCard';
import Reveal from '@/components/ui/Reveal';
import Link from '@/components/ui/LocalizedLink';
import T from '@/components/ui/T';

const SHOWN = 8;

export default async function FeaturedProducts({ locale }: { locale: Locale }) {
  // Fetch WIDER than we show. BEST_SELLING leads with sold-out items (best
  // sellers empty first), so demoting a window of exactly 8 would only move the
  // sold-out card to slot 8 — it has to have somewhere to fall to.
  const pool = await getProducts({ first: 24, language: toShopifyLanguage(locale) }).catch(() => []);
  const products = inStockFirst(pool).slice(0, SHOWN);

  if (!products.length) return null;

  return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-8 py-16 md:py-20">
      <Reveal variant="up">
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
            <T k="featured_view_all" /> {locale === 'ar' ? '←' : '→'}
          </Link>
        </div>
      </Reveal>

      <Reveal stagger={80} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Reveal>

      <Reveal variant="up" className="text-center mt-8 md:hidden">
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-chako-ink text-sm font-semibold rounded-full hover:bg-chako-ink hover:text-chako-cream active:scale-[0.97] transition-[background-color,color,transform] duration-150 cursor-pointer touch-manipulation"
        >
          <T k="featured_view_all" /> {locale === 'ar' ? '←' : '→'}
        </Link>
      </Reveal>
    </section>
  );
}
