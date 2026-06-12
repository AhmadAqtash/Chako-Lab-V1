'use client';

import { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react';

type Variant = 'up' | 'fade' | 'scale';
type Phase = 'idle' | 'armed' | 'in' | 'done';

interface Props {
  children: ReactNode;
  /** 'up' = fade + rise (default) · 'fade' = opacity only · 'scale' = fade + settle from 96% */
  variant?: Variant;
  /** Extra delay (ms) before the reveal starts */
  delay?: number;
  /** When > 0, direct children reveal one-by-one, `stagger` ms apart (instead of the wrapper) */
  stagger?: number;
  className?: string;
}

const DURATION = 700;
const STYLE_ID = 'chako-reveal-css';

/**
 * Injected into <head> on the client the first time a Reveal arms.
 * Without JS this stylesheet never exists and no data attributes are set,
 * so server-rendered content can never be stuck invisible.
 * Wrapped in prefers-reduced-motion: no-preference as a second guard on
 * top of the matchMedia check in the effect.
 */
const REVEAL_CSS = `
@media (prefers-reduced-motion: no-preference) {
  /* Transitions live ONLY on the 'in' state: arming must hide instantly,
     never fade content out (fast scrollers could catch that fade). */
  [data-rv='in']:not([data-rv-stagger]) {
    transition:
      opacity ${DURATION}ms var(--ease-out-strong) var(--rv-delay, 0ms),
      transform ${DURATION}ms var(--ease-out-strong) var(--rv-delay, 0ms);
  }
  [data-rv='in'][data-rv-stagger] > * {
    transition:
      opacity ${DURATION}ms var(--ease-out-strong),
      transform ${DURATION}ms var(--ease-out-strong);
    transition-delay: calc(var(--rv-delay, 0ms) + var(--rv-i, 0) * var(--rv-stagger, 0ms));
  }
  [data-rv='armed'][data-rv-variant='up']:not([data-rv-stagger]),
  [data-rv='armed'][data-rv-variant='up'][data-rv-stagger] > * {
    opacity: 0;
    transform: translateY(1.25rem);
  }
  [data-rv='armed'][data-rv-variant='fade']:not([data-rv-stagger]),
  [data-rv='armed'][data-rv-variant='fade'][data-rv-stagger] > * {
    opacity: 0;
  }
  [data-rv='armed'][data-rv-variant='scale']:not([data-rv-stagger]),
  [data-rv='armed'][data-rv-variant='scale'][data-rv-stagger] > * {
    opacity: 0;
    transform: scale(0.96);
  }
}
`;

function injectStylesOnce() {
  if (document.getElementById(STYLE_ID)) return;
  const tag = document.createElement('style');
  tag.id = STYLE_ID;
  tag.textContent = REVEAL_CSS;
  document.head.appendChild(tag);
}

export default function Reveal({
  children,
  variant = 'up',
  delay = 0,
  stagger = 0,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // idle  → SSR / not armed: fully visible, no styles
  // armed → JS took over: hidden, waiting to scroll into view
  // in    → transitioning to visible
  // done  → settled: all reveal attributes removed again
  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') return; // stays visible
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // static, no animation
    // Already on screen at mount (above the fold) → never hide it
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    injectStylesOnce();

    // Index direct children for the staggered transition-delay custom property
    if (stagger > 0) {
      Array.from(el.children).forEach((child, i) => {
        (child as HTMLElement).style.setProperty('--rv-i', String(i));
      });
    }

    let doneTimer: number | undefined;
    setPhase('armed');

    // Very tall blocks (taller than ~5x viewport) can never hit a fixed 0.18
    // ratio — cap the threshold so the reveal always fires.
    const threshold = Math.min(
      0.18,
      (window.innerHeight * 0.6) / Math.max(el.offsetHeight, 1)
    );

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        setPhase('in');
        // Once settled, drop every reveal attribute so children get their own
        // hover transitions etc. back, untouched.
        const count = stagger > 0 ? Math.max(el.children.length, 1) : 1;
        doneTimer = window.setTimeout(
          () => setPhase('done'),
          delay + DURATION + (count - 1) * stagger + 100
        );
      },
      { threshold }
    );
    obs.observe(el);

    return () => {
      obs.disconnect();
      if (doneTimer !== undefined) window.clearTimeout(doneTimer);
    };
  }, [delay, stagger]);

  const active = phase === 'armed' || phase === 'in';
  const style = active
    ? ({
        '--rv-delay': `${delay}ms`,
        ...(stagger > 0 ? { '--rv-stagger': `${stagger}ms` } : undefined),
      } as CSSProperties)
    : undefined;

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      data-rv={active ? phase : undefined}
      data-rv-variant={active ? variant : undefined}
      data-rv-stagger={active && stagger > 0 ? '' : undefined}
    >
      {children}
    </div>
  );
}
