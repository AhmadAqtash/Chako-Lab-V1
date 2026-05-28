'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const isAr = language === 'ar';

  return (
    <button
      onClick={() => setLanguage(isAr ? 'en' : 'ar')}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-black/15 text-xs font-semibold hover:bg-black/5 active:scale-95 transition-[transform,background-color] duration-150 text-chako-dark flex-shrink-0 touch-manipulation"
      aria-label="Switch language"
    >
      <span className={isAr ? 'text-chako-dark/40' : 'text-chako-dark font-bold'}>EN</span>
      <span className="text-chako-dark/20 font-normal">|</span>
      <span className={isAr ? 'text-chako-dark font-bold' : 'text-chako-dark/40'}>عر</span>
    </button>
  );
}
