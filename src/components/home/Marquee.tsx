'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function Marquee() {
  const { t } = useLanguage();
  const text = t('marquee_text');
  const items = text.split('•').map((s) => s.trim()).filter(Boolean);
  const doubled = [...items, ...items];

  return (
    <div className="bg-chako-highlight py-3.5 overflow-hidden border-y border-[#F0C89E]">
      <div className="flex animate-marquee gap-6 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="text-chako-dark font-semibold text-sm tracking-wide flex-shrink-0">
            ✦ {item}
          </span>
        ))}
      </div>
    </div>
  );
}
