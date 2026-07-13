import type { Metadata } from 'next';
import type { Locale } from '@/lib/locale';
import { localeAlternates } from '@/lib/seo';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return {
    title: params.locale === 'ar' ? 'الشحن والإرجاع' : 'Shipping & Returns',
    alternates: localeAlternates(params.locale, '/pages/shipping'),
  };
}

export default function ShippingPage() {
  return (
    <div className="max-w-screen-md mx-auto px-6 md:px-8 py-16 md:py-24">
      <p className="text-label font-semibold text-chako-ink/40 uppercase tracking-widest mb-3">Delivery</p>
      <h1 className="text-heading font-display font-bold mb-10">Shipping & Returns</h1>

      <div className="space-y-10 text-sm text-chako-ink/70 leading-relaxed">
        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-4">Shipping Rates & Times</h2>
          <div className="divide-y divide-black/8 border border-black/8 rounded-2xl overflow-hidden">
            {[
              { zone: 'UAE — Standard', time: '2–4 business days', cost: 'Free over AED 250, otherwise AED 15' },
              { zone: 'Dubai — Express', time: 'Same day / next day', cost: 'AED 25 (order before 2PM)' },
              { zone: 'GCC Countries', time: '5–7 business days', cost: 'Calculated at checkout' },
            ].map(({ zone, time, cost }) => (
              <div key={zone} className="grid grid-cols-3 px-4 py-3.5 text-xs">
                <span className="font-semibold text-chako-ink">{zone}</span>
                <span>{time}</span>
                <span>{cost}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-chako-ink/45">
            Orders placed before 3PM GST on business days typically ship the same day.
          </p>
        </section>

        {/* Returns sections mirror the shared policy at
            sundooq.me/pages/returns-refunds — one store, one policy.
            Update BOTH together if the policy ever changes. */}
        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-3">Eligibility for Returns</h2>
          <p>You may request a return within 15 days of receiving your order if the item:</p>
          <ul className="mt-3 space-y-1.5 list-disc ps-5">
            <li>Arrived damaged or defective.</li>
            <li>Is incorrect or not as described.</li>
            <li>Is unused, in original packaging, and with all tags intact.</li>
          </ul>
          <p className="mt-3">
            To start a return, please contact us at{' '}
            <a href="mailto:hi@sundooq.me" className="font-semibold text-chako-ink underline underline-offset-2">hi@sundooq.me</a>{' '}
            with your order number and photos of the item.
          </p>
        </section>

        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-3">Non-Returnable Items</h2>
          <p>For hygiene and safety reasons, certain products are non-returnable. These include, but are not limited to:</p>
          <ul className="mt-3 space-y-1.5 list-disc ps-5">
            <li>Personal care items (e.g., drinkware and bottles, once used).</li>
            <li>Opened or used products.</li>
            <li>Gift cards or promotional items.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-3">Return Process</h2>
          <p>Once your request is approved:</p>
          <ul className="mt-3 space-y-1.5 list-disc ps-5">
            <li>You&rsquo;ll receive instructions for courier pickup or drop-off.</li>
            <li>Returned items will be inspected within 3–5 working days of receipt.</li>
            <li>If approved, you&rsquo;ll be eligible for either a refund or store credit.</li>
          </ul>
          <p className="mt-3">Please ensure items are securely packaged. We reserve the right to decline returns that do not meet quality inspection standards.</p>
        </section>

        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-3">Refunds</h2>
          <p>Refunds are processed to your original payment method within 7–14 working days after approval. Depending on your bank, the refund may take additional time to reflect.</p>
          <p className="mt-3">Shipping and handling fees are non-refundable unless the item was faulty or incorrect.</p>
        </section>

        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-3">Exchanges</h2>
          <p>If you prefer an exchange for the same or a different product, we&rsquo;ll be happy to arrange it based on availability. Exchanges are subject to inspection and product stock.</p>
        </section>

        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-3">Damaged or Incorrect Items</h2>
          <p>If your item arrives damaged or incorrect, please notify us within 48 hours of delivery with your order number and clear photos of the item and packaging. We&rsquo;ll prioritize your replacement or refund at no additional cost to you.</p>
        </section>

        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-3">Cancellation Policy</h2>
          <p>Orders can be cancelled within 2 hours of purchase if they have not yet been processed or shipped. After dispatch, the standard return process applies.</p>
        </section>

        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-3">Responsibility for Return Shipping</h2>
          <p>For eligible returns (damaged or incorrect items), we cover the return shipping costs. For discretionary returns (change of mind), the customer may be responsible for shipping fees.</p>
        </section>

        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-3">Personalized and Engraved Items</h2>
          <p>Items customized with a personalized engraved name or message are made especially for you and are not eligible for return or exchange.</p>
          <p className="mt-3">However, if your personalized item arrives damaged or has a manufacturing defect, we will gladly offer a replacement, exchange, or refund, depending on product availability and the nature of the issue. To help us resolve it quickly, please contact us within 48 hours of delivery and include your order number and clear photos of the item and packaging.</p>
        </section>

        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-3">Warranty</h2>
          <p>All products carry a 12-month warranty against manufacturing defects. Contact us with proof of purchase to make a warranty claim.</p>
        </section>
      </div>
    </div>
  );
}
