'use client';

import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/translations';

// Generic client island for injecting translated strings inside server components.
export default function T({ k }: { k: TranslationKey }) {
  const { t } = useLanguage();
  return <>{t(k)}</>;
}
