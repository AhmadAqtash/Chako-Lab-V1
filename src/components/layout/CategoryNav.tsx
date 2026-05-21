'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ALL_COLLECTION_HANDLES } from '@/lib/shopify';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/translations';

const HANDLE_TO_CAT_KEY: Record<string, TranslationKey> = {
  'linlin-kettles':   'cat_linlin',
  'bawang-cups':      'cat_bawang',
  'bobo-tumblers':    'cat_bobo',
  'kada-bottles':     'cat_kada',
  'pots':             'cat_pots',
  'mugs':             'cat_mugs',
  'milk-pods':        'cat_milkpods',
  'baobao-food-cups': 'cat_baobao',
  'pangpang-cups':    'cat_pangpang',
  'square-cups':      'cat_square',
};

export default function CategoryNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="border-b border-black/8 bg-chako-bg">
      <div className="flex overflow-x-auto scrollbar-hide gap-1 px-4 md:px-8 py-2 max-w-screen-xl mx-auto">
        <Link
          href="/collections"
          className={cn(
            'flex-shrink-0 px-4 min-h-[36px] inline-flex items-center rounded-full text-sm font-medium transition-colors whitespace-nowrap',
            pathname === '/collections'
              ? 'bg-chako-dark text-chako-bg'
              : 'text-chako-dark/60 hover:text-chako-dark hover:bg-black/5'
          )}
        >
          {t('cat_all')}
        </Link>
        {ALL_COLLECTION_HANDLES.map((handle) => (
          <Link
            key={handle}
            href={`/collections/${handle}`}
            className={cn(
              'flex-shrink-0 px-4 min-h-[36px] inline-flex items-center rounded-full text-sm font-medium transition-colors whitespace-nowrap',
              pathname === `/collections/${handle}`
                ? 'bg-chako-dark text-chako-bg'
                : 'text-chako-dark/60 hover:text-chako-dark hover:bg-black/5'
            )}
          >
            {t(HANDLE_TO_CAT_KEY[handle] ?? 'cat_all')}
          </Link>
        ))}
      </div>
    </div>
  );
}
