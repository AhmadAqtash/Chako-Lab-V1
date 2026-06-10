'use client';

import React, { createContext, useContext } from 'react';
import translations, { TranslationKey } from '@/lib/translations';
import type { Locale } from '@/lib/locale';

type Language = Locale;

interface LanguageContextValue {
  language: Language;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  t: (key) => translations.en[key] as string,
  isRTL: false,
});

// The locale comes from the URL ([locale] segment) via the root layout — the
// single source of truth. No cookies, no localStorage, no client-side <html>
// patching: server and client can never disagree on language.
export function LanguageProvider({
  locale,
  children,
}: {
  locale: Language;
  children: React.ReactNode;
}) {
  function t(key: TranslationKey): string {
    return (translations[locale][key] ?? translations.en[key] ?? key) as string;
  }

  return (
    <LanguageContext.Provider value={{ language: locale, t, isRTL: locale === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
