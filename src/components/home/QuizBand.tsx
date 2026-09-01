'use client';

import Link from '@/components/ui/LocalizedLink';
import { useLanguage } from '@/context/LanguageContext';
import Reveal from '@/components/ui/Reveal';
import { ArrowRight, ArrowLeft } from 'lucide-react';

// A handful of series colours — the "too many options" made visual. Purely
// decorative and deliberately NOT one-per-series (the range is ten series and
// growing; a literal count would go stale with every launch).
const SERIES_DOTS = [
  'bg-chako-linlin',
  'bg-chako-bawang',
  'bg-chako-bobo',
  'bg-chako-milkpod',
  'bg-chako-kada',
  'bg-chako-pangpang',
  'bg-chako-titanium',
];

const bandCss = `
  @keyframes chakoQuizBandFloat {
    0%, 100% { transform: rotate(-8deg) translateY(0); }
    50%      { transform: rotate(-5deg) translateY(-5px); }
  }
  .chakoQuizBandBadge { animation: chakoQuizBandFloat 3.4s ease-in-out infinite; }

  /* The dots bounce one after another on hover — a tiny "pick me" wave. */
  @keyframes chakoQuizDotHop {
    0%, 100% { transform: translateY(0); }
    40%      { transform: translateY(-7px); }
  }
  .chakoQuizBandCard:hover .chakoQuizDot { animation: chakoQuizDotHop 700ms ease-in-out; }
  ${SERIES_DOTS.map((_, i) => `.chakoQuizBandCard:hover .chakoQuizDot:nth-child(${i + 1}) { animation-delay: ${i * 60}ms; }`).join('\n  ')}

  @media (prefers-reduced-motion: reduce) {
    .chakoQuizBandBadge { animation: none !important; transform: rotate(-8deg); }
    .chakoQuizBandCard .chakoQuizDot { animation: none !important; }
  }
`;

export default function QuizBand() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <Reveal variant="up" delay={200} className="mt-12">
      <style dangerouslySetInnerHTML={{ __html: bandCss }} />

      {/* Cream card inside the dark section — the whole band is ONE link to the
          test page, so anywhere you tap goes there. */}
      <Link
        href="/quiz"
        className="chakoQuizBandCard group relative block rounded-3xl bg-chako-cream border-2 border-chako-ink shadow-[8px_8px_0_0_rgba(255,255,255,0.18)] px-6 py-8 md:px-10 md:py-10 overflow-hidden transition-transform duration-200 hover:-translate-y-1"
      >
        {/* Floating sticker badge */}
        <span className="chakoQuizBandBadge absolute top-4 end-4 md:top-6 md:end-8 bg-chako-ink text-chako-cream text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg select-none">
          {t('quiz_band_badge')}
        </span>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-lg">
            {/* One dot per series — the problem, illustrated */}
            <div className="flex gap-2 mb-4">
              {SERIES_DOTS.map((dot) => (
                <span
                  key={dot}
                  className={`chakoQuizDot w-4 h-4 rounded-full border-2 border-chako-ink ${dot}`}
                />
              ))}
            </div>

            <p className="text-[11px] font-sans font-bold uppercase tracking-widest text-chako-ink/40 mb-2">
              {t('quiz_band_label')}
            </p>
            <h3 className="text-heading font-display font-bold leading-none mb-3">
              {t('quiz_band_title')}
            </h3>
            <p className="text-sm text-chako-ink/60 leading-relaxed">{t('quiz_band_sub')}</p>
          </div>

          {/* The CTA — visually a button, functionally decoration on the link */}
          <span
            className="flex-none inline-flex items-center justify-center gap-2 bg-chako-ink text-chako-cream
              border-2 border-chako-ink rounded-2xl px-8 py-4 min-h-[56px] font-display font-bold text-base
              shadow-[4px_4px_0_0_rgba(26,26,26,0.25)] transition-transform duration-150
              group-hover:-translate-y-0.5 group-active:translate-y-0"
          >
            {t('quiz_band_cta')}
            <Arrow
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
            />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
