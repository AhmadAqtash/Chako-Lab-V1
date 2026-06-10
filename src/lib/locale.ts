// Locale primitives — the URL ([locale] segment) is the single source of truth
// for language. No runtime imports: safe for middleware (edge), server
// components, and client components alike.

export const LOCALES = ['en', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function toShopifyLanguage(locale: Locale): 'EN' | 'AR' {
  return locale === 'ar' ? 'AR' : 'EN';
}
