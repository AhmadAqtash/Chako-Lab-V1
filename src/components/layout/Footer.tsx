'use client';

import Link from '@/components/ui/LocalizedLink';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { SOCIALS } from '@/lib/socials';

export default function Footer() {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (section: string) => setExpanded(expanded === section ? null : section);

  const shopLinks = [
    { href: '/collections/linlin-kettles', key: 'cat_linlin' as const },
    { href: '/collections/kada-bottles',   key: 'cat_kada'   as const },
    { href: '/collections/bobo-tumblers',  key: 'cat_bobo'   as const },
    { href: '/collections/mugs',           key: 'cat_mugs'   as const },
    { href: '/collections',                key: 'nav_all_products' as const },
  ];

  const helpLinks = [
    { href: '/pages/faq',      key: 'footer_faq'      as const },
    { href: '/pages/shipping', key: 'footer_shipping'  as const },
    { href: '/pages/contact',  key: 'footer_contact'   as const },
    { href: '/pages/about',    key: 'footer_about'     as const },
  ];

  return (
    <footer className="bg-chako-ink text-chako-cream mt-auto">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-10">

          {/* Brand + social — always visible */}
          <div className="md:col-span-2 pb-8 md:pb-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/chako-lab-logo.png"
              alt="Chako Lab"
              style={{ height: '24px', width: 'auto', filter: 'invert(1)', display: 'block' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
              }}
            />
            <span style={{ display: 'none' }} className="font-display font-bold text-xl tracking-tight text-chako-cream">CHAKO LAB®</span>
            <p className="text-chako-cream/60 text-sm leading-relaxed max-w-xs mt-4">
              {t('footer_tagline')}
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href={SOCIALS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-95 transition-[transform,background-color] duration-150 touch-manipulation"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href={SOCIALS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 active:scale-95 transition-[transform,background-color] duration-150 touch-manipulation"
                aria-label="TikTok"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.79 1.52V6.74a4.85 4.85 0 01-1.02-.05z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop — collapsible on mobile */}
          <div className="border-t border-white/10 md:border-0">
            <button
              className="md:hidden w-full flex items-center justify-between py-4 touch-manipulation"
              onClick={() => toggle('shop')}
              aria-expanded={expanded === 'shop'}
            >
              <p className="font-sans font-semibold text-label uppercase tracking-widest leading-none text-chako-cream/70">{t('footer_shop')}</p>
              <ChevronDown
                size={16}
                className={`text-chako-cream/40 transition-transform duration-250 ${expanded === 'shop' ? 'rotate-180' : ''}`}
              />
            </button>
            <p className="hidden md:block font-sans font-semibold text-label mb-4 uppercase tracking-widest leading-none text-chako-cream/70">{t('footer_shop')}</p>
            <ul className={`space-y-3 pb-4 md:pb-0 md:space-y-2 md:block ${expanded === 'shop' ? 'block' : 'hidden'}`}>
              {shopLinks.map(({ href, key }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-chako-cream/55 hover:text-chako-cream transition-colors">
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help — collapsible on mobile */}
          <div className="border-t border-white/10 md:border-0">
            <button
              className="md:hidden w-full flex items-center justify-between py-4 touch-manipulation"
              onClick={() => toggle('help')}
              aria-expanded={expanded === 'help'}
            >
              <p className="font-sans font-semibold text-label uppercase tracking-widest leading-none text-chako-cream/70">{t('footer_help')}</p>
              <ChevronDown
                size={16}
                className={`text-chako-cream/40 transition-transform duration-250 ${expanded === 'help' ? 'rotate-180' : ''}`}
              />
            </button>
            <p className="hidden md:block font-sans font-semibold text-label mb-4 uppercase tracking-widest leading-none text-chako-cream/70">{t('footer_help')}</p>
            <ul className={`space-y-3 pb-4 md:pb-0 md:space-y-2 md:block ${expanded === 'help' ? 'block' : 'hidden'}`}>
              {helpLinks.map(({ href, key }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-chako-cream/55 hover:text-chako-cream transition-colors">
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 md:mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-chako-cream/40">
            {t('footer_copyright')}{' '}
            <a
              href="https://wegallop.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-chako-cream/70 transition-colors underline underline-offset-2"
            >
              {t('footer_company')}
            </a>
          </p>
          <div className="flex gap-4">
            <Link href="/pages/privacy" className="text-xs text-chako-cream/40 hover:text-chako-cream/70 transition-colors">
              {t('footer_privacy')}
            </Link>
            <Link href="/pages/terms" className="text-xs text-chako-cream/40 hover:text-chako-cream/70 transition-colors">
              {t('footer_terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
