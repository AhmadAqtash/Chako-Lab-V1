'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Languages, Mail } from 'lucide-react';

// Same contact points as sundooq.me (one business, one WhatsApp, one inbox)
const WHATSAPP_NUMBER = '971566881332';
const CONTACT_EMAIL = 'hi@sundooq.me';

const COPY = {
  en: {
    lang: 'عربي — switch to Arabic',
    email: 'Email us',
    whatsapp: 'Chat on WhatsApp',
    waText: "Hi Chako Lab! I'd love to know more about your drinkware.",
    subject: 'Chako Lab — Customer Inquiry',
  },
  ar: {
    lang: 'English — التبديل إلى الإنجليزية',
    email: 'راسلنا عبر البريد',
    whatsapp: 'تواصل عبر واتساب',
    waText: 'مرحباً شاكو لاب! أودّ معرفة المزيد عن منتجاتكم.',
    subject: 'شاكو لاب — استفسار عميل',
  },
} as const;

// Floating contact stack (sundooq.me-style): language toggle, email, WhatsApp.
// Sits at the logical end edge (right in EN, left in AR), above the mobile
// bottom nav, and under the cart drawer + its overlay (z-30 < z-40/50).
export default function FloatingContact() {
  const { language } = useLanguage();
  const pathname = usePathname() ?? '/';
  const isAr = language === 'ar';
  const t = COPY[isAr ? 'ar' : 'en'];

  // Same page, other locale — mirrors the header LanguageSwitcher
  const rest = pathname.replace(/^\/(en|ar)(?=\/|$)/, '');
  const langHref = `/${isAr ? 'en' : 'ar'}${rest}`;

  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t.waText)}`;
  const mailHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.subject)}`;

  // Wobble is a hover greeting, not a state — it ends back at neutral, so it
  // coexists with active:scale-95 press feedback. motion-safe honors
  // prefers-reduced-motion.
  const circle =
    'flex items-center justify-center w-12 h-12 rounded-full shadow-lg ' +
    'motion-safe:hover:animate-wobble active:scale-95 transition-transform duration-150 touch-manipulation ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chako-ink focus-visible:ring-offset-2';

  return (
    <div
      className="fixed end-4 bottom-20 md:bottom-6 z-30 flex flex-col gap-3 animate-fade-in"
      aria-label={isAr ? 'تواصل معنا' : 'Contact us'}
    >
      {/* Titanium indigo — the site's blue */}
      <Link href={langHref} className={`${circle} bg-chako-titanium text-white`} aria-label={t.lang} title={t.lang}>
        <Languages size={22} aria-hidden="true" />
      </Link>

      {/* LinLin yellow — dark ink icon, same contrast pairing the site uses on yellow */}
      <a href={mailHref} className={`${circle} bg-chako-linlin text-chako-ink`} aria-label={t.email} title={t.email}>
        <Mail size={22} aria-hidden="true" />
      </a>

      {/* WhatsApp keeps its recognizable brand green */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`${circle} bg-[#25D366] text-white`}
        aria-label={t.whatsapp}
        title={t.whatsapp}
      >
        {/* WhatsApp glyph — lucide carries no brand icons */}
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </div>
  );
}
