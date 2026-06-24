import type { Metadata } from 'next';
import Script from 'next/script';
import { Noto_Sans_Arabic } from 'next/font/google';
import { notFound } from 'next/navigation';
import '../globals.css';
import { LOCALES, isLocale, type Locale } from '@/lib/locale';
import { SITE_URL } from '@/lib/seo';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import CategoryNav from '@/components/layout/CategoryNav';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import CartDrawer from '@/components/cart/CartDrawer';
import DemoBanner from '@/components/layout/DemoBanner';
import ChakoPreloader from '@/components/ui/ChakoPreloader';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Google Tag Manager container — public client-side ID, drives Meta ads
// (and any other) tags configured inside GTM. Change here in one place.
const GTM_ID = 'GTM-TM95NZ84';

// Arabic body text — kept for RTL layout
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const SITE_META = {
  en: {
    title: { default: 'Chako Lab — Crafted Drinkware', template: '%s | Chako Lab' },
    description:
      'Thoughtfully designed drinkware for your daily ritual. Shop LinLin Kettles, Kada Bottles, BoBo Tumblers, and more — delivered across the UAE.',
  },
  ar: {
    title: { default: 'تشاكو لاب — أدوات شرب مصممة بعناية', template: '%s | تشاكو لاب' },
    description:
      'أدوات شرب مصممة بعناية لطقوسك اليومية. تسوق أباريق لين لين وزجاجات كادا وتمبلر بوبو والمزيد — مع التوصيل في جميع أنحاء الإمارات.',
  },
} as const;

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'en';
  return {
    metadataBase: new URL(SITE_URL),
    title: SITE_META[locale].title,
    description: SITE_META[locale].description,
    keywords: ['drinkware', 'UAE', 'kettles', 'bottles', 'tumblers', 'mugs', 'Chako Lab'],
    openGraph: {
      type: 'website',
      siteName: 'Chako Lab',
      locale: locale === 'ar' ? 'ar_AE' : 'en_AE',
      alternateLocale: locale === 'ar' ? 'en_AE' : 'ar_AE',
    },
  };
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Middleware guarantees en/ar; guard stays as defense-in-depth
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale;

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={notoSansArabic.variable}>
      <head>
        {/* Google Tag Manager — afterInteractive is the GTM-recommended
            strategy in Next.js (same as @next/third-parties uses). Loads the
            container as early as the framework allows without blocking paint. */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>

        {/* Clash Display + General Sans via Fontshare (free, commercial-use) */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        {/* IBM Plex Sans Arabic — RTL headings */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen font-sans bg-chako-bg text-chako-ink">
        {/* Google Tag Manager (noscript) — must be the first thing in <body> */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <ChakoPreloader />
        <LanguageProvider locale={locale}>
        <CartProvider>
          <DemoBanner />
          <AnnouncementBar />
          <Header />
          <CategoryNav />
          <main className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
          <Footer />
          <MobileNav />
          <CartDrawer />
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#F5F0E8',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '500',
                fontFamily: '"General Sans", system-ui, sans-serif',
              },
              duration: 2500,
            }}
          />
        </CartProvider>
        </LanguageProvider>

        {/* Vercel Web Analytics — first-party visitors/pageviews/bounce in the
            Vercel dashboard. No-op in dev, only sends on the deployed site. */}
        <Analytics />
        {/* Vercel Speed Insights — real-user Core Web Vitals (load, INP, CLS). */}
        <SpeedInsights />
      </body>
    </html>
  );
}
