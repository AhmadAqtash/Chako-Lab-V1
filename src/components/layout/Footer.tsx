import Link from 'next/link';
import NewsletterForm from './NewsletterForm';

export default function Footer() {
  return (
    <footer className="bg-chako-dark text-chako-bg mt-auto">
      <div className="max-w-screen-xl mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/chako-lab-logo.png"
              alt="Chako Lab"
              style={{ height: '24px', width: 'auto', filter: 'invert(1)', display: 'block' }}
            />
            <p className="text-chako-bg/60 text-sm leading-relaxed max-w-xs">
              Crafted drinkware for everyday rituals. Every sip, beautifully made.
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href="https://instagram.com/chakolab.ae"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://tiktok.com/@chakolab.ae"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="TikTok"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.79 1.52V6.74a4.85 4.85 0 01-1.02-.05z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <p className="font-semibold text-sm mb-4 text-chako-bg/80 uppercase tracking-wider">Shop</p>
            <ul className="space-y-2">
              {[
                { href: '/collections/linlin-kettles', label: 'LinLin Kettles' },
                { href: '/collections/kada-bottles', label: 'Kada Bottles' },
                { href: '/collections/bobo-tumblers', label: 'BoBo Tumblers' },
                { href: '/collections/mugs', label: 'Mugs' },
                { href: '/collections', label: 'All Products' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-chako-bg/55 hover:text-chako-bg transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-sm mb-4 text-chako-bg/80 uppercase tracking-wider">Help</p>
            <ul className="space-y-2 mb-8">
              {[
                { href: '/pages/faq', label: 'FAQ' },
                { href: '/pages/shipping', label: 'Shipping & Returns' },
                { href: '/pages/contact', label: 'Contact Us' },
                { href: '/pages/about', label: 'About Chako Lab' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-chako-bg/55 hover:text-chako-bg transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="font-semibold text-sm mb-3 text-chako-bg/80 uppercase tracking-wider">Newsletter</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-chako-bg/40">
            © 2026 Chako Lab UAE | Owned By{' '}
            <a
              href="https://wegallop.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-chako-bg/70 transition-colors underline underline-offset-2"
            >
              Gallop Enterprises LLC
            </a>
            .
          </p>
          <div className="flex gap-4">
            <Link href="/pages/privacy" className="text-xs text-chako-bg/40 hover:text-chako-bg/70 transition-colors">
              Privacy
            </Link>
            <Link href="/pages/terms" className="text-xs text-chako-bg/40 hover:text-chako-bg/70 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
