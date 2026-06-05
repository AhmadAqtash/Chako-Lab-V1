'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import type { TranslationKey } from '@/lib/translations';
import { ChevronDown } from 'lucide-react';

// Series list for the Categories dropdown (titanium intentionally excluded here —
// it has its own dedicated pill at the end of the nav).
const SERIES: { handle: string; key: TranslationKey }[] = [
  { handle: 'linlin-kettles',   key: 'cat_linlin' },
  { handle: 'bawang-cups',      key: 'cat_bawang' },
  { handle: 'milk-pods',        key: 'cat_milkpods' },
  { handle: 'bobo-tumblers',    key: 'cat_bobo' },
  { handle: 'kada-bottles',     key: 'cat_kada' },
  { handle: 'pangpang-cups',    key: 'cat_pangpang' },
  { handle: 'baobao-food-cups', key: 'cat_baobao' },
  { handle: 'pots',             key: 'cat_pots' },
  { handle: 'mugs',             key: 'cat_mugs' },
  { handle: 'square-cups',      key: 'cat_square' },
];

export default function CategoryNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [openCats, setOpenCats] = useState(false);
  const catsRef = useRef<HTMLDivElement>(null);
  const onTitanium = pathname === '/collections/titanium';

  // close dropdown on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (catsRef.current && !catsRef.current.contains(e.target as Node)) setOpenCats(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // close on route change
  useEffect(() => { setOpenCats(false); }, [pathname]);

  const linkBase = 'px-3 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap';
  const linkIdle = onTitanium
    ? 'text-white/70 hover:text-white hover:bg-white/10'
    : 'text-chako-ink/70 hover:text-chako-ink hover:bg-black/5';
  const linkActive = onTitanium
    ? 'bg-white/15 text-white'
    : 'bg-chako-ink text-chako-cream';

  const isActive = (href: string) => pathname === href;

  return (
    <div className="hidden md:block border-b border-black/8 bg-chako-bg">
      <nav className="flex items-center justify-center gap-1 px-8 py-2.5 max-w-screen-xl mx-auto">
        {/* Home */}
        <Link href="/" className={cn(linkBase, isActive('/') ? linkActive : linkIdle)}>
          {t('nav_home')}
        </Link>

        {/* Shop All */}
        <Link href="/collections" className={cn(linkBase, isActive('/collections') ? linkActive : linkIdle)}>
          {t('nav_all_products')}
        </Link>

        {/* Categories dropdown */}
        <div className="relative" ref={catsRef}>
          <button
            type="button"
            onClick={() => setOpenCats((v) => !v)}
            className={cn(linkBase, 'inline-flex items-center gap-1', openCats ? linkActive : linkIdle)}
            aria-expanded={openCats}
            aria-haspopup="true"
          >
            {t('nav_categories')}
            <ChevronDown size={15} className={cn('transition-transform', openCats && 'rotate-180')} />
          </button>
          {openCats && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 min-w-[200px] bg-white rounded-xl shadow-xl border border-black/8 py-2">
              {SERIES.map(({ handle, key }) => (
                <Link
                  key={handle}
                  href={`/collections/${handle}`}
                  className="block px-4 py-2.5 text-sm font-medium text-chako-ink/80 hover:text-chako-ink hover:bg-black/5 transition-colors whitespace-nowrap"
                >
                  {t(key)}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* New */}
        <Link href="/collections/new" className={cn(linkBase, isActive('/collections/new') ? linkActive : linkIdle)}>
          {t('nav_new')}
        </Link>

        {/* Titanium — premium gold pill, always present */}
        <Link
          href="/collections/titanium"
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ms-1',
            onTitanium
              ? 'bg-gradient-to-r from-[#D4AF37] to-[#F2D272] text-[#1a1a1a] shadow-md'
              : 'titanium-pill ps-7 shadow-sm'
          )}
        >
          {t('cat_titanium')}
        </Link>
      </nav>
    </div>
  );
}
