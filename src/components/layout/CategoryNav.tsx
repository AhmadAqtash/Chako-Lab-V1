'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { COLLECTION_DISPLAY_NAMES, ALL_COLLECTION_HANDLES } from '@/lib/shopify';
import { cn } from '@/lib/utils';

export default function CategoryNav() {
  const pathname = usePathname();

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
          All
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
            {COLLECTION_DISPLAY_NAMES[handle]}
          </Link>
        ))}
      </div>
    </div>
  );
}
