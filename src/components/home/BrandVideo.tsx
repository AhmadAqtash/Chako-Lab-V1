'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function BrandVideo() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      <Image
        src="/brand-banner.webp"
        alt="Chako Lab premium materials"
        fill
        className="object-cover object-center opacity-50"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/50" />

      <div
        ref={ref}
        className={`relative z-10 text-center px-6 max-w-2xl transition-all duration-700 ease-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-5">
          CHAKO LAB MATERIALS
        </p>
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-5 leading-tight">
          Strong materials.
        </h2>
        <p className="text-white/60 text-lg md:text-xl mb-10 leading-relaxed">
          Safe, durable, and easy to clean.
        </p>
        <Link
          href="/collections/kada-bottles"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-white text-white font-semibold hover:bg-white hover:text-black transition-all duration-200"
        >
          Shop Kada Bottle →
        </Link>
      </div>
    </section>
  );
}
