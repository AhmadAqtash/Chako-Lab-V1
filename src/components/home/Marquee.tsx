'use client';

import { useLanguage } from '@/context/LanguageContext';

const BRAND_CLAIMS = [
  '10+ PRODUCT LINES',
  'BASED IN THE UAE',
  '100% QUALITY ASSURED',
  'RED DOT WINNER 2024',
  'iF DESIGN AWARD 2023',
  'BPA FREE',
  'SUS 316 STEEL',
  'FREE SHIPPING OVER AED 250',
  'OFFICIAL UAE DISTRIBUTOR',
  'AUTHENTIC CHAKO LAB',
];

export default function Marquee() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const translatedText = t('marquee_text');
  const translatedItems = translatedText.split('•').map((s) => s.trim()).filter(Boolean);
  const items = isAr
    ? [...translatedItems, ...BRAND_CLAIMS]
    : [...BRAND_CLAIMS, ...translatedItems];

  const doubled = [...items, ...items];

  return (
    <div className="bg-chako-ink overflow-hidden select-none marquee-pause" aria-hidden="true">
      <div className="marquee-track flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 px-7 py-5 flex-shrink-0 border-r border-white/[0.08]"
          >
            <span className="text-chako-linlin text-base leading-none">✦</span>
            <span className="font-display font-bold text-white text-[13px] md:text-sm uppercase tracking-[0.12em]">
              {item}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
