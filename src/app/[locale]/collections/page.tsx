import { getProducts } from '@/lib/shopify';
import type { Product } from '@/types/shopify';
import { toShopifyLanguage, type Locale } from '@/lib/locale';
import { localeAlternates } from '@/lib/seo';
import ProductCard from '@/components/product/ProductCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import T from '@/components/ui/T';
import type { Metadata } from 'next';

export const revalidate = 60;

const META = {
  en: {
    title: 'All Products',
    description: 'Browse all Chako Lab drinkware — kettles, bottles, tumblers, mugs, and more. Delivered across the UAE.',
  },
  ar: {
    title: 'جميع المنتجات',
    description: 'تصفح جميع أدوات الشرب من شاكو لاب — أباريق وزجاجات وتمبلر وأكواب والمزيد. التوصيل في جميع أنحاء الإمارات.',
  },
} as const;

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return { ...META[params.locale], alternates: localeAlternates(params.locale, '/collections') };
}

export default async function CollectionsPage({ params }: { params: { locale: Locale } }) {
  let products: Product[] = [];
  let loadFailed = false;
  try {
    // 250 (storefront max): the catalog passed 48 products long ago — a lower
    // cap silently hides whatever sorts last from the main browsing surface
    products = await getProducts({ first: 250, language: toShopifyLanguage(params.locale) });
  } catch {
    loadFailed = true;
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumb
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'All Products' },
        ]}
      />

      <div className="mb-6">
        <p className="text-label font-sans font-semibold text-chako-ink/40 uppercase tracking-widest mb-2">
          <T k="collection_all_label" />
        </p>
        <h1 className="text-heading font-display font-bold"><T k="collection_all_heading" /></h1>
        <p className="text-sm text-chako-ink/55 mt-2 max-w-xl leading-relaxed">
          <T k="collection_all_sub" />
        </p>
      </div>

      {loadFailed ? (
        <div className="text-center py-24 bg-chako-accent rounded-3xl">
          <p className="text-chako-ink/40 text-sm font-medium"><T k="products_load_error" /></p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-chako-accent rounded-3xl">
          <p className="text-chako-ink/40 text-sm font-medium"><T k="collection_no_products" /></p>
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
