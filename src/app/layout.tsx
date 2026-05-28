import type { Metadata } from 'next';
import { Noto_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import CategoryNav from '@/components/layout/CategoryNav';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import CartDrawer from '@/components/cart/CartDrawer';
import DemoBanner from '@/components/layout/DemoBanner';
import { Toaster } from 'react-hot-toast';

// Arabic body text — kept for RTL layout
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Chako Lab — Crafted Drinkware',
    template: '%s | Chako Lab',
  },
  description: 'Thoughtfully designed drinkware for your daily ritual. Shop LinLin Kettles, Kada Bottles, BoBo Tumblers, and more — delivered across the UAE.',
  keywords: ['drinkware', 'UAE', 'kettles', 'bottles', 'tumblers', 'mugs', 'Chako Lab'],
  openGraph: {
    type: 'website',
    locale: 'en_AE',
    siteName: 'Chako Lab',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={notoSansArabic.variable} suppressHydrationWarning>
      <head>
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
      <body className="flex flex-col min-h-screen font-sans bg-chako-bg text-chako-dark" suppressHydrationWarning>
        <LanguageProvider>
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
      </body>
    </html>
  );
}
