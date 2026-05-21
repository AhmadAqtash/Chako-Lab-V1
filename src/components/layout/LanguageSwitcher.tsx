'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const isAr = language === 'ar';

  return (
    <button
      onClick={() => setLanguage(isAr ? 'en' : 'ar')}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-black/15 text-sm font-medium hover:bg-black/5 transition-colors text-chako-dark flex-shrink-0"
      aria-label="Switch language"
    >
      <Globe size={14} className="hidden sm:block" />
      {/* Mobile: compact current-language label only */}
      <span className="sm:hidden">{isAr ? 'ع' : 'EN'}</span>
      {/* Desktop: full label */}
      <span className="hidden sm:inline">{isAr ? 'عربي | EN' : 'EN | عربي'}</span>
    </button>
  );
}
