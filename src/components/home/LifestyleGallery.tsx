'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import SectionLabel from '@/components/ui/SectionLabel';

// Editorial lifestyle imagery. Sources are 940px wide, so tiles are kept
// modest (≤ ~768px @2× on desktop) to avoid upscaling — never full-bleed.
// object-cover center-crops the mixed landscape/portrait set cleanly.
const IMAGES = [
  {
    src: '/lifestyle/lifestyle-08.jpg',
    altEn: 'Model carrying a purple polka-dot Chako Lab cup as a crossbody',
    altAr: 'عارضة تحمل كوب تشاكو لاب الأرجواني المنقّط كحقيبة كتف',
  },
  {
    src: '/lifestyle/lifestyle-02.jpg',
    altEn: 'Two Chako Lab tumblers resting in a car cup holder',
    altAr: 'كوبان من تشاكو لاب في حامل أكواب السيارة',
  },
  {
    src: '/lifestyle/lifestyle-06.jpg',
    altEn: 'BoBo cups on a table during a cozy game night',
    altAr: 'أكواب بوبو على الطاولة في أمسية ألعاب دافئة',
  },
  {
    src: '/lifestyle/lifestyle-10.jpg',
    altEn: 'Hung Kettle bottles on a picnic table outdoors',
    altAr: 'زجاجات هانج كيتل على طاولة نزهة في الخارج',
  },
  {
    src: '/lifestyle/lifestyle-04.jpg',
    altEn: 'Chako Lab bottles tucked into a picnic basket on the grass',
    altAr: 'زجاجات تشاكو لاب داخل سلة نزهة على العشب',
  },
  {
    src: '/lifestyle/brand-section-01.jpg',
    altEn: 'Hand holding a yellow Chako Lab tumbler by its handle',
    altAr: 'يد تمسك بكوب تشاكو لاب الأصفر من المقبض',
  },
];

const EASE = 'cubic-bezier(0.23,1,0.32,1)';

export default function LifestyleGallery() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { setRevealed(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-14 md:py-20"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Section header */}
      <div
        className="max-w-screen-xl mx-auto px-4 md:px-8 mb-8 md:mb-12"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'translateY(0)' : 'translateY(20px)',
          transition: `opacity 600ms ${EASE}, transform 600ms ${EASE}`,
        }}
      >
        {/* PLACEHOLDER COPY — edit freely */}
        <SectionLabel className="mb-3">
          {isAr ? 'الحياة مع تشاكو' : 'Life with Chako'}
        </SectionLabel>
        <h2 className="text-heading font-display font-bold">
          {isAr ? 'صُنع لكل لحظة' : 'Made for every moment'}
        </h2>
        <p className="text-body text-chako-ink/55 max-w-md mt-3">
          {isAr
            ? 'من زحمة الصباح إلى نزهة العصر — منتجات تشاكو لاب ترافقك أينما ذهب يومك.'
            : 'From the morning commute to the afternoon picnic — Chako Lab drinkware goes wherever your day does.'}
        </p>
      </div>

      {/* Editorial grid: 2-col on mobile, 3-col on desktop. Uniform square
          tiles keep every image well under its 940px source (no upscaling). */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {IMAGES.map((img, i) => (
            <div
              key={img.src}
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 600ms ${EASE} ${i * 60}ms, transform 600ms ${EASE} ${i * 60}ms`,
              }}
            >
              <div className="group relative aspect-square overflow-hidden rounded-2xl bg-chako-accent">
                <Image
                  src={img.src}
                  alt={isAr ? img.altAr : img.altEn}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
