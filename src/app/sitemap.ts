import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { LOCALES } from '@/lib/locale';
import { ALL_COLLECTION_HANDLES, getProducts } from '@/lib/shopify';

export const revalidate = 3600; // refresh product URLs hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    '',
    '/collections',
    '/collections/titanium',
    '/collections/new',
    ...ALL_COLLECTION_HANDLES.map((h) => `/collections/${h}`),
    '/pages/faq',
    '/pages/about',
    '/pages/contact',
    '/pages/shipping',
    '/pages/terms',
    '/pages/privacy',
  ];

  // Best-effort: if Shopify is unreachable the sitemap still ships all
  // static routes (handles are language-independent, EN fetch suffices)
  let productPaths: string[] = [];
  try {
    const products = await getProducts({ first: 250 });
    productPaths = products.map((p) => `/products/${p.handle}`);
  } catch {
    productPaths = [];
  }

  return [...staticPaths, ...productPaths].flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      changeFrequency: 'daily' as const,
      alternates: {
        languages: {
          en: `${SITE_URL}/en${path}`,
          ar: `${SITE_URL}/ar${path}`,
        },
      },
    }))
  );
}
