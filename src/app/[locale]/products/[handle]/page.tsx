import { notFound } from 'next/navigation';
import { getProduct, getProductBaseType, getColorSiblings, getPairingAccessories, PRODUCT_TYPE_TO_COLLECTION, COLLECTION_DISPLAY_NAMES } from '@/lib/shopify';
import { getProductReviews } from '@/lib/judgeme';
import { toShopifyLanguage, type Locale } from '@/lib/locale';
import { localeAlternates } from '@/lib/seo';
import { extractBaseName, extractColorName } from '@/lib/utils';
import ProductGallery from '@/components/product/ProductGallery';
import ProductDetails from '@/components/product/ProductDetails';
import ProductFeatures from '@/components/product/ProductFeatures';
import ProductStory from '@/components/product/ProductStory';
import ProductReviews from '@/components/product/ProductReviews';
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
  // Same locale + handle as the page render → Next dedupes the fetch.
  // On failure fall back to the site-default title — a transient Shopify error
  // must not label a live product page "Product Not Found"
  const product = await getProduct(params.handle, toShopifyLanguage(params.locale)).catch(() => null);
  if (!product) return {};
  return {
    title: product.title,
    description: product.description.slice(0, 160),
    alternates: localeAlternates(params.locale, `/products/${params.handle}`),
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

  // product.productType is localized under @inContext — search filters and
  // the EN-keyed collection maps need the base value
  const baseType =
    lang === 'EN'
      ? product.productType
      : (await getProductBaseType(params.handle)) ?? product.productType;

  const collectionHandle = PRODUCT_TYPE_TO_COLLECTION[baseType];
  const collectionName = collectionHandle ? COLLECTION_DISPLAY_NAMES[collectionHandle] : null;

  const baseName = extractBaseName(product.title);
  const colorName = extractColorName(product.title);

  // Locale-proof accessory guard (same pattern as product-specs): accessories
  // don't pair with themselves, so the carousel is drinkware-only
  const isAccessory = /accessor|إكسسوار/i.test(baseType || product.productType);

  const [colorSiblings, pairingItems, reviews] = await Promise.all([
    getColorSiblings(baseType, baseName).catch(() => []),
    isAccessory ? Promise.resolve([]) : getPairingAccessories(lang).catch(() => []),
    getProductReviews(product.id).catch(() => null),
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
            baseType={baseType}
            isTitanium={isTitanium}
            pairingItems={pairingItems}
            reviewSummary={reviews ? { rating: reviews.averageRating, count: reviews.count } : null}
          />
        </div>
      </div>

      <ProductFeatures metafields={product.metafields} />

      <ProductStory product={product} collectionHandle={collectionHandle} isTitanium={isTitanium} baseType={baseType} />

      {reviews && <ProductReviews data={reviews} isAr={params.locale === 'ar'} />}

      <RelatedProducts
        productType={baseType}
        excludeHandles={siblingHandles}
        isTitanium={isTitanium}
        language={lang}
      />
    </div>
  );
}
