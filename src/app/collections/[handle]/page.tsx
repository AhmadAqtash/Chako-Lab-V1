import { notFound } from 'next/navigation';
import {
  getProducts,
  COLLECTION_HANDLE_TO_TYPE,
  COLLECTION_DISPLAY_NAMES,
  ALL_COLLECTION_HANDLES,
} from '@/lib/shopify';
import CollectionGrid from '@/components/collection/CollectionGrid';
import Breadcrumb from '@/components/ui/Breadcrumb';
import type { Metadata } from 'next';

export const revalidate = 60;
export const dynamicParams = true;

interface Props {
  params: { handle: string };
}

export async function generateStaticParams() {
  return ALL_COLLECTION_HANDLES.map((handle) => ({ handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = COLLECTION_DISPLAY_NAMES[params.handle];
  if (!name) return { title: 'Not Found' };
  return {
    title: name,
    description: `Shop Chako Lab ${name} — premium drinkware delivered across the UAE.`,
  };
}

export default async function CollectionPage({ params }: Props) {
  const productType = COLLECTION_HANDLE_TO_TYPE[params.handle];
  if (!productType) notFound();

  const displayName = COLLECTION_DISPLAY_NAMES[params.handle];
  const products = await getProducts({ first: 250, productType });

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
