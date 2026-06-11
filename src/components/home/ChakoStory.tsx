'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from '@/components/ui/LocalizedLink';
import { useLanguage } from '@/context/LanguageContext';
import styles from './ChakoStory.module.css';

/**
 * Duyu-style pinned product film, scrubbed by scroll.
 *
 * A 430svh runway pins a 100svh stage; scroll progress through the runway
 * maps to a frame index drawn on a square canvas (the rendered packing film:
 * tumbler spin -> into retail box -> box closes -> into gift crate).
 * Copy beats [01]-[04] fade per scroll segment. No animation libraries.
 */

const FRAME_COUNT = 120; // chako-story frame pipeline writes exactly this many per size
const framePath = (size: 'm' | 'd', i: number) =>
  `/story/frames/${size}/f-${String(i + 1).padStart(3, '0')}.webp`;
const POSTER = '/story/poster.webp';

interface Beat {
  id: string;
  // fraction of scroll progress where this beat is active
  from: number;
  to: number;
  en: { title: string; sub: string };
  ar: { title: string; sub: string };
}

const BEATS: Beat[] = [
  {
    id: '01',
    from: 0.02,
    to: 0.27,
    en: { title: 'Meet BaWang.', sub: 'Your 40oz everyday companion — insulated, playful, built for the long sip.' },
    ar: { title: 'تعرّف على باوانج.', sub: 'رفيقك اليومي بسعة ٤٠ أونصة — معزول، مرح، وصُنع للرشفة الطويلة.' },
  },
  {
    id: '02',
    from: 0.27,
    to: 0.52,
    en: { title: 'Boxed with personality.', sub: 'Every Chako piece ships in artwork you’ll want to keep.' },
    ar: { title: 'تغليف بشخصية مرحة.', sub: 'كل قطعة من تشاكو تصلك في عبوة فنية تستحق الاحتفاظ بها.' },
  },
  {
    id: '03',
    from: 0.52,
    to: 0.76,
    en: { title: 'Sealed with care.', sub: 'Folded, tucked and protected for the ride.' },
    ar: { title: 'مغلقة بعناية.', sub: 'مطوية ومحمية تمامًا للطريق.' },
  },
  {
    id: '04',
    from: 0.76,
    to: 1.01,
    en: { title: 'Gift-ready. UAE-wide.', sub: 'From our lab to your door — or straight to someone you love.' },
    ar: { title: 'جاهزة للإهداء، في كل الإمارات.', sub: 'من مختبرنا إلى بابك — أو مباشرة إلى من تحب.' },
  },
];

const CTA = {
  en: 'Shop BaWang',
  ar: 'تسوق باوانج',
  href: '/collections/bawang-cups',
};

