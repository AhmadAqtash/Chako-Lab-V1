'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function Marquee() {
  const { t } = useLanguage();
  const text = t('marquee_text');
  const items = text.split('•').map((s) => s.trim()).filter(Boolean);
  // Double the items for seamless loop: animation moves -50% = exactly one copy width
  const doubled = [...items, ...items];

  return (
    <div className="bg-chako-highlight py-3.5 overflow-hidden border-y border-[#F0C89E] marquee-pause select-none">
      <div className="marquee-track flex animate-marquee gap-8 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="text-chako-dark font-semibold text-sm tracking-wide flex-shrink-0"
          >
            ✦ {item}
          </span>
        ))}
      </div>
    </div>
  );
}
