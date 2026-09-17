import { notFound } from 'next/navigation';
import { getProduct, getProductBaseType, getColorSiblings, getPairingAccessories, getFamilyKeyFor, collectionDisplayName, PRODUCT_TYPE_TO_COLLECTION, FAMILY_TO_COLLECTION } from '@/lib/shopify';
import { getFamilyReviews } from '@/lib/judgeme';
import { looksLikeAccessory } from '@/lib/accessory-types';
import { orderPairing, pairingPlan } from '@/lib/pairing';
import { toShopifyLanguage, type Locale } from '@/lib/locale';
import { localeAlternates } from '@/lib/seo';
import { extractColorName } from '@/lib/utils';
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

  // A family pinned onto another collection (the Bawang Lite is typed
  // 'Tumbler' but belongs with the Bawangs) takes that collection for its
  // breadcrumb and label, so a customer who arrived from the Bawang page gets
  // a crumb back to it. Same map that puts it in the listing, so they agree.
  const familyKey = await getFamilyKeyFor(product.id).catch(() => null);
  const pinnedCollection = familyKey ? FAMILY_TO_COLLECTION[familyKey] : undefined;
  const collectionHandle = pinnedCollection ?? PRODUCT_TYPE_TO_COLLECTION[baseType];
  const collectionName = collectionHandle ? collectionDisplayName(collectionHandle, lang) : null;

  // The eyebrow above the title normally shows the localized productType, which
  // is the more specific label. Only a PINNED family overrides it — otherwise a
  // Bawang Lite would announce itself as "Tumbler" on a page reached from, and
  // breadcrumbed back to, the Bawang collection.
  const collectionLabel = pinnedCollection ? collectionName : null;

  const colorName = extractColorName(product.title);

  // Locale-proof accessory guard (same test as product-specs): accessories
  // don't pair with themselves, so the carousel is drinkware-only
  const isAccessory = looksLikeAccessory(baseType, product.productType);

  // Siblings and reviews now share ONE family definition (lib/family.ts), so a
  // review pool can never disagree with the swatch row about what counts as
  // "the same product in another colour".
  const [colorSiblings, pairingPool] = await Promise.all([
    getColorSiblings(product.id, product.handle, lang).catch(() => []),
    isAccessory ? Promise.resolve(null) : getPairingAccessories(lang).catch(() => null),
  ]);

  // Reviews pool across the family. Attribution uses the LOCALIZED sibling
  // titles already fetched above, so an Arabic shopper sees the Arabic colour
  // name — and this adds no extra request.
  const reviewTargets =
    colorSiblings.length > 1
      ? colorSiblings.map((s) => ({
          gid: s.id,
          colourway: s.id === product.id ? null : extractColorName(s.title),
        }))
      : [{ gid: product.id, colourway: null }];
  const reviews = await getFamilyReviews(reviewTargets).catch(() => null);

  // Stickers first on the series they suit; Cup Pouches right after them on
  // the series they carry. Rules and reasons live in lib/pairing.ts.
  const orderedPairing = pairingPool
    ? orderPairing(
        pairingPool.accessories,
        pairingPool.pouches,
        pairingPlan(baseType, product.handle)
      )
    : [];

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
            collectionLabel={collectionLabel}
            baseType={baseType}
            isTitanium={isTitanium}
            pairingItems={orderedPairing}
            reviewSummary={reviews ? { rating: reviews.averageRating, count: reviews.count } : null}
          />
        </div>
      </div>

      <ProductFeatures metafields={product.metafields} />

      <ProductStory product={product} collectionHandle={collectionHandle} isTitanium={isTitanium} baseType={baseType} />

      {reviews && <ProductReviews data={reviews} isAr={params.locale === 'ar'} />}

      <RelatedProducts
        productType={baseType}
        // Current handle listed explicitly: sibling matching is title-based
        // and a garbled translation can empty it — never recommend the page
        // the customer is already on
        excludeHandles={[product.handle, ...siblingHandles]}
        isTitanium={isTitanium}
        language={lang}
      />
    </div>
  );
}
