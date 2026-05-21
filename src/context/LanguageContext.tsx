'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import translations, { TranslationKey } from '@/lib/translations';

type Language = 'en' | 'ar';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => translations.en[key] as string,
  isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // Read from localStorage after mount (avoids SSR/hydration mismatch)
  useEffect(() => {
    const stored = localStorage.getItem('chako_lang') as Language;
    if (stored === 'en' || stored === 'ar') {
      setLanguageState(stored);
    }
  }, []);

  // Apply dir/lang to <html> and persist preference
  useEffect(() => {
    const rtl = language === 'ar';
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('chako_lang', language);
  }, [language]);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
  }

  function t(key: TranslationKey): string {
    return (translations[language][key] ?? translations.en[key] ?? key) as string;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL: language === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
