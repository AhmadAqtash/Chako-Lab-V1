'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Slide {
  headline: string;
  subline: string;
  label: string;
  cta: string;
  ctaHref: string;
  ctaSecondary?: string;
  ctaSecondaryHref?: string;
}

const slides: Slide[] = [
  {
    headline: 'Drink',
    subline: 'beautifully.',
    label: 'CHAKO LAB × UAE',
    cta: 'Shop All Products',
    ctaHref: '/collections',
    ctaSecondary: 'View Kettles',
    ctaSecondaryHref: '/collections/linlin-kettles',
  },
  {
    headline: 'Stay',
    subline: 'hydrated.',
    label: 'KADA BOTTLES',
    cta: 'Shop Kada Bottles',
    ctaHref: '/collections/kada-bottles',
  },
  {
    headline: 'Sip',
    subline: 'in style.',
    label: 'BOBO TUMBLERS',
    cta: 'Shop Tumblers',
    ctaHref: '/collections/bobo-tumblers',
  },
  {
    headline: 'Pour',
    subline: 'with care.',
    label: 'LINLIN KETTLES',
    cta: 'Shop Kettles',
    ctaHref: '/collections/linlin-kettles',
  },
  {
    headline: 'Every',
    subline: 'moment.',
    label: 'MILK PODS',
    cta: 'Shop Milk Pods',
    ctaHref: '/collections/milk-pods',
  },
];

export default function HeroSlideshow() {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((idx: number) => {
    setCurrent((idx + slides.length) % slides.length);
  }, []);

  const prev = () => { setPaused(true); goTo(current - 1); };
  const next = useCallback(() => { goTo(current + 1); }, [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next, paused]);

  const slide = slides[current];

  return (
    <section
      className="relative overflow-hidden min-h-[85vh] flex items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background — shared across all slides */}
      <Image
        src="/hero-banner.jpg"
        alt="Chako Lab drinkware"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-white/20" />

      {/* Slide content */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-8 py-24 w-full">
        <div className="max-w-2xl">
          {/* Static: logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/chako-lab-logo.png"
            alt="Chako Lab"
            style={{ height: '32px', width: 'auto', marginBottom: '16px' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
            }}
          />
          <span
            style={{ display: 'none', marginBottom: '16px' }}
            className="block font-bold text-xl tracking-tight text-chako-dark"
          >
            CHAKO LAB®
          </span>

          {/* Animated: label, headline, subline, CTAs */}
          <div key={current} className="animate-fade-slide-up">
            <p className="text-chako-dark text-sm font-semibold tracking-widest uppercase mb-6">
              {slide.label}
            </p>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6 text-chako-dark">
              {slide.headline}
              <br />
              <span className="text-chako-dark/70">{slide.subline}</span>
            </h1>
            <div className="flex flex-wrap gap-4">
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-chako-dark text-chako-bg font-semibold rounded-2xl hover:bg-chako-dark/90 transition-colors text-sm"
              >
                {slide.cta}
              </Link>
              {slide.ctaSecondary && slide.ctaSecondaryHref && (
                <Link
                  href={slide.ctaSecondaryHref}
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-chako-dark/20 text-chako-dark font-semibold rounded-2xl hover:bg-chako-dark/10 transition-colors text-sm"
                >
                  {slide.ctaSecondary}
                </Link>
              )}
            </div>
          </div>

          {/* Static: stats */}
          <div className="flex gap-8 mt-14">
            {[
              { value: t('hero_stat1_value'), label: t('hero_stat1_label') },
              { value: t('hero_stat2_value'), label: t('hero_stat2_label') },
              { value: t('hero_stat3_value'), label: t('hero_stat3_label') },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-chako-dark">{value}</p>
                <p className="text-xs text-chako-dark/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Arrow buttons */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} className="text-chako-dark" />
      </button>
      <button
        onClick={() => { setPaused(true); next(); }}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
        aria-label="Next slide"
      >
        <ChevronRight size={20} className="text-chako-dark" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-6 md:left-8 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setPaused(true); goTo(i); }}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 h-2 bg-chako-dark'
                : 'w-2 h-2 bg-chako-dark/30 hover:bg-chako-dark/60'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
