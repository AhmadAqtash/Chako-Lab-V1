'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Search, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

export default function MobileNav() {
  const pathname = usePathname();
  const { openCart, totalQuantity } = useCart();
  const { isRTL, t } = useLanguage();

  const NAV = [
    { href: '/', icon: Home, label: t('nav_home') },
    { href: '/collections', icon: Grid, label: t('nav_all_products') },
    { href: '/search', icon: Search, label: t('nav_search') },
  ];

  const cartButton = (
    <button
      key="cart"
      onClick={openCart}
      className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-chako-dark/40 relative"
    >
      <div className="relative">
        <ShoppingBag size={22} strokeWidth={1.75} />
        {totalQuantity > 0 && (
          <span className="absolute -top-1 -right-1 bg-chako-dark text-chako-bg text-[9px] font-bold min-w-[14px] h-3.5 flex items-center justify-center rounded-full px-0.5">
            {totalQuantity > 9 ? '9+' : totalQuantity}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium">{t('nav_cart')}</span>
    </button>
  );

  const navLinks = NAV.map(({ href, icon: Icon, label }) => {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href));
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors',
          active ? 'text-chako-dark' : 'text-chako-dark/40'
        )}
      >
        <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
        <span className="text-[10px] font-medium">{label}</span>
      </Link>
    );
  });

  const items = isRTL ? [cartButton, ...navLinks.reverse()] : [...navLinks, cartButton];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-chako-bg/90 backdrop-blur-md border-t border-black/8 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {items}
      </div>
    </nav>
  );
}
