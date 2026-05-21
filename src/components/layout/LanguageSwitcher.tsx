'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 text-xs font-medium hover:bg-black/5 transition-colors text-chako-dark/70 hover:text-chako-dark flex-shrink-0"
      aria-label="Switch language"
    >
      <Globe size={13} />
      {language === 'en' ? 'EN | عربي' : 'عربي | EN'}
    </button>
  );
}
