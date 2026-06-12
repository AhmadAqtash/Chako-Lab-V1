'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from '@/components/ui/LocalizedLink';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { SLIDES } from './slides';

const AUTOPLAY_MS = 6000; // per-slide dwell — drives both the interval and the dot progress bar
const TRANSITION_MS = 1100; // candy circle reveal duration
const CTA_SWAP_MS = 350; // pill label swap duration
const CTA_DELAY_MS = 200; // label swap starts once the banner reveal is underway
const DIM_DELAY_MS = 250; // outgoing slide starts dimming once the droplet has begun blooming

/**
 * Injected once alongside the component. The incoming slide blooms open
 * through an expanding circular clip-path mask (a droplet at 50% / 42%) —
 * symmetric in LTR and RTL, so no direction logic touches the banner.
 * Only clip-path animates on the entering layer; the outgoing slide moves
 * with transform/opacity only (subtle recede + delayed dim overlay).
 * Restarts are guaranteed without remounting slides because a slide's
 * animation-name always changes between states (enter <-> exit <-> none).
 */
const heroCss = `
  @keyframes chakoHeroCircleIn {
    from { clip-path: circle(0% at 50% 42%); }
    to   { clip-path: circle(135% at 50% 42%); }
  }
  @keyframes chakoHeroRecede {
    from { transform: scale(1); }
    to   { transform: scale(0.97); }
  }
  @keyframes chakoHeroDim {
    from { opacity: 0; }
    to   { opacity: 0.12; }
  }
  .chakoHeroEnter { animation: chakoHeroCircleIn ${TRANSITION_MS}ms var(--ease-in-out-strong) both; }
  /* will-change only while the reveal is in flight (class added/removed in JS) */
  .chakoHeroRevealing { will-change: clip-path; }
  .chakoHeroExit { animation: chakoHeroRecede ${TRANSITION_MS}ms var(--ease-in-out-strong) both; }
  /* Delayed dim on the outgoing slide so it falls back into shadow under the droplet */
  .chakoHeroExit::after {
    content: '';
    position: absolute;
    inset: 0;
    background: #000;
    opacity: 0;
    pointer-events: none;
    animation: chakoHeroDim ${TRANSITION_MS - DIM_DELAY_MS}ms var(--ease-in-out-strong) ${DIM_DELAY_MS}ms both;
  }

  /* CTA pill — labels swap vertically inside an overflow mask; the mask's
     width is measured in JS and transitions between labels. The hidden ghost
     keeps the pill's intrinsic size correct before first measurement (SSR). */
  .chakoHeroCtaMask {
    position: relative;
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    transition: width ${CTA_SWAP_MS}ms var(--ease-in-out-strong) ${CTA_DELAY_MS}ms;
    /* Escape valve so Arabic deep-bowl finals (qaf in تسوق) aren't shaved */
    padding-block: 0.1em;
    margin-block: -0.1em;
  }
  .chakoHeroCtaGhost {
    display: inline-block;
    visibility: hidden;
    white-space: nowrap;
  }
  .chakoHeroCtaLabel {
    position: absolute;
    inset-inline-start: 0;
    inset-block: 0;
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
  }
  @keyframes chakoHeroCtaRise {
    from { transform: translateY(110%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes chakoHeroCtaUp {
    from { transform: translateY(0);     opacity: 1; }
    to   { transform: translateY(-110%); opacity: 0; }
  }
  .chakoHeroCtaIn  { animation: chakoHeroCtaRise ${CTA_SWAP_MS}ms var(--ease-in-out-strong) ${CTA_DELAY_MS}ms both; }
  .chakoHeroCtaOut { animation: chakoHeroCtaUp   ${CTA_SWAP_MS}ms var(--ease-in-out-strong) ${CTA_DELAY_MS}ms both; }

  /* Active-dot progress bar. Duration is set inline from AUTOPLAY_MS so the
     fill and the autoplay interval can never drift apart. */
  @keyframes chakoHeroProgress {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  .chakoHeroProgressFill {
    animation-name: chakoHeroProgress;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
    transform-origin: left center;
    transform: scaleX(0);
  }
  [dir='rtl'] .chakoHeroProgressFill { transform-origin: right center; }
  .chakoHeroProgressPaused { animation-play-state: paused; }

  @media (prefers-reduced-motion: reduce) {
    .chakoHeroEnter,
    .chakoHeroExit,
    .chakoHeroExit::after,
    .chakoHeroCtaIn,
    .chakoHeroCtaOut {
      animation: none !important; /* slides + labels swap instantly, always visible */
    }
    .chakoHeroEnter { clip-path: none !important; } /* instant swap, no mask */
    .chakoHeroRevealing { will-change: auto; }
    .chakoHeroCtaOut { opacity: 0; } /* outgoing label vanishes instead of sliding */
    .chakoHeroCtaMask { transition: none; } /* width snaps to the new label */
    .chakoHeroProgressFill {
      animation: none !important;
      transform: none; /* static filled bar still marks the active slide */
    }
  }
`;

