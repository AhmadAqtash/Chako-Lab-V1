'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const EASE = 'cubic-bezier(0.23,1,0.32,1)';

export default function BrandValues() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { setRevealed(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const VALUES = [
    { icon: '◎', title: t('promise_1_title'), description: t('promise_1_desc') },
    { icon: '◈', title: t('promise_2_title'), description: t('promise_2_desc') },
    { icon: '◇', title: t('promise_3_title'), description: t('promise_3_desc') },
    { icon: '◉', title: t('promise_4_title'), description: t('promise_4_desc') },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ backgroundImage: "url('/brand-banner.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div
          className="text-center mb-12"
          style={{
            opacity: revealed ? 1 : 0,
            transform: revealed ? 'translateY(0)' : 'translateY(20px)',
            transition: `opacity 600ms ${EASE}, transform 600ms ${EASE}`,
          }}
        >
          <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-2">{t('promise_label')}</p>
          <h2 className="text-fluid-heading font-bold text-white">{t('promise_heading')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ icon, title, description }, i) => (
            <div
              key={icon}
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity 600ms ${EASE} ${i * 100}ms, transform 600ms ${EASE} ${i * 100}ms`,
              }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-3 transition-[background-color,box-shadow] duration-300 hover:bg-white/15 hover:shadow-lg">
                <span className="text-3xl text-white">{icon}</span>
                <h3 className="font-semibold text-base text-white">{title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
