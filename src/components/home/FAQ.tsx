'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const FAQS = [
  {
    q: 'Where does Chako Lab ship to?',
    a: 'We ship across the UAE and GCC region. Standard delivery takes 2-4 business days within the UAE.',
  },
  {
    q: 'Are the products food-safe and BPA-free?',
    a: 'Yes. All Chako Lab products are made from food-grade materials and are completely BPA-free. We use 304 stainless steel, borosilicate glass, and food-safe plastics.',
  },
  {
    q: 'How do I clean and care for my Chako Lab product?',
    a: 'Most products are hand-wash recommended. Avoid abrasive cleaners. For insulated items, do not submerge lids with silicone seals in water for extended periods.',
  },
  {
    q: 'What is the return policy?',
    a: 'We accept returns within 14 days of delivery for unused, undamaged items in original packaging. Contact us via Instagram or email to initiate a return.',
  },
  {
    q: 'Do the insulated bottles keep drinks hot/cold?',
    a: 'Our double-wall vacuum-insulated bottles keep beverages hot for up to 12 hours and cold for up to 24 hours under normal conditions.',
  },
  {
    q: 'Can I buy Chako Lab products in-store in the UAE?',
    a: 'Currently, Chako Lab is online-only. We ship directly to your door with fast UAE delivery.',
  },
];

const EASE = 'cubic-bezier(0.23,1,0.32,1)';

export default function FAQ() {
  const { t } = useLanguage();
  const [open, setOpen] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { setRevealed(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="max-w-screen-xl mx-auto px-4 md:px-8 py-16 md:py-20">
      <div className="max-w-2xl mx-auto">
        <div
          className="text-center mb-10"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity 600ms ${EASE}, transform 600ms ${EASE}`,
          }}
        >
          <p className="text-xs font-semibold text-chako-dark/40 uppercase tracking-widest mb-2">{t('faq_label')}</p>
          <h2 className="text-2xl md:text-3xl font-bold">{t('faq_heading')}</h2>
        </div>

        <div className="space-y-2">
          {FAQS.map(({ q, a }, i) => (
            <div
              key={i}
              className="border border-black/8 rounded-2xl overflow-hidden"
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 500ms ${EASE} ${i * 60}ms, transform 500ms ${EASE} ${i * 60}ms`,
              }}
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-black/[0.02] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-chako-dark/20"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="font-medium text-sm pr-4">{q}</span>
                <ChevronDown
                  size={16}
                  className={`flex-shrink-0 text-chako-dark/40 transition-transform duration-300 ease-out ${
                    open === i ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Grid-based height animation — GPU-friendly, no layout thrash */}
              <div className={`faq-panel ${open === i ? 'faq-open' : ''}`}>
                <div>
                  <div className="px-5 pb-4">
                    <p className="text-sm text-chako-dark/60 leading-relaxed">{a}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
