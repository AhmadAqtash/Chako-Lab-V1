'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center">
      <Image
        src="/hero-banner.jpg"
        alt="Chako Lab drinkware"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-white/20" />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-8 py-24 w-full">
        <div className="max-w-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/chako-lab-logo.png"
            alt="Chako Lab"
            style={{ height: '32px', width: 'auto', marginBottom: '16px' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
            }}
          />
          <span style={{ display: 'none', marginBottom: '16px' }} className="block font-bold text-xl tracking-tight text-chako-dark">CHAKO LAB®</span>
          <p className="text-chako-dark text-sm font-semibold tracking-widest uppercase mb-6">
            {t('hero_label')}
          </p>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6 text-chako-dark">
            {t('hero_heading1')}
            <br />
            <span className="text-chako-dark/70">{t('hero_heading2')}</span>
          </h1>
          <p className="text-chako-dark/60 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
            {t('hero_subtext')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-chako-dark text-chako-bg font-semibold rounded-2xl hover:bg-chako-dark/90 transition-colors text-sm"
            >
              {t('hero_cta_shop')}
            </Link>
            <Link
              href="/collections/linlin-kettles"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-chako-dark/20 text-chako-dark font-semibold rounded-2xl hover:bg-chako-dark/10 transition-colors text-sm"
            >
              {t('hero_cta_kettles')}
            </Link>
          </div>

          <div className="flex gap-8 mt-14">
            {[
              { value: t('hero_stat1_value'), label: t('hero_stat1_label') },
              { value: t('hero_stat2_value'), label: t('hero_stat2_label') },
              { value: t('hero_stat3_value'), label: t('hero_stat3_label') },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-chako-dark">{value}</p>
                <p className="text-xs text-chako-dark/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
