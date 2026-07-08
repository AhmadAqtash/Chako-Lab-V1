'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/Badge';
import Reveal from '@/components/ui/Reveal';

const VALUE_ACCENTS = [
  'text-chako-linlin',
  'text-chako-titanium',
  'text-chako-pangpang',
  'text-chako-bobo',
];

export default function BrandValues() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const VALUES = [
    { title: t('promise_1_title'), description: t('promise_1_desc'), accent: VALUE_ACCENTS[0] },
    { title: t('promise_2_title'), description: t('promise_2_desc'), accent: VALUE_ACCENTS[1] },
    { title: t('promise_3_title'), description: t('promise_3_desc'), accent: VALUE_ACCENTS[2] },
    { title: t('promise_4_title'), description: t('promise_4_desc'), accent: VALUE_ACCENTS[3] },
  ];

  return (
    <section
      className="bg-chako-ink py-16 md:py-24"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">

        {/* Award badges + heading */}
        <Reveal variant="up">
          {/* Award stickers */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Badge label="RED DOT WINNER 2024" color="linlin" variant="sticker" rotate />
            <Badge label="iF DESIGN AWARD 2023" color="titanium" variant="pill" />
            <Badge label="BPA FREE" color="bobo" variant="pill" />
            <Badge label="SUS 316 STEEL" color="soft-titanium" variant="default" />
          </div>

          {/* Heading */}
          <h2 className="text-display font-display font-bold text-white mb-4 leading-none">
            {isAr ? 'لماذا' : 'Why'}
            <br />
            <span className="text-chako-linlin">
              {isAr ? 'شاكو لاب؟' : 'Chako Lab?'}
            </span>
          </h2>

          <p className="text-white/50 text-body max-w-md mb-12">
            {isAr
              ? 'أدوات الشرب المميزة المصنوعة لتدوم، مصممة لتسعد.'
              : 'Premium drinkware built to last, designed to delight.'}
          </p>
        </Reveal>

        {/* Value cards */}
        <Reveal stagger={80} delay={80} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VALUES.map(({ title, description, accent }, i) => (
            <div key={title}>
              <div className="h-full bg-white/[0.07] hover:bg-white/[0.11] rounded-2xl p-6 flex flex-col gap-3 transition-colors duration-300 border border-white/[0.08]">
                <span className={`text-2xl leading-none font-display font-bold ${accent}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display font-bold text-subheading text-white leading-tight">
                  {title}
                </h3>
                <p className="text-sm text-white/55 leading-relaxed flex-1">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </Reveal>

        {/* Material callout strip */}
        <Reveal
          variant="fade"
          delay={400}
          className="mt-10 pt-8 border-t border-white/[0.1] flex flex-wrap gap-x-8 gap-y-2"
        >
          {[
            isAr ? 'فولاذ SUS 316' : 'SUS 316 Steel',
            isAr ? 'خالٍ من BPA' : 'BPA-Free Tritan',
            isAr ? 'عازل بجدارين' : 'Double-Wall Vacuum',
            isAr ? 'ضمان 1 سنة' : '1-Year Warranty',
          ].map((item) => (
            <span key={item} className="text-[11px] font-sans font-semibold text-white/30 uppercase tracking-widest">
              {item}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
