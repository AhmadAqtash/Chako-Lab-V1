'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './StatementOpener.module.css';

const COPY = {
  en: {
    // [text, accent?] — accent words render in chako-orange
    words: [
      ['Drinkware'],
      ['with'],
      ['personality,', 'accent'],
      ['made'],
      ['for'],
      ['your'],
      ['daily'],
      ['ritual.'],
    ] as [string, string?][],
    sub: 'Thoughtfully designed. Joyfully colored. Delivered across the UAE.',
    cue: 'Scroll',
  },
  ar: {
    words: [
      ['أدوات'],
      ['شرب'],
      ['بشخصية', 'accent'],
      ['مرحة،'],
      ['صُنعت'],
      ['لطقوسك'],
      ['اليومية.'],
    ] as [string, string?][],
    sub: 'تصميم مدروس، ألوان مبهجة، وتوصيل لجميع أنحاء الإمارات.',
    cue: 'مرر للأسفل',
  },
} as const;

/**
 * Duyu-style statement opener: big display heading whose words cascade in
 * (blur -> sharp) once the preloader curtain finishes, plus a scroll cue
 * pointing at the hero banner below.
 */
export default function StatementOpener() {
  const { language } = useLanguage();
  const copy = COPY[language === 'ar' ? 'ar' : 'en'];
  const sectionRef = useRef<HTMLElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    // Preloader only exists on full page loads; if absent, start at once.
    if (!document.querySelector('[data-chako-preloader]')) {
      setStarted(true);
      return;
    }
    const start = () => setStarted(true);
    window.addEventListener('chako:preloader-done', start, { once: true });
    // Failsafe so the heading can never stay invisible
    const timer = window.setTimeout(start, 3800);
    return () => {
      window.removeEventListener('chako:preloader-done', start);
      clearTimeout(timer);
    };
  }, []);

  const scrollPast = () => {
    const el = sectionRef.current;
    if (!el) return;
    window.scrollTo({ top: el.offsetTop + el.offsetHeight, behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className={`relative flex flex-col items-center justify-center text-center bg-chako-cream min-h-[72svh] md:min-h-[78vh] px-6 py-20 ${started ? styles.started : ''}`}
    >
      <h1 className="font-display text-display-hero text-chako-ink max-w-[14ch]">
        {copy.words.map(([word, accent], i) => (
          <span key={i}>
            <span
              className={`${styles.word} ${accent ? 'text-chako-orange' : ''}`}
              style={{ '--i': i } as React.CSSProperties}
            >
              {word}
            </span>{' '}
          </span>
        ))}
      </h1>

      <p
        className={`${styles.word} mt-6 max-w-md text-body text-chako-ink/70`}
        style={{ '--i': copy.words.length + 2 } as React.CSSProperties}
      >
        {copy.sub}
      </p>

      <button
        onClick={scrollPast}
        className={`${styles.cue} absolute bottom-8 inline-flex items-center gap-2 rounded-full border border-chako-ink/25 px-5 py-2.5 text-label uppercase tracking-widest text-chako-ink/80 hover:bg-chako-ink hover:text-chako-cream transition-colors`}
        aria-label={copy.cue}
      >
        {copy.cue}
        <ChevronDown size={15} className={styles.bounce} />
      </button>
    </section>
  );
}
