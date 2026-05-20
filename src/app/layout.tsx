import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import CategoryNav from '@/components/layout/CategoryNav';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import CartDrawer from '@/components/cart/CartDrawer';
import DemoBanner from '@/components/layout/DemoBanner';
import { Toaster } from 'react-hot-toast';

const inter = localFont({
  src: './fonts/InterVariable.woff2',
  variable: '--font-inter',
  display: 'swap',
  weight: '100 900',
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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen font-sans bg-chako-bg text-chako-dark" suppressHydrationWarning>
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
                background: '#171717',
                color: '#FAFAF8',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '500',
              },
              duration: 2500,
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
