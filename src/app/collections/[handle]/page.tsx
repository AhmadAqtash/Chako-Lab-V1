import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import {
  getProducts,
  COLLECTION_HANDLE_TO_TYPE,
  COLLECTION_DISPLAY_NAMES,
  ALL_COLLECTION_HANDLES,
  getTitaniumProducts,
  getNewProducts,
  getProduct,
} from '@/lib/shopify';
import type { ShopifyLanguage } from '@/lib/shopify';
import CollectionGrid from '@/components/collection/CollectionGrid';
import Breadcrumb from '@/components/ui/Breadcrumb';
import TitaniumBodyFlag from '@/components/titanium/TitaniumBodyFlag';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface Props {
  params: { handle: string };
}

export async function generateStaticParams() {
  return [...ALL_COLLECTION_HANDLES, 'titanium', 'new'].map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (params.handle === 'titanium') {
    return {
      title: 'Titanium',
      description: 'Shop the Chako Lab Titanium Collection — premium titanium drinkware delivered across the UAE.',
    };
  }
  if (params.handle === 'new') {
    return {
      title: 'New Arrivals',
      description: 'Shop the newest Chako Lab drinkware — fresh arrivals delivered across the UAE.',
    };
  }
  const name = COLLECTION_DISPLAY_NAMES[params.handle];
  if (!name) return { title: 'Not Found' };
  return {
    title: name,
    description: `Shop Chako Lab ${name} — premium drinkware delivered across the UAE.`,
  };
}

export default async function CollectionPage({ params }: Props) {
  const lang: ShopifyLanguage = cookies().get('chako_lang')?.value === 'ar' ? 'AR' : 'EN';

  // Titanium is a virtual collection grouping products from multiple families.
  if (params.handle === 'titanium') {
    const titaniumProducts = await getTitaniumProducts(lang);
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
        <CollectionGrid products={titaniumProducts} title={lang === 'AR' ? 'تيتانيوم' : 'Titanium'} />
      </div>
    );
  }

  if (params.handle === 'new') {
    const newProducts = await getNewProducts(lang);
    return (
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Collections', href: '/collections' },
            { label: lang === 'AR' ? 'وصل حديثاً' : 'New Arrivals' },
          ]}
        />
        <CollectionGrid products={newProducts} title={lang === 'AR' ? 'وصل حديثاً' : 'New Arrivals'} />
      </div>
    );
  }

  const productType = COLLECTION_HANDLE_TO_TYPE[params.handle];
  if (!productType) notFound();

  const displayName = COLLECTION_DISPLAY_NAMES[params.handle];
  let products = await getProducts({ first: 250, productType, language: lang });

  // PangPang also surfaces the Dual-Layer Ti Tumbler (a Tumbler-type product),
  // without changing the Shopify backend. It still lives on the Titanium page too.
  if (params.handle === 'pangpang-cups') {
    const dualLayerTi = await getProduct('chako-lab-dual-layer-ti-tumbler-brown', lang);
    if (dualLayerTi && !products.some((p) => p.handle === dualLayerTi.handle)) {
      products = [...products, dualLayerTi];
    }
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
      <CollectionGrid products={products} title={displayName} />
    </div>
  );
}
