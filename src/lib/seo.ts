import type { Metadata } from 'next';
import type { Locale } from './locale';

// Public origin for canonical/hreflang URLs. Vercel previews inherit it —
// these tags only matter once the real domain serves traffic.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://chakolab.ae';

// Canonical + hreflang pair for a locale-stripped path ('' = home,
// '/collections', '/products/x', …). Resolved against metadataBase.
export function localeAlternates(locale: Locale, path = ''): Metadata['alternates'] {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      en: `/en${path}`,
      ar: `/ar${path}`,
      'x-default': `/en${path}`,
    },
  };
}
