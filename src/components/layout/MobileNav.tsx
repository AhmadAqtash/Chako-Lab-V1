'use client';

import Link from '@/components/ui/LocalizedLink';
import { useLocalePathname } from '@/lib/useLocalePathname';
import { Home, Grid, Search, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

const ITEM_COUNT = 4;

export default function MobileNav() {
  // Locale-stripped pathname: active-tab checks stay locale-agnostic
  const pathname = useLocalePathname();
  const { openCart, totalQuantity } = useCart();
  const { isRTL, t } = useLanguage();

  // Determine which link page is active (0=home, 1=collections, 2=search)
  const homeActive       = pathname === '/';
  const collectionsActive = pathname !== '/' && pathname.startsWith('/collections');
  const searchActive     = pathname.startsWith('/search');

  // In LTR display order: [home(0), collections(1), search(2), cart(3)]
  // In RTL display order: [cart(0), search(1), collections(2), home(3)]
  const activeLinkDisplayIndex = isRTL
    ? homeActive ? 3 : collectionsActive ? 2 : searchActive ? 1 : -1
    : homeActive ? 0 : collectionsActive ? 1 : searchActive ? 2 : -1;

  // Indicator pill — slides via CSS left calc (equal-width 4-col grid)
  const indicatorStyle: React.CSSProperties = {
    left:    activeLinkDisplayIndex >= 0 ? `calc(${activeLinkDisplayIndex} * 25% + 4px)` : 0,
    width:   `calc(${100 / ITEM_COUNT}% - 8px)`,
    opacity: activeLinkDisplayIndex >= 0 ? 1 : 0,
    transition: 'left 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 200ms ease',
  };

  const itemClass = 'relative z-10 flex flex-col items-center justify-center gap-0.5 min-h-[48px] w-full active:scale-[0.92] transition-transform duration-150 touch-manipulation';

  const linkItems = [
    { href: '/',             icon: Home,  label: t('nav_home'),         active: homeActive },
    { href: '/collections',  icon: Grid,  label: t('nav_all_products'), active: collectionsActive },
    { href: '/search',       icon: Search,label: t('nav_search'),       active: searchActive },
  ];

  const cartEl = (
    <button
      key="cart"
      onClick={openCart}
      className={itemClass}
      aria-label={t('nav_cart')}
    >
      <div className="relative">
        <ShoppingBag size={22} strokeWidth={1.75} className="text-chako-ink/40 transition-colors duration-200" />
        {totalQuantity > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-chako-orange text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-0.5 shadow-sm">
            {totalQuantity > 9 ? '9+' : totalQuantity}
          </span>
        )}
      </div>
      <span className="text-[10px] font-medium text-chako-ink/40">{t('nav_cart')}</span>
    </button>
  );

  const linkEls = linkItems.map(({ href, icon: Icon, label, active }) => (
    <Link
      key={href}
      href={href}
      className={itemClass}
    >
      <Icon
        size={22}
        strokeWidth={active ? 2.25 : 1.75}
        className={cn('transition-colors duration-200', active ? 'text-chako-ink' : 'text-chako-ink/40')}
      />
      <span className={cn('text-[10px] transition-colors duration-200', active ? 'font-semibold text-chako-ink' : 'font-medium text-chako-ink/40')}>
        {label}
      </span>
    </Link>
  ));

  // RTL reversal
  const orderedEls = isRTL
    ? [cartEl, ...([...linkEls].reverse())]
    : [...linkEls, cartEl];

  return (
    <nav className="mobile-nav md:hidden fixed bottom-0 left-0 right-0 z-30 bg-chako-bg/95 backdrop-blur-md border-t border-black/8 safe-area-pb">
      <div className="relative grid py-1" style={{ gridTemplateColumns: `repeat(${ITEM_COUNT}, 1fr)` }}>
        {/* Sliding background pill — branded ink tint + orange accent */}
        <span
          className="absolute top-1.5 h-[46px] bg-chako-ink/[0.07] rounded-xl pointer-events-none"
          style={indicatorStyle}
          aria-hidden
        >
          <span className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-chako-orange rounded-full" />
        </span>
        {orderedEls}
      </div>
    </nav>
  );
}
