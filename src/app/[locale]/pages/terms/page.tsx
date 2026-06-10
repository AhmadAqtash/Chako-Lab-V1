import type { Metadata } from 'next';
import type { Locale } from '@/lib/locale';
import { localeAlternates } from '@/lib/seo';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return {
    title: params.locale === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions',
    alternates: localeAlternates(params.locale, '/pages/terms'),
  };
}

export default function TermsPage() {
  return (
    <div className="max-w-screen-md mx-auto px-6 md:px-8 py-16 md:py-24">
      <p className="text-label font-semibold text-chako-ink/40 uppercase tracking-widest mb-3">Legal</p>
      <h1 className="text-heading font-display font-bold mb-4">Terms & Conditions</h1>
      <p className="text-chako-ink/50 text-xs mb-10">Last updated: January 2026</p>

      <div className="prose prose-sm max-w-none text-chako-ink/70 leading-relaxed space-y-6">
        <section>
          <h2 className="text-base font-display font-bold text-chako-ink">Use of the Site</h2>
          <p>By using chakolab.ae you agree to these terms. The site is operated by Gallop Enterprises LLC (trading as Chako Lab), registered in Dubai, UAE.</p>
        </section>
        <section>
          <h2 className="text-base font-display font-bold text-chako-ink">Orders & Payment</h2>
          <p>All prices are in AED and include applicable taxes. We reserve the right to cancel orders in the event of pricing errors or stock unavailability. Payment is processed securely via Shopify Payments.</p>
        </section>
        <section>
          <h2 className="text-base font-display font-bold text-chako-ink">Product Descriptions</h2>
          <p>We strive to display products accurately, but colours may vary depending on your screen. Product weights and dimensions are approximate.</p>
        </section>
        <section>
          <h2 className="text-base font-display font-bold text-chako-ink">Governing Law</h2>
          <p>These terms are governed by the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts of Dubai.</p>
        </section>
      </div>
    </div>
  );
}
