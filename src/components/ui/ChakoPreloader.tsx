'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './ChakoPreloader.module.css';

const MIN_SHOW_MS = 700; // let the spin register instead of flashing
const MAX_WAIT_MS = 2600; // hard ceiling — a slow network can never trap the user
const REVEAL_MS = 800; // keep in sync with the curtain transition in the CSS module

type Phase = 'loading' | 'revealing' | 'done';

/**
 * Branded first-load overlay: spinning Chako Lab seal on a cream curtain
 * that splits apart to reveal the page. Shows on full page loads only —
 * client-side navigations never remount the locale layout.
 */
export default function ChakoPreloader() {
  const [phase, setPhase] = useState<Phase>('loading');
  const revealed = useRef(false);

  useEffect(() => {
    const mountedAt = performance.now();
    const timers: number[] = [];

    const reveal = () => {
      if (revealed.current) return;
      revealed.current = true;
      setPhase('revealing');
      timers.push(window.setTimeout(() => setPhase('done'), REVEAL_MS + 150));
    };

    const onReady = () => {
      const wait = Math.max(0, MIN_SHOW_MS - (performance.now() - mountedAt));
      timers.push(window.setTimeout(reveal, wait));
    };

    if (document.readyState === 'complete') onReady();
    else window.addEventListener('load', onReady, { once: true });

    timers.push(window.setTimeout(reveal, MAX_WAIT_MS));

    return () => {
      window.removeEventListener('load', onReady);
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div className={styles.overlay} data-phase={phase} aria-hidden="true">
      <div className={`${styles.half} ${styles.top}`} />
      <div className={`${styles.half} ${styles.bottom}`} />
      <div className={styles.badge}>
        <Image
          src="/loader/chako-loader.png"
          alt=""
          width={640}
          height={640}
          priority
          sizes="(min-width: 768px) 300px, 50vw"
          className={styles.spinner}
        />
      </div>
    </div>
  );
}
