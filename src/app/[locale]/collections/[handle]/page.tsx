import { notFound } from 'next/navigation';
import {
  getProducts,
  COLLECTION_HANDLE_TO_TYPE,
  COLLECTION_DISPLAY_NAMES,
  ALL_COLLECTION_HANDLES,
  getTitaniumProducts,
  getTwistProducts,
  getNewProducts,
  getMoreProducts,
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

// Per-locale ISR: locale is part of the path, so /en/... and /ar/... are
// independent cache entries — stale-wrong-language cannot recur. force-dynamic
// (added when language came from a cookie) is no longer needed.
export const revalidate = 60;
export const dynamicParams = true;

interface Props {
  params: { locale: Locale; handle: string };
}

export async function generateStaticParams() {
  return [...ALL_COLLECTION_HANDLES, 'titanium', 'new', 'twist'].map((handle) => ({ handle }));
}

// Products pinned into a collection whose productType filter would never find
// them. The Dual-Layer Ti Tumblers are Shopify productType 'Tumbler' but sell
// as part of the PangPang family, so they ride along here rather than being
// retyped in Shopify (retyping would move them out of Titanium and swap their
// PDP story). They still appear on the Titanium page too — this is additive.
// Add new colourways to the array; the dedupe below makes that safe.
const COLLECTION_GUEST_HANDLES: Record<string, string[]> = {
  'pangpang-cups': [
    'chako-lab-dual-layer-ti-tumbler-brown',
    'chako-lab-dual-layer-ti-tumbler-pink',
  ],
};

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
  'accessories':      'cat_accessories',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const isAr = params.locale === 'ar';
  const alternates = localeAlternates(params.locale, `/collections/${params.handle}`);

  if (params.handle === 'titanium') {
    return {
      title: isAr ? 'تيتانيوم' : 'Titanium',
      description: isAr
        ? 'تسوق مجموعة التيتانيوم من شاكو لاب — أدوات شرب فاخرة من التيتانيوم مع التوصيل في جميع أنحاء الإمارات.'
        : 'Shop the Chako Lab Titanium Collection — premium titanium drinkware delivered across the UAE.',
      alternates,
    };
  }
  if (params.handle === 'new') {
    return {
      title: isAr ? 'وصل حديثاً' : 'New Arrivals',
      description: isAr
        ? 'تسوق أحدث منتجات شاكو لاب — وصل حديثاً مع التوصيل في جميع أنحاء الإمارات.'
        : 'Shop the newest Chako Lab drinkware — fresh arrivals delivered across the UAE.',
      alternates,
    };
  }
  if (params.handle === 'twist') {
    return {
      title: isAr ? 'مجموعة تويست' : 'Twist Series',
      description: isAr
        ? 'تسوق مجموعة تويست من شاكو لاب — تمبلر تويست وإكسسواراتها مع التوصيل في جميع أنحاء الإمارات.'
        : 'Shop the Chako Lab Twist Series — Twist tumblers and their matching accessories, delivered across the UAE.',
      alternates,
    };
  }
  if (params.handle === 'more') {
    return {
      title: isAr ? 'المزيد للاكتشاف' : 'More to Explore',
      description: isAr
        ? 'تسوق المزيد من شاكو لاب — أكواب بابا، الأكواب الزجاجية، إبريق الشاي، صناديق الفواكه والوجبات، مع التوصيل في جميع أنحاء الإمارات.'
        : 'Shop more from Chako Lab — BaBa cups, glass cups, teapots, fruit and lunch boxes, delivered across the UAE.',
      alternates,
    };
  }
  const name = COLLECTION_DISPLAY_NAMES[params.handle];
  if (!name) return { title: 'Not Found' };
  const catKey = HANDLE_TO_CAT_KEY[params.handle];
  const localizedName = isAr && catKey ? translations.ar[catKey] : name;
  // Accessories aren't drinkware — the shared description template would misdescribe them
  if (params.handle === 'accessories') {
    return {
      title: localizedName,
      description: isAr
        ? 'تسوق إكسسوارات شاكو لاب — مقابض وأحزمة وأكمام أكواب والمزيد، مع التوصيل في جميع أنحاء الإمارات.'
        : 'Shop Chako Lab accessories — handles, straps, cup sleeves and more, delivered across the UAE.',
      alternates,
    };
  }
  return {
    title: localizedName,
    description: isAr
      ? `تسوق ${localizedName} من شاكو لاب — أدوات شرب فاخرة مع التوصيل في جميع أنحاء الإمارات.`
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

  // Twist is a handle-family virtual collection (cups + matching accessories)
  if (params.handle === 'twist') {
    let twistProducts: Product[] = [];
    let loadFailed = false;
    try {
      twistProducts = await getTwistProducts(lang);
    } catch {
      loadFailed = true;
    }
    return (
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Collections', href: '/collections' },
            { label: lang === 'AR' ? 'مجموعة تويست' : 'Twist Series' },
          ]}
        />
        {loadFailed
          ? <LoadError />
          : <CollectionGrid products={twistProducts} title={lang === 'AR' ? 'مجموعة تويست' : 'Twist Series'} />}
      </div>
    );
  }

  // 'more' groups the newest families that don't have a series page yet
  if (params.handle === 'more') {
    let moreProducts: Product[] = [];
    let loadFailed = false;
    try {
      moreProducts = await getMoreProducts(lang);
    } catch {
      loadFailed = true;
    }
    return (
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Collections', href: '/collections' },
            { label: lang === 'AR' ? 'المزيد للاكتشاف' : 'More to Explore' },
          ]}
        />
        {loadFailed
          ? <LoadError />
          : <CollectionGrid products={moreProducts} title={lang === 'AR' ? 'المزيد للاكتشاف' : 'More to Explore'} />}
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

    // Guest products pinned into a collection they don't match by productType.
    // Best-effort: a failure here must not take down the whole collection.
    const guests = COLLECTION_GUEST_HANDLES[params.handle];
    if (guests) {
      const fetched = await Promise.all(
        guests.map((h) => getProduct(h, lang).catch(() => null))
      );
      const extras = fetched.filter(
        (p): p is Product => !!p && !products.some((existing) => existing.handle === p.handle)
      );
      if (extras.length) products = [...products, ...extras];
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
