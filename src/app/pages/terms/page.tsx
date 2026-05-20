import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms & Conditions' };

export default function TermsPage() {
  return (
    <div className="max-w-screen-md mx-auto px-6 md:px-8 py-16 md:py-24">
      <p className="text-xs font-semibold text-chako-dark/40 uppercase tracking-widest mb-3">Legal</p>
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Terms & Conditions</h1>
      <p className="text-chako-dark/50 text-xs mb-10">Last updated: January 2026</p>

      <div className="prose prose-sm max-w-none text-chako-dark/70 leading-relaxed space-y-6">
        <section>
          <h2 className="text-base font-bold text-chako-dark">Use of the Site</h2>
          <p>By using chakolab.ae you agree to these terms. The site is operated by Gallop Enterprises LLC (trading as Chako Lab), registered in Dubai, UAE.</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-chako-dark">Orders & Payment</h2>
          <p>All prices are in AED and include applicable taxes. We reserve the right to cancel orders in the event of pricing errors or stock unavailability. Payment is processed securely via Shopify Payments.</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-chako-dark">Product Descriptions</h2>
          <p>We strive to display products accurately, but colours may vary depending on your screen. Product weights and dimensions are approximate.</p>
        </section>
        <section>
          <h2 className="text-base font-bold text-chako-dark">Governing Law</h2>
          <p>These terms are governed by the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts of Dubai.</p>
        </section>
      </div>
    </div>
  );
}
