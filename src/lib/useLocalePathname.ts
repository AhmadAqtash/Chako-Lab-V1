'use client';

import { usePathname } from 'next/navigation';
import { LOCALES } from './locale';

// usePathname with the leading /en or /ar segment stripped, so route checks
// ('/', '/collections/titanium', …) read exactly as they did before the
// locale migration.
export function useLocalePathname(): string {
  const pathname = usePathname() ?? '/';
  for (const locale of LOCALES) {
    if (pathname === `/${locale}`) return '/';
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}
