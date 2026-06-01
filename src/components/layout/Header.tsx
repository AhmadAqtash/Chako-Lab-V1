'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Search, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { openCart, totalQuantity } = useCart();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cartBadge = totalQuantity > 0 && (
    <span className="absolute -top-0.5 -right-0.5 bg-chako-orange text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-0.5 shadow-sm">
      {totalQuantity > 99 ? '99+' : totalQuantity}
    </span>
  );

  return (
    <header
      className={cn(
        'sticky top-0 z-30 transition-[background-color,backdrop-filter,box-shadow] duration-300',
        scrolled ? 'bg-white/85 backdrop-blur-md shadow-sm' : 'bg-chako-bg'
      )}
    >
      {/* ── Mobile header (< md): 3-column grid — lang | logo | actions ── */}
      <div className="md:hidden px-4 h-12 grid grid-cols-3 items-center">
        <div className="flex items-center">
          <LanguageSwitcher />
        </div>

        <div className="flex items-center justify-center">
          <Link href="/" aria-label="Chako Lab" className="inline-flex items-center leading-[0]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/chako-lab-logo.png"
              alt="Chako Lab"
              style={{ height: '24px', width: 'auto', maxWidth: '160px', flexShrink: 0, display: 'block', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
              }}
            />
            <span style={{ display: 'none' }} className="font-display font-bold text-base tracking-tight">CHAKO LAB®</span>
          </Link>
        </div>

        <div className="flex items-center justify-end gap-0.5">
          <Link
            href="/search"
            className="p-2.5 rounded-full hover:bg-black/5 active:scale-95 transition-[transform,background-color] duration-150 touch-manipulation"
            aria-label={t('nav_search')}
          >
            <Search size={20} />
          </Link>
          <button
            onClick={openCart}
            className="p-2.5 rounded-full hover:bg-black/5 active:scale-95 transition-[transform,background-color] duration-150 relative touch-manipulation"
            aria-label={t('nav_cart')}
          >
            <ShoppingBag size={20} />
            {cartBadge}
          </button>
        </div>
      </div>

      {/* ── Desktop header (≥ md): logo | nav | actions ── */}
      <div className="hidden md:flex max-w-screen-xl mx-auto px-8 h-14 items-center gap-4">
        <Link href="/" className="flex-shrink-0 mr-2 inline-flex items-center leading-[0]" aria-label="Chako Lab">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/chako-lab-logo.png"
            alt="Chako Lab"
            style={{ height: '28px', width: 'auto', maxWidth: '160px', flexShrink: 0, display: 'block', objectFit: 'contain' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
            }}
          />
          <span style={{ display: 'none' }} className="font-display font-bold text-lg tracking-tight">CHAKO LAB®</span>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <Link
            href="/search"
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
            aria-label={t('nav_search')}
          >
            <Search size={20} />
          </Link>
          <button
            onClick={openCart}
            className="p-2 hover:bg-black/5 rounded-full transition-colors relative"
            aria-label={t('nav_cart')}
          >
            <ShoppingBag size={20} />
            {totalQuantity > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-chako-orange text-white text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 shadow-sm">
                {totalQuantity > 99 ? '99+' : totalQuantity}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
