import { notFound } from 'next/navigation';
import {
  getProducts,
  COLLECTION_HANDLE_TO_TYPE,
  COLLECTION_DISPLAY_NAMES,
  ALL_COLLECTION_HANDLES,
  getTitaniumProducts,
  getNewProducts,
  getProduct,
} from '@/lib/shopify';
import { toShopifyLanguage, type Locale } from '@/lib/locale';
import { localeAlternates } from '@/lib/seo';
import translations, { type TranslationKey } from '@/lib/translations';
import type { Product } from '@/types/shopify';
import CollectionGrid from '@/components/collection/CollectionGrid';
import Breadcrumb from '@/components/ui/Breadcrumb';
import TitaniumBodyFlag from '@/components/titanium/TitaniumBodyFlag';
import T from '@/components/ui/T';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface Props {
  params: { locale: Locale; handle: string };
}

export async function generateStaticParams() {
  return [...ALL_COLLECTION_HANDLES, 'titanium', 'new'].map((handle) => ({ handle }));
}

// Localized collection names for metadata (UI gets them via CollectionGrid)
const HANDLE_TO_CAT_KEY: Record<string, TranslationKey> = {
  'linlin-kettles':   'cat_linlin',
  'bawang-cups':      'cat_bawang',
  'bobo-tumblers':    'cat_bobo',
  'kada-bottles':     'cat_kada',
  'pots':             'cat_pots',
  'mugs':             'cat_mugs',
  'milk-pods':        'cat_milkpods',
  'baobao-food-cups': 'cat_baobao',
  'pangpang-cups':    'cat_pangpang',
  'square-cups':      'cat_square',
  'tumbler':          'cat_tumbler',
  'bobo-cup':         'cat_bobo_cup',
  'baobao-cup':       'cat_baobao',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const isAr = params.locale === 'ar';
  const alternates = localeAlternates(params.locale, `/collections/${params.handle}`);

  if (params.handle === 'titanium') {
    return {
      title: isAr ? 'تيتانيوم' : 'Titanium',
      description: isAr
        ? 'تسوق مجموعة التيتانيوم من تشاكو لاب — أدوات شرب فاخرة من التيتانيوم مع التوصيل في جميع أنحاء الإمارات.'
        : 'Shop the Chako Lab Titanium Collection — premium titanium drinkware delivered across the UAE.',
      alternates,
    };
  }
  if (params.handle === 'new') {
    return {
      title: isAr ? 'وصل حديثاً' : 'New Arrivals',
      description: isAr
        ? 'تسوق أحدث منتجات تشاكو لاب — وصل حديثاً مع التوصيل في جميع أنحاء الإمارات.'
        : 'Shop the newest Chako Lab drinkware — fresh arrivals delivered across the UAE.',
      alternates,
    };
  }
  const name = COLLECTION_DISPLAY_NAMES[params.handle];
  if (!name) return { title: 'Not Found' };
  const catKey = HANDLE_TO_CAT_KEY[params.handle];
  const localizedName = isAr && catKey ? translations.ar[catKey] : name;
  return {
    title: localizedName,
    description: isAr
      ? `تسوق ${localizedName} من تشاكو لاب — أدوات شرب فاخرة مع التوصيل في جميع أنحاء الإمارات.`
      : `Shop Chako Lab ${name} — premium drinkware delivered across the UAE.`,
    alternates,
  };
}

// Shopify unreachable — honest error state instead of a fake-empty collection
function LoadError() {
  return (
    <div className="text-center py-24 bg-chako-accent rounded-3xl">
      <p className="text-chako-ink/40 text-sm font-medium"><T k="products_load_error" /></p>
    </div>
  );
}

export default async function CollectionPage({ params }: Props) {
  const lang = toShopifyLanguage(params.locale);

  // Titanium is a virtual collection grouping products from multiple families.
  if (params.handle === 'titanium') {
    let titaniumProducts: Product[] = [];
    let loadFailed = false;
    try {
      titaniumProducts = await getTitaniumProducts(lang);
    } catch {
      loadFailed = true;
    }
    return (
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <TitaniumBodyFlag />
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Collections', href: '/collections' },
            { label: lang === 'AR' ? 'تيتانيوم' : 'Titanium' },
          ]}
        />
        {loadFailed
          ? <LoadError />
          : <CollectionGrid products={titaniumProducts} title={lang === 'AR' ? 'تيتانيوم' : 'Titanium'} />}
      </div>
    );
  }

  if (params.handle === 'new') {
    let newProducts: Product[] = [];
    let loadFailed = false;
    try {
      newProducts = await getNewProducts(lang);
    } catch {
      loadFailed = true;
    }
    return (
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Collections', href: '/collections' },
            { label: lang === 'AR' ? 'وصل حديثاً' : 'New Arrivals' },
          ]}
        />
        {loadFailed
          ? <LoadError />
          : <CollectionGrid products={newProducts} title={lang === 'AR' ? 'وصل حديثاً' : 'New Arrivals'} />}
      </div>
    );
  }

  const productType = COLLECTION_HANDLE_TO_TYPE[params.handle];
  if (!productType) notFound();

  const displayName = COLLECTION_DISPLAY_NAMES[params.handle];
  let products: Product[] = [];
  let loadFailed = false;
  try {
    products = await getProducts({ first: 250, productType, language: lang });

    // PangPang also surfaces the Dual-Layer Ti Tumbler (a Tumbler-type product),
    // without changing the Shopify backend. It still lives on the Titanium page too.
    // Best-effort: a failure here shouldn't take down the whole collection.
    if (params.handle === 'pangpang-cups') {
      const dualLayerTi = await getProduct('chako-lab-dual-layer-ti-tumbler-brown', lang).catch(() => null);
      if (dualLayerTi && !products.some((p) => p.handle === dualLayerTi.handle)) {
        products = [...products, dualLayerTi];
      }
    }
  } catch {
    loadFailed = true;
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumb
        crumbs={[
          { label: 'Home', href: '/' },
          { label: 'Collections', href: '/collections' },
          { label: displayName },
        ]}
      />
      {loadFailed
        ? <LoadError />
        : <CollectionGrid products={products} title={displayName} />}
    </div>
  );
}
