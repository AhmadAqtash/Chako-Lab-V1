'use client';

import Link from '@/components/ui/LocalizedLink';
import { useLocalePathname } from '@/lib/useLocalePathname';
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
  // Locale-stripped pathname: comparisons below stay locale-agnostic
  const pathname = useLocalePathname();
  const { t } = useLanguage();
  const [openCats, setOpenCats] = useState(false);
  const [catsPos, setCatsPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const catsRef = useRef<HTMLDivElement>(null);
  const catsBtnRef = useRef<HTMLButtonElement>(null);
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

  // close dropdown on scroll (prevents the fixed panel from detaching/floating)
  useEffect(() => {
    if (!openCats) return;
    const close = () => setOpenCats(false);
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, [openCats]);

  const linkBase = 'flex-shrink-0 px-3 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap';
  const linkIdle = onTitanium
    ? 'text-white/70 hover:text-white hover:bg-white/10'
    : 'text-chako-ink/70 hover:text-chako-ink hover:bg-black/5';
  const linkActive = onTitanium
    ? 'bg-white/15 text-white'
    : 'bg-chako-ink text-chako-cream';

  const isActive = (href: string) => pathname === href;

  return (
    <div className="sticky top-12 md:top-14 z-20 border-b border-black/8 bg-chako-bg">
      <nav className="flex items-center md:justify-center gap-1 px-4 md:px-8 py-2 md:py-2.5 max-w-screen-xl mx-auto overflow-x-auto overflow-y-visible scrollbar-hide">
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
            ref={catsBtnRef}
            type="button"
            onClick={() => {
              const r = catsBtnRef.current?.getBoundingClientRect();
              if (r) setCatsPos({ top: r.bottom + 8, left: r.left });
              setOpenCats((v) => !v);
            }}
            className={cn(linkBase, 'inline-flex items-center gap-1', openCats ? linkActive : linkIdle)}
            aria-expanded={openCats}
            aria-haspopup="true"
          >
            {t('nav_categories')}
            <ChevronDown size={15} className={cn('transition-transform', openCats && 'rotate-180')} />
          </button>
          {openCats && (
            <div
              className="cat-dropdown fixed z-[70] min-w-[200px] max-h-[70vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-black/8 py-2"
              style={{ top: catsPos.top, left: catsPos.left }}
            >
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
            'flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ms-1',
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
