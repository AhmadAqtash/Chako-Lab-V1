'use client';

import Link from '@/components/ui/LocalizedLink';
import { useLanguage } from '@/context/LanguageContext';
import Reveal from '@/components/ui/Reveal';
import { ArrowRight, ArrowLeft } from 'lucide-react';

// The three routes match Q1's option ids exactly — QuizStarter validates the
// value against Q1 before trusting it, so a bad link degrades to a normal start.
const ROUTES = [
  { id: 'me', key: 'quiz_band_me', bg: 'bg-chako-linlin', hover: 'hover:bg-chako-linlin' },
  { id: 'kid', key: 'quiz_band_kid', bg: 'bg-chako-bobo', hover: 'hover:bg-chako-bobo' },
  { id: 'gift', key: 'quiz_band_gift', bg: 'bg-chako-pangpang', hover: 'hover:bg-chako-pangpang' },
] as const;

const bandCss = `
  @keyframes chakoQuizBandFloat {
    0%, 100% { transform: rotate(-8deg) translateY(0); }
    50%      { transform: rotate(-5deg) translateY(-5px); }
  }
  .chakoQuizBandBadge { animation: chakoQuizBandFloat 3.4s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) {
    .chakoQuizBandBadge { animation: none !important; transform: rotate(-8deg); }
  }
`;

export default function QuizBand() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <Reveal variant="up" delay={200} className="mt-12">
      <style>{bandCss}</style>

      {/* Cream band inside the dark section — the contrast is the point, it
          reads as a physical card dropped onto the page. */}
      <div className="relative rounded-3xl bg-chako-cream border-2 border-chako-ink shadow-[8px_8px_0_0_rgba(255,255,255,0.18)] px-6 py-8 md:px-10 md:py-10 overflow-hidden">
        {/* Floating sticker badge */}
        <span className="chakoQuizBandBadge absolute top-4 end-4 md:top-6 md:end-8 bg-chako-ink text-chako-cream text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg select-none">
          {t('quiz_band_badge')}
        </span>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          {/* Pitch */}
          <div className="max-w-md">
            <p className="text-[11px] font-sans font-bold uppercase tracking-widest text-chako-ink/40 mb-2">
              {t('quiz_band_label')}
            </p>
            <h3 className="text-heading font-display font-bold leading-none mb-3">
              {t('quiz_band_title')}
            </h3>
            <p className="text-sm text-chako-ink/60 leading-relaxed">{t('quiz_band_sub')}</p>
          </div>

          {/* Question 1, asked right here. Answering it deep-links into the quiz
              already one step in — a quiz this long lives or dies on how cheap
              the first step feels. */}
          <div className="lg:min-w-[340px]">
            <p className="text-sm font-semibold text-chako-ink mb-3">{t('quiz_band_who')}</p>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5">
              {ROUTES.map((route) => (
                <Link
                  key={route.id}
                  href={`/quiz?start=${route.id}`}
                  className={`group flex-1 flex items-center justify-between gap-3 bg-white ${route.hover}
                    border-2 border-chako-ink rounded-2xl px-5 py-3.5 min-h-[52px] touch-manipulation
                    shadow-[3px_3px_0_0_#1a1a1a] hover:shadow-[5px_5px_0_0_#1a1a1a]
                    hover:-translate-y-0.5 active:translate-y-0 active:shadow-[2px_2px_0_0_#1a1a1a]
                    transition-[transform,box-shadow,background-color] duration-150`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-3.5 h-3.5 rounded-full ${route.bg} border-2 border-chako-ink flex-none`} />
                    <span className="font-semibold text-[15px] text-chako-ink">{t(route.key)}</span>
                  </span>
                  <Arrow
                    size={15}
                    className="text-chako-ink/30 group-hover:text-chako-ink transition-colors"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
