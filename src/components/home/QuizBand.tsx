'use client';

import Image from 'next/image';
import Link from '@/components/ui/LocalizedLink';
import { useLanguage } from '@/context/LanguageContext';
import Reveal from '@/components/ui/Reveal';
import { ArrowRight, ArrowLeft } from 'lucide-react';

// Real product shots — the "too many options" made literal. Decorative only
// (the products rotate with the catalogue; nothing links to them), and
// deliberately NOT one-per-series: a literal count would go stale with every
// launch. Each carries its own resting tilt via --tilt, and the hop keyframes
// flip that tilt mid-air so the wave reads as a wobble, not a lift.
const PRODUCT_SHOTS = [
  { src: '/quiz/product-1.png', tilt: -6 },
  { src: '/quiz/product-2.png', tilt: 4 },
  { src: '/quiz/product-3.png', tilt: -3 },
  { src: '/quiz/product-4.png', tilt: 5 },
  { src: '/quiz/product-5.png', tilt: -5 },
  { src: '/quiz/product-6.png', tilt: 3 },
];

// Rendered via dangerouslySetInnerHTML — NEVER as a <style> text child. React
// SSR entity-escapes ' and " in text children, but <style> is a raw-text
// element so the browser keeps the literal entity and hydration discards the
// whole page's SSR (React #423; this was live on the homepage via the hero).
const bandCss = `
  @keyframes chakoQuizBandFloat {
    0%, 100% { transform: rotate(-8deg) translateY(0); }
    50%      { transform: rotate(-5deg) translateY(-5px); }
  }
  .chakoQuizBandBadge { animation: chakoQuizBandFloat 3.4s ease-in-out infinite; }

  /* The bottles hop one after another on hover — a little 'pick me' wave.
     Base state holds each bottle's resting tilt; the hop flips it mid-air. */
  .chakoQuizProd { transform: rotate(var(--tilt, 0deg)); }
  @keyframes chakoQuizProdHop {
    0%, 100% { transform: translateY(0) rotate(var(--tilt, 0deg)); }
    40%      { transform: translateY(-9px) rotate(calc(var(--tilt, 0deg) * -1)); }
  }
  .chakoQuizBandCard:hover .chakoQuizProd { animation: chakoQuizProdHop 750ms ease-in-out; }
  ${PRODUCT_SHOTS.map((_, i) => `.chakoQuizBandCard:hover .chakoQuizProd:nth-child(${i + 1}) { animation-delay: ${i * 70}ms; }`).join('\n  ')}

  @media (prefers-reduced-motion: reduce) {
    .chakoQuizBandBadge { animation: none !important; transform: rotate(-8deg); }
    .chakoQuizBandCard .chakoQuizProd { animation: none !important; }
  }
`;

export default function QuizBand() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    // mb-12 not mt-12: the band now OPENS the dark section, spacing pushes
    // down toward the "Why Chako Lab?" heading below it.
    <Reveal variant="up" className="mb-12">
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
            {/* The line-up of contenders — the problem, illustrated */}
            <div className="flex items-end gap-1.5 md:gap-2 mb-4" aria-hidden="true">
              {PRODUCT_SHOTS.map((shot) => (
                <span
                  key={shot.src}
                  className="chakoQuizProd inline-block w-12 h-12 md:w-16 md:h-16"
                  style={{ '--tilt': `${shot.tilt}deg` } as React.CSSProperties}
                >
                  <Image
                    src={shot.src}
                    alt=""
                    width={64}
                    height={64}
                    className="w-full h-full object-contain drop-shadow-md"
                  />
                </span>
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
