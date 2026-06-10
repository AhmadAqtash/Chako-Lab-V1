'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useLanguage } from '@/context/LanguageContext';

// Drop-in next/link replacement that prefixes internal string hrefs with the
// active locale (/en, /ar). External URLs, mailto/tel, hashes, and hrefs that
// already carry a locale pass through untouched.
export default function LocalizedLink({ href, ...props }: ComponentProps<typeof Link>) {
  const { language } = useLanguage();

  let localizedHref = href;
  if (
    typeof href === 'string' &&
    href.startsWith('/') &&
    href !== `/${language}` &&
    !href.startsWith(`/${language}/`)
  ) {
    localizedHref = `/${language}${href === '/' ? '' : href}`;
  }

  return <Link {...props} href={localizedHref} />;
}
