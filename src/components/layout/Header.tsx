'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/collections/linlin-kettles', label: 'Kettles' },
  { href: '/collections/kada-bottles', label: 'Bottles' },
  { href: '/collections/mugs', label: 'Mugs' },
  { href: '/collections/bobo-tumblers', label: 'Tumblers' },
  { href: '/collections', label: 'All Products' },
];

export default function Header() {
  const { openCart, totalQuantity } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 bg-chako-bg transition-shadow duration-200',
        scrolled && 'shadow-sm'
      )}
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 h-14 flex items-center gap-4">
        <Link href="/" className="flex-shrink-0 mr-2" aria-label="Chako Lab">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/chako-lab-logo.webp"
            alt="Chako Lab"
            style={{ height: '32px', width: 'auto', objectFit: 'contain', display: 'block' }}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-chako-dark'
                  : 'text-chako-dark/55 hover:text-chako-dark hover:bg-black/5'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 ml-auto">
          <Link
            href="/search"
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
            aria-label="Search"
          >
            <Search size={20} />
          </Link>
          <button
            onClick={openCart}
            className="p-2 hover:bg-black/5 rounded-full transition-colors relative"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {totalQuantity > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-chako-dark text-chako-bg text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                {totalQuantity > 99 ? '99+' : totalQuantity}
              </span>
            )}
          </button>
          <button
            className="md:hidden p-2 hover:bg-black/5 rounded-full transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-black/8 bg-chako-bg px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-black/5 text-chako-dark'
                  : 'text-chako-dark/60 hover:text-chako-dark hover:bg-black/5'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