export default function ChakoStory() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const wrapperRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const loadedRef = useRef<boolean[]>([]);
  const drawnFrameRef = useRef(-1);
  const rafRef = useRef(0);
  const startedRef = useRef(false);

  const [activeBeat, setActiveBeat] = useState(-1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [posterHidden, setPosterHidden] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
      return;
    }

    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const size: 'm' | 'd' = isDesktop ? 'd' : 'm';

    // ── Progressive loader: coarse pass (every 5th frame) lets scrubbing
    //    work almost immediately; second pass fills the gaps. ≤6 in flight.
    const order: number[] = [];
    for (let i = 0; i < FRAME_COUNT; i += 5) order.push(i);
    for (let i = 0; i < FRAME_COUNT; i++) if (i % 5 !== 0) order.push(i);

    let cursor = 0;
    let inFlight = 0;
    const pump = () => {
      while (inFlight < 6 && cursor < order.length) {
        const idx = order[cursor++];
        const img = new window.Image();
        inFlight++;
        img.onload = () => {
          loadedRef.current[idx] = true;
          inFlight--;
          // Repaint if the freshly loaded frame is the one we're parked on
          if (nearestLoaded(targetFrame()) === idx) scheduleDraw();
          pump();
        };
        img.onerror = () => {
          inFlight--;
          pump();
        };
        img.src = framePath(size, idx);
        imagesRef.current[idx] = img;
      }
    };

    const startLoading = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      pump();
    };

    // Begin fetching one viewport before the section arrives
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          startLoading();
          io.disconnect();
        }
      },
      { rootMargin: '100% 0%' }
    );
    io.observe(wrapper);

    // ── Canvas sizing (square, DPR-capped) ──
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const fitCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const px = Math.round(rect.width * dpr);
      if (canvas.width !== px) {
        canvas.width = px;
        canvas.height = px;
        drawnFrameRef.current = -1; // force repaint at new size
        scheduleDraw();
      }
    };
    const ro = new ResizeObserver(fitCanvas);
    ro.observe(canvas);

    // ── Scroll → frame ──
    const progress = () => {
      const rect = wrapper.getBoundingClientRect();
      const runway = rect.height - window.innerHeight;
      if (runway <= 0) return 0;
      return Math.min(1, Math.max(0, -rect.top / runway));
    };
    const targetFrame = () => Math.round(progress() * (FRAME_COUNT - 1));
    const nearestLoaded = (want: number) => {
      if (loadedRef.current[want]) return want;
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (loadedRef.current[want - d]) return want - d;
        if (loadedRef.current[want + d]) return want + d;
      }
      return -1;
    };

    let beatMemo = -1;
    const draw = () => {
      rafRef.current = 0;
      const p = progress();

      // Beat visibility (cheap state change only when the segment flips)
      let beat = -1;
      for (let i = 0; i < BEATS.length; i++) {
        if (p >= BEATS[i].from && p < BEATS[i].to) { beat = i; break; }
      }
      if (beat !== beatMemo) {
        beatMemo = beat;
        setActiveBeat(beat);
      }

      const frame = nearestLoaded(targetFrame());
      if (frame < 0 || frame === drawnFrameRef.current) return;
      const img = imagesRef.current[frame];
      if (!img || !img.complete || !img.naturalWidth) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawnFrameRef.current = frame;
      setPosterHidden(true);
    };
    const scheduleDraw = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(draw);
    };

    window.addEventListener('scroll', scheduleDraw, { passive: true });
    window.addEventListener('resize', scheduleDraw, { passive: true });
    scheduleDraw();

    return () => {
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('scroll', scheduleDraw);
      window.removeEventListener('resize', scheduleDraw);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Reduced motion: a calm static section instead of the pinned film ──
  if (reducedMotion) {
    const beat = BEATS[BEATS.length - 1];
    return (
      <section className="bg-chako-cream px-6 py-16 flex flex-col items-center text-center gap-6">
        <Image src={POSTER} alt="" width={720} height={720} className="w-full max-w-md h-auto" />
        <h2 className="font-display text-heading text-chako-ink">{isAr ? beat.ar.title : beat.en.title}</h2>
        <p className="text-body text-chako-ink/70 max-w-md">{isAr ? beat.ar.sub : beat.en.sub}</p>
        <Link
          href={CTA.href}
          className="inline-flex items-center gap-2 bg-chako-ink text-chako-cream font-display font-semibold px-7 py-3.5 rounded-full"
        >
          {isAr ? CTA.ar : CTA.en}
        </Link>
      </section>
    );
  }

  return (
    <section ref={wrapperRef} className={styles.wrapper} aria-label={isAr ? 'قصة التغليف' : 'Packaging story'}>
      <div className={styles.stage}>
        <div className={styles.canvasBox}>
          {/* Poster keeps the stage filled until the first frame paints */}
          <Image
            src={POSTER}
            alt=""
            fill
            sizes="(min-width: 768px) 60vw, 100vw"
            className={styles.poster}
            style={{ opacity: posterHidden ? 0 : 1 }}
          />
          <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        </div>

        <div className={styles.beats}>
          {BEATS.map((b, i) => {
            const copy = isAr ? b.ar : b.en;
            return (
              <div key={b.id} className={`${styles.beat} ${i === activeBeat ? styles.beatActive : ''}`}>
                <span className={`${styles.index} font-display text-chako-ink`}>[{b.id}]</span>
                <h3 className="font-display text-subheading font-semibold text-chako-ink">{copy.title}</h3>
                <p className="text-sm leading-relaxed text-chako-ink/70 max-w-xs">{copy.sub}</p>
                {i === BEATS.length - 1 && (
                  <Link
                    href={CTA.href}
                    className={`${styles.cta} mt-3 inline-flex items-center gap-2 bg-chako-ink text-chako-cream font-display font-semibold px-7 py-3.5 rounded-full active:scale-[0.96] transition-transform`}
                  >
                    {isAr ? CTA.ar : CTA.en}
                    <span aria-hidden="true">{isAr ? '←' : '→'}</span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