export default function HeroSlideshow() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  // Bumps on every navigation — keys the CTA label spans so their animations restart.
  const [navCount, setNavCount] = useState(0);
  // Bumps when autoplay resumes — restarts the progress bar in sync with the fresh interval.
  const [cycle, setCycle] = useState(0);
  // Measured width of the current CTA label (px); null until first client measurement.
  const [maskWidth, setMaskWidth] = useState<number | null>(null);

  // Logical direction (1 = forward). Kept for the swipe/nav API — the circle
  // reveal itself is symmetric and never reads it.
  const dirRef = useRef<1 | -1>(1);
  const wasPaused = useRef(false);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  // Touch has no mouseleave: autoplay resumes via timer instead. Hover-pause
  // is gated to real hover devices so emulated mouse events can't stick it.
  const hoverCapable = useRef(false);
  const resumeTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    hoverCapable.current = window.matchMedia('(hover: hover)').matches;
    return () => {
      if (resumeTimer.current !== undefined) window.clearTimeout(resumeTimer.current);
    };
  }, []);

  const goTo = useCallback(
    (idx: number, dir: 1 | -1) => {
      const next = (idx + SLIDES.length) % SLIDES.length;
      if (next === current) return;
      dirRef.current = dir;
      setExiting(current);
      setCurrent(next);
      setNavCount((c) => c + 1);
    },
    [current],
  );

  const advance = useCallback(() => goTo(current + 1, 1), [current, goTo]);
  const handlePrev = () => { setPaused(true); goTo(current - 1, -1); };
  const handleNext = () => { setPaused(true); goTo(current + 1, 1); };
  const handleDot = (i: number) => { setPaused(true); goTo(i, i > current ? 1 : -1); };

  // Autoplay — the effect re-runs per slide, so each slide gets a full dwell.
  useEffect(() => {
    if (paused) return;
    const id = setInterval(advance, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [advance, paused]);

  // When autoplay resumes, the interval restarts at a full AUTOPLAY_MS —
  // restart the progress bar too so the two stay in lockstep.
  useEffect(() => {
    if (wasPaused.current && !paused) setCycle((c) => c + 1);
    wasPaused.current = paused;
  }, [paused]);

  // Demote the outgoing slide once the incoming reveal has fully covered it.
  useEffect(() => {
    if (exiting === null) return;
    const t = setTimeout(() => setExiting(null), TRANSITION_MS + 50);
    return () => clearTimeout(t);
  }, [exiting, navCount]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    if (resumeTimer.current !== undefined) window.clearTimeout(resumeTimer.current);
    setPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    const deltaY = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
      deltaX > 0
        ? (isAr ? handlePrev() : handleNext())
        : (isAr ? handleNext() : handlePrev());
    }
    // Resume autoplay after a touch-idle window (touch never gets mouseleave)
    resumeTimer.current = window.setTimeout(() => setPaused(false), 5000);
  };

  const slide = SLIDES[current];
  const ctaLabel = isAr ? slide.ctaAr : slide.ctaEn;
  const exitingLabel =
    exiting !== null ? (isAr ? SLIDES[exiting].ctaAr : SLIDES[exiting].ctaEn) : null;
  const hasNavigated = navCount > 0;

  // Measure the new label so the pill's width animates between labels.
  useEffect(() => {
    if (ghostRef.current) setMaskWidth(ghostRef.current.offsetWidth);
  }, [ctaLabel]);

  // Re-measure if the pill's font size changes (md breakpoint / orientation flip).
  useEffect(() => {
    const el = ghostRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setMaskWidth(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The circle reveal is symmetric — no direction or RTL flip on the banner.
  // The reveal is in flight exactly while an outgoing slide is still demoting.
  const revealing = exiting !== null;

  return (
    <section
      className="relative overflow-hidden bg-chako-ink aspect-[1122/1402] md:aspect-auto md:min-h-[85vh] flex flex-col"
      onMouseEnter={() => { if (hoverCapable.current) setPaused(true); }}
      onMouseLeave={() => { if (hoverCapable.current) setPaused(false); }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{heroCss}</style>

      {/* All slides stay mounted, stacked. The active slide blooms open over
          the outgoing one, which recedes and dims slightly beneath it. */}
      {SLIDES.map((s, i) => {
        const desktopSrc = isAr ? s.arDesktop : s.enDesktop;
        const mobileSrc = isAr ? s.arMobile : s.enMobile;
        const isActive = i === current;
        const isExiting = i === exiting;
        return (
          <div
            key={i}
            className={`absolute inset-0 ${
              isActive
                ? `z-[2] ${hasNavigated ? 'chakoHeroEnter' : ''} ${revealing ? 'chakoHeroRevealing' : ''}`
                : isExiting
                  ? 'z-[1] chakoHeroExit pointer-events-none'
                  : 'z-0 opacity-0 pointer-events-none'
            }`}
            aria-hidden={!isActive}
          >
            <div className="chakoHeroLayer absolute inset-0">
              {/* Mobile — portrait image, anchor to top */}
              <Image
                src={mobileSrc}
                alt="Chako Lab"
                fill
                priority={i === 0}
                quality={100}
                className="block md:hidden object-cover object-top"
                sizes="(max-width: 767px) 100vw, 0vw"
              />
              {/* Desktop — landscape image, centered */}
              <Image
                src={desktopSrc}
                alt="Chako Lab"
                fill
                priority={i === 0}
                quality={100}
                className="hidden md:block object-cover object-center"
                sizes="(min-width: 768px) 100vw, 0vw"
              />
            </div>
          </div>
        );
      })}

      {/* Bottom gradient — ensures CTA readable over any slide on mobile */}
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/55 to-transparent z-10 md:hidden pointer-events-none" />

      {/* CTA pill — never unmounts. Labels swap vertically inside the mask;
          the pill's width follows the measured label width. */}
      <div className="absolute bottom-20 md:bottom-16 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 z-20 [contain:layout_style]">
        <Link
          href={slide.ctaHref}
          className="inline-flex items-center gap-2 bg-white text-chako-ink font-display font-bold px-7 py-4 rounded-full shadow-xl hover:bg-white/95 hover:shadow-2xl active:scale-[0.96] transition-[transform,background-color,box-shadow] duration-150 motion-reduce:transition-none text-sm md:text-base touch-manipulation whitespace-nowrap"
        >
          <span
            className="chakoHeroCtaMask"
            style={maskWidth !== null ? { width: `${maskWidth}px` } : undefined}
          >
            {/* Invisible in-flow ghost: sizes the mask pre-measurement and is the measuring target */}
            <span ref={ghostRef} className="chakoHeroCtaGhost" aria-hidden="true">
              {ctaLabel}
            </span>
            <span
              key={`in-${navCount}`}
              className={`chakoHeroCtaLabel ${hasNavigated ? 'chakoHeroCtaIn' : ''}`}
            >
              {ctaLabel}
            </span>
            {exitingLabel !== null && (
              <span
                key={`out-${navCount}`}
                className="chakoHeroCtaLabel chakoHeroCtaOut"
                aria-hidden="true"
              >
                {exitingLabel}
              </span>
            )}
          </span>
          <span className="text-chako-orange text-base leading-none">{isAr ? '←' : '→'}</span>
        </Link>
      </div>

      {/* Arrows — desktop only, RTL-aware */}
      <button
        onClick={isAr ? handleNext : handlePrev}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/80 backdrop-blur-sm rounded-full items-center justify-center hover:bg-white transition-colors shadow-md"
        aria-label={isAr ? 'الشريحة التالية' : 'Previous slide'}
      >
        <ChevronLeft size={20} className="text-chako-dark" />
      </button>
      <button
        onClick={isAr ? handlePrev : handleNext}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/80 backdrop-blur-sm rounded-full items-center justify-center hover:bg-white transition-colors shadow-md"
        aria-label={isAr ? 'الشريحة السابقة' : 'Next slide'}
      >
        <ChevronRight size={20} className="text-chako-dark" />
      </button>

      {/* Dot indicators — the active dot is a progress bar that fills across
          the autoplay dwell and holds while paused. */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 z-20 flex items-center">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDot(i)}
            className="p-3 md:p-2.5 touch-manipulation"
            aria-label={isAr ? `الانتقال إلى الشريحة ${i + 1}` : `Go to slide ${i + 1}`}
          >
            <span
              className={`relative block overflow-hidden rounded-full transition-all duration-300 motion-reduce:transition-none ${
                i === current
                  ? 'w-10 h-1.5 md:w-8 md:h-1 bg-white/35 shadow-md'
                  : 'w-3 h-3 md:w-2 md:h-2 bg-white/50 hover:bg-white/80'
              }`}
            >
              {i === current && (
                <span
                  key={`${current}-${cycle}`}
                  className={`chakoHeroProgressFill absolute inset-0 rounded-full bg-white ${
                    paused ? 'chakoHeroProgressPaused' : ''
                  }`}
                  style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
                />
              )}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
