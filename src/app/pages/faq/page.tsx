import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'FAQ' };

const FAQS = [
  {
    q: 'Where do you deliver?',
    a: 'We deliver across all Emirates (Dubai, Abu Dhabi, Sharjah, Ajman, RAK, Fujairah, UAQ) and to GCC countries including Saudi Arabia, Kuwait, Qatar, Bahrain, and Oman.',
  },
  {
    q: 'What are your delivery times?',
    a: 'Standard UAE delivery takes 2–4 business days. Express Dubai delivery (same/next day) is available for orders placed before 2PM. GCC orders take 5–7 business days.',
  },
  {
    q: 'Is shipping free?',
    a: 'Yes — standard shipping is free on all orders over AED 250. Orders below AED 250 attract a flat shipping fee calculated at checkout.',
  },
  {
    q: 'What is your returns policy?',
    a: 'We offer a 14-day return policy on all unused, unopened items. If there is a manufacturing defect, we will replace or refund regardless of the timeframe. Contact us to initiate a return.',
  },
  {
    q: 'Are the products covered by warranty?',
    a: 'All Chako Lab products carry a 12-month warranty against manufacturing defects. This does not cover damage from misuse, drops, or normal wear and tear.',
  },
  {
    q: 'How do I care for my drinkware?',
    a: 'Most products are hand-wash recommended. Avoid abrasive cleaners on coated or ceramic surfaces. Do not microwave vacuum-insulated stainless steel products. Check the individual product page for specific care instructions.',
  },
  {
    q: 'Do you offer gift wrapping?',
    a: 'Gift packaging is available on selected items. Look for the gift option at checkout. You can also add a personalised message.',
  },
  {
    q: 'How do I track my order?',
    a: 'Once your order ships you will receive an email with a tracking number. You can also contact us via the Contact page for order status updates.',
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-screen-md mx-auto px-6 md:px-8 py-16 md:py-24">
      <p className="text-xs font-semibold text-chako-dark/40 uppercase tracking-widest mb-3">Help Centre</p>
      <h1 className="text-3xl md:text-4xl font-bold mb-10">Frequently Asked Questions</h1>

      <div className="space-y-0 divide-y divide-black/8">
        {FAQS.map(({ q, a }) => (
          <details key={q} className="group py-5">
            <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-sm">
              {q}
              <span className="ml-4 flex-shrink-0 text-chako-dark/40 group-open:rotate-45 transition-transform duration-200 text-lg leading-none">+</span>
            </summary>
            <p className="mt-3 text-sm text-chako-dark/60 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
