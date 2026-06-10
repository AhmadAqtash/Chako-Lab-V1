import { notFound } from 'next/navigation';
import { getProduct, getColorSiblings, PRODUCT_TYPE_TO_COLLECTION, COLLECTION_DISPLAY_NAMES } from '@/lib/shopify';
import { toShopifyLanguage, type Locale } from '@/lib/locale';
import { extractBaseName, extractColorName } from '@/lib/utils';
import ProductGallery from '@/components/product/ProductGallery';
import ProductDetails from '@/components/product/ProductDetails';
import ProductFeatures from '@/components/product/ProductFeatures';
import RelatedProducts from '@/components/product/RelatedProducts';
import Breadcrumb from '@/components/ui/Breadcrumb';
import TitaniumBodyFlag from '@/components/titanium/TitaniumBodyFlag';
import type { Metadata } from 'next';

export const revalidate = 60;
export const dynamicParams = true;

interface Props {
  params: { locale: Locale; handle: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // On failure fall back to the site-default title — a transient Shopify error
  // must not label a live product page "Product Not Found"
  const product = await getProduct(params.handle).catch(() => null);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description.slice(0, 160),
    openGraph: {
      images: product.featuredImage ? [{ url: product.featuredImage.url }] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const lang = toShopifyLanguage(params.locale);
  const product = await getProduct(params.handle, lang);
  if (!product) notFound();

  const isTitanium = /titanium|(^|-)ti(-|$)/i.test(product.handle);

  const collectionHandle = PRODUCT_TYPE_TO_COLLECTION[product.productType];
  const collectionName = collectionHandle ? COLLECTION_DISPLAY_NAMES[collectionHandle] : null;

  const baseName = extractBaseName(product.title);
  const colorName = extractColorName(product.title);

  const [colorSiblings] = await Promise.all([
    getColorSiblings(product.productType, baseName).catch(() => []),
  ]);

  const siblingHandles = colorSiblings.map((p) => p.handle);

  const crumbs = [
    { label: 'Home', href: '/' },
    ...(collectionHandle && collectionName
      ? [{ label: collectionName, href: `/collections/${collectionHandle}` }]
      : [{ label: 'All Products', href: '/collections' }]),
    { label: product.title },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-6 md:py-10">
      {isTitanium && <TitaniumBodyFlag />}
      <Breadcrumb crumbs={crumbs} />

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
        <div className="md:sticky md:top-24 min-w-0">
          <ProductGallery images={product.images.nodes} title={product.title} />
        </div>
        <div className="min-w-0">
          <ProductDetails
            product={product}
            colorSiblings={colorSiblings}
            colorName={colorName}
            collectionHandle={collectionHandle}
          />
        </div>
      </div>

      <ProductFeatures metafields={product.metafields} />

      <RelatedProducts
        productType={product.productType}
        excludeHandles={siblingHandles}
        isTitanium={isTitanium}
      />
    </div>
  );
}
