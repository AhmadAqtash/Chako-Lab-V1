'use client';

import { useEffect, useRef, ReactNode, CSSProperties } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function ScrollReveal({ children, className = '', delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Elements already in viewport on mount get no animation
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('reveal-visible');
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const style: CSSProperties = delay ? { transitionDelay: `${delay}ms` } : {};

  return (
    <div ref={ref} className={`reveal ${className}`} style={style}>
      {children}
    </div>
  );
}
