import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import {
  getProducts,
  COLLECTION_HANDLE_TO_TYPE,
  COLLECTION_DISPLAY_NAMES,
  ALL_COLLECTION_HANDLES,
  getTitaniumProducts,
} from '@/lib/shopify';
import type { ShopifyLanguage } from '@/lib/shopify';
import CollectionGrid from '@/components/collection/CollectionGrid';
import Breadcrumb from '@/components/ui/Breadcrumb';
import type { Metadata } from 'next';

export const revalidate = 60;
export const dynamicParams = true;

interface Props {
  params: { handle: string };
}

export async function generateStaticParams() {
  return [...ALL_COLLECTION_HANDLES, 'titanium'].map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (params.handle === 'titanium') {
    return {
      title: 'Titanium',
      description: 'Shop the Chako Lab Titanium Collection — premium titanium drinkware delivered across the UAE.',
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
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8">
        <Breadcrumb
          crumbs={[
            { label: 'Home', href: '/' },
            { label: 'Collections', href: '/collections' },
            { label: 'Titanium' },
          ]}
        />
        <CollectionGrid products={titaniumProducts} title="Titanium" />
      </div>
    );
  }

  const productType = COLLECTION_HANDLE_TO_TYPE[params.handle];
  if (!productType) notFound();

  const displayName = COLLECTION_DISPLAY_NAMES[params.handle];
  const products = await getProducts({ first: 250, productType, language: lang });

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
