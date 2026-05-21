'use client';

import { useLanguage } from '@/context/LanguageContext';

const VALUE_ICONS = ['◎', '◈', '◇', '◉'] as const;

export default function BrandValues() {
  const { t } = useLanguage();

  const VALUES = [
    { icon: '◎', title: t('promise_1_title'), description: t('promise_1_desc') },
    { icon: '◈', title: t('promise_2_title'), description: t('promise_2_desc') },
    { icon: '◇', title: t('promise_3_title'), description: t('promise_3_desc') },
    { icon: '◉', title: t('promise_4_title'), description: t('promise_4_desc') },
  ];

  return (
    <section
      className="relative"
      style={{ backgroundImage: "url('/brand-banner.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-2">{t('promise_label')}</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">{t('promise_heading')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ icon, title, description }) => (
            <div
              key={icon}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-3"
            >
              <span className="text-3xl text-white">{icon}</span>
              <h3 className="font-semibold text-base text-white">{title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
