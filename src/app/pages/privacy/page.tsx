import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="max-w-screen-md mx-auto px-6 md:px-8 py-16 md:py-24">
      <p className="text-label font-semibold text-chako-ink/40 uppercase tracking-widest mb-3">Legal</p>
      <h1 className="text-heading font-display font-bold mb-4">Privacy Policy</h1>
      <p className="text-chako-ink/50 text-xs mb-10">Last updated: January 2026</p>

      <div className="prose prose-sm max-w-none text-chako-ink/70 leading-relaxed space-y-6">
        <section>
          <h2 className="text-base font-display font-bold text-chako-ink">Information We Collect</h2>
          <p>We collect information you provide when placing an order (name, email, delivery address, payment details) and information about how you interact with our website (pages visited, device type, browser).</p>
        </section>
        <section>
          <h2 className="text-base font-display font-bold text-chako-ink">How We Use Your Information</h2>
          <p>We use your information to process orders, send order updates, provide customer support, and improve our service. We do not sell your personal data to third parties.</p>
        </section>
        <section>
          <h2 className="text-base font-display font-bold text-chako-ink">Data Retention</h2>
          <p>We retain order data for 7 years as required by UAE commercial law. You may request deletion of your account and personal data at any time by contacting us.</p>
        </section>
        <section>
          <h2 className="text-base font-display font-bold text-chako-ink">Contact</h2>
          <p>For privacy-related queries, contact us at hello@chakolab.ae. Chako Lab is operated by Gallop Enterprises LLC, Dubai, UAE.</p>
        </section>
      </div>
    </div>
  );
}
