'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { language } = useLanguage();
  const pathname = usePathname() ?? '/';
  const isAr = language === 'ar';
  const target = isAr ? 'en' : 'ar';

  // Same page, other locale: swap the leading /en|/ar segment
  const rest = pathname.replace(/^\/(en|ar)(?=\/|$)/, '');
  const href = `/${target}${rest}`;

  return (
    <Link
      href={href}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-black/15 text-xs font-semibold hover:bg-black/5 active:scale-95 transition-[transform,background-color] duration-150 text-chako-ink flex-shrink-0 touch-manipulation"
      aria-label="Switch language"
    >
      <span className={isAr ? 'text-chako-ink/40' : 'text-chako-ink font-bold'}>EN</span>
      <span className="text-chako-ink/20 font-normal">|</span>
      <span className={isAr ? 'text-chako-ink font-bold' : 'text-chako-ink/40'}>عر</span>
    </Link>
  );
}
