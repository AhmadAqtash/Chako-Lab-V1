'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface Slide {
  enDesktop: string;
  enMobile: string;
  arDesktop: string;
  arMobile: string;
  ctaEn: string;
  ctaAr: string;
  ctaHref: string;
}

const SLIDES: Slide[] = [
  {
    enDesktop: '/hero/slide-1-en-desktop.png',
    enMobile:  '/hero/slide-1-en-mobile.png',
    arDesktop: '/hero/slide-1-ar-desktop.png',
    arMobile:  '/hero/slide-1-ar-mobile.png',
    ctaEn: 'Shop Titanium Collection',
    ctaAr: 'تسوق مجموعة التيتانيوم',
    ctaHref: '/collections/bobo-tumblers',
  },
  {
    enDesktop: '/hero/slide-2-en-desktop.png',
    enMobile:  '/hero/slide-2-en-mobile.png',
    arDesktop: '/hero/slide-2-ar-desktop.png',
    arMobile:  '/hero/slide-2-ar-mobile.png',
    ctaEn: 'Shop Milk Pod Titanium',
    ctaAr: 'تسوق ميلك بود تيتانيوم',
    ctaHref: '/collections/milk-pods',
  },
  {
    enDesktop: '/hero/slide-3-en-desktop.png',
    enMobile:  '/hero/slide-3-en-mobile.png',
    arDesktop: '/hero/slide-3-ar-desktop.png',
    arMobile:  '/hero/slide-3-ar-mobile.png',
    ctaEn: 'Shop Now — 10% Off',
    ctaAr: 'تسوق الآن — خصم ١٠٪',
    ctaHref: '/collections',
  },
];

export default function HeroSlideshow() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((idx: number) => {
    setCurrent((idx + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-advance does not set paused
  const advance = useCallback(() => { goTo(current + 1); }, [current, goTo]);

  // Manual nav pauses the timer
  const handlePrev = () => { setPaused(true); goTo(current - 1); };
  const handleNext = () => { setPaused(true); goTo(current + 1); };

  useEffect(() => {
    if (paused) return;
    const id = setInterval(advance, 6000);
    return () => clearInterval(id);
  }, [advance, paused]);

  const slide = SLIDES[current];
  const ctaLabel = isAr ? slide.ctaAr : slide.ctaEn;

  return (
    <section
      className="relative overflow-hidden min-h-[100svh] md:min-h-[85vh] flex flex-col"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* All slides stacked — crossfade via opacity transition, no remount */}
      {SLIDES.map((s, i) => {
        const desktopSrc = isAr ? s.arDesktop : s.enDesktop;
        const mobileSrc  = isAr ? s.arMobile  : s.enMobile;
        return (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-hidden={i !== current}
          >
            {/* Mobile — portrait image, anchor to top */}
            <Image
              src={mobileSrc}
              alt="Chako Lab"
              fill
              priority={i === 0}
              className="block md:hidden object-cover object-top"
              sizes="100vw"
            />
            {/* Desktop — landscape image, centered */}
            <Image
              src={desktopSrc}
              alt="Chako Lab"
              fill
              priority={i === 0}
              className="hidden md:block object-cover object-center"
              sizes="100vw"
            />
          </div>
        );
      })}

      {/* CTA button — white pill, absolute bottom-left */}
      <div className="absolute bottom-20 md:bottom-16 left-6 md:left-8 z-20">
        <Link
          href={slide.ctaHref}
          className="inline-flex items-center gap-2 bg-white text-chako-dark font-bold px-6 py-3 rounded-full shadow-lg hover:bg-white/90 transition-colors text-sm touch-manipulation"
        >
          {ctaLabel}
        </Link>
      </div>

      {/* Arrows — desktop only, RTL-aware */}
      <button
        onClick={isAr ? handleNext : handlePrev}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/80 backdrop-blur-sm rounded-full items-center justify-center hover:bg-white transition-colors shadow-md"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} className="text-chako-dark" />
      </button>
      <button
        onClick={isAr ? handlePrev : handleNext}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/80 backdrop-blur-sm rounded-full items-center justify-center hover:bg-white transition-colors shadow-md"
        aria-label="Next slide"
      >
        <ChevronRight size={20} className="text-chako-dark" />
      </button>

      {/* Dot indicators — centered on mobile, left-anchored on desktop */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 z-20 flex items-center">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setPaused(true); goTo(i); }}
            className="p-2.5 touch-manipulation"
            aria-label={`Go to slide ${i + 1}`}
          >
            <span className={`block rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 h-2 bg-white shadow-sm'
                : 'w-2 h-2 bg-white/50 hover:bg-white/75'
            }`} />
          </button>
        ))}
      </div>

      {/* Stats — desktop only */}
      <div className="absolute bottom-8 right-8 z-20 hidden md:flex gap-8">
        {[
          { value: t('hero_stat1_value'), label: t('hero_stat1_label') },
          { value: t('hero_stat2_value'), label: t('hero_stat2_label') },
          { value: t('hero_stat3_value'), label: t('hero_stat3_label') },
        ].map(({ value, label }) => (
          <div key={label} className="text-right">
            <p className="text-2xl font-bold text-white drop-shadow">{value}</p>
            <p className="text-xs text-white/70 mt-0.5 drop-shadow">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
