import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Shipping & Returns' };

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

        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-3">Returns Policy</h2>
          <p>We accept returns on unused, unopened items within 14 days of delivery. To initiate a return, contact us with your order number and reason for return. We will arrange a collection or provide a return label.</p>
          <p className="mt-3">Refunds are processed to the original payment method within 5–7 business days of receiving the return.</p>
        </section>

        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-3">Damaged or Incorrect Items</h2>
          <p>If your order arrives damaged or you received the wrong item, please contact us within 48 hours of delivery with photos. We will arrange a replacement or full refund at no cost to you.</p>
        </section>

        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-3">Warranty</h2>
          <p>All products carry a 12-month warranty against manufacturing defects. Contact us with proof of purchase to make a warranty claim.</p>
        </section>
      </div>
    </div>
  );
}
