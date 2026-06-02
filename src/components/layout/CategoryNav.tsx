'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/translations';

// Single source of truth for the site's category bar — series-based, deduped.
// `accent`/`accentText` style the active pill in the series color; falls back to ink.
const SERIES_NAV: {
  handle: string;
  key: TranslationKey;
  accent?: string;
  accentText?: string;
  featured?: boolean;
}[] = [
  { handle: 'titanium',         key: 'cat_titanium', accent: 'bg-chako-titanium', accentText: 'text-white',     featured: true },
  { handle: 'linlin-kettles',   key: 'cat_linlin',   accent: 'bg-chako-linlin',   accentText: 'text-chako-ink' },
  { handle: 'bawang-cups',      key: 'cat_bawang',   accent: 'bg-chako-bawang',   accentText: 'text-white' },
  { handle: 'milk-pods',        key: 'cat_milkpods', accent: 'bg-chako-milkpod',  accentText: 'text-white' },
  { handle: 'bobo-tumblers',    key: 'cat_bobo',     accent: 'bg-chako-bobo',     accentText: 'text-white' },
  { handle: 'kada-bottles',     key: 'cat_kada',     accent: 'bg-chako-kada',     accentText: 'text-chako-ink' },
  { handle: 'pangpang-cups',    key: 'cat_pangpang', accent: 'bg-chako-pangpang', accentText: 'text-white' },
  { handle: 'baobao-food-cups', key: 'cat_baobao' },
  { handle: 'pots',             key: 'cat_pots' },
  { handle: 'mugs',             key: 'cat_mugs' },
  { handle: 'square-cups',      key: 'cat_square' },
];

export default function CategoryNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const isActive = (href: string) => pathname === href;
  const onTitanium = pathname === '/collections/titanium';

  return (
    <div className="border-b border-black/8 bg-chako-bg">
      <div className="flex overflow-x-auto scrollbar-hide gap-1.5 px-4 md:px-8 py-2.5 max-w-screen-xl mx-auto">
        <Link
          href="/collections"
          className={cn(
            'flex-shrink-0 px-4 min-h-[38px] inline-flex items-center rounded-full text-sm font-semibold transition-colors whitespace-nowrap',
            isActive('/collections')
              ? 'bg-chako-ink text-chako-cream'
              : onTitanium
              ? 'text-white/65 hover:text-white hover:bg-white/10'
              : 'text-chako-ink/55 hover:text-chako-ink hover:bg-black/5'
          )}
        >
          {t('cat_all')}
        </Link>

        {SERIES_NAV.map(({ handle, key, accent, accentText, featured }) => {
          const href = `/collections/${handle}`;
          const active = isActive(href);
          return (
            <Link
              key={handle}
              href={href}
              className={cn(
                'flex-shrink-0 px-4 min-h-[38px] inline-flex items-center gap-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap',
                featured
                  ? onTitanium
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#F2D272] text-[#1a1a1a] shadow-md ps-4'
                    : 'titanium-pill ps-7 shadow-sm'
                  : active
                  ? cn(accent ?? 'bg-chako-ink', accentText ?? 'text-chako-cream')
                  : onTitanium
                  ? 'text-white/65 hover:text-white hover:bg-white/10'
                  : 'text-chako-ink/55 hover:text-chako-ink hover:bg-black/5'
              )}
            >
              {t(key)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
