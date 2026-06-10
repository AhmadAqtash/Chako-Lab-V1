'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from '@/components/ui/LocalizedLink';
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
    ctaHref: '/collections/titanium',
  },
  {
    enDesktop: '/hero/slide-2-en-desktop.png',
    enMobile:  '/hero/slide-2-en-mobile.png',
    arDesktop: '/hero/slide-2-ar-desktop.png',
    arMobile:  '/hero/slide-2-ar-mobile.png',
    ctaEn: 'Shop Milk Pod Titanium',
    ctaAr: 'تسوق ميلك بود تيتانيوم',
    ctaHref: '/collections/titanium',
  },
  {
    enDesktop: '/hero/slide-3-en-desktop.png',
    enMobile:  '/hero/slide-3-en-mobile.png',
    arDesktop: '/hero/slide-3-ar-desktop.png',
    arMobile:  '/hero/slide-3-ar-mobile.png',
    ctaEn: 'Shop Now - 10% Off',
    ctaAr: 'تسوق الآن - خصم ١٠٪',
    ctaHref: '/collections',
  },
];

export default function HeroSlideshow() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const goTo = useCallback((idx: number) => {
    setCurrent((idx + SLIDES.length) % SLIDES.length);
  }, []);

  const advance = useCallback(() => { goTo(current + 1); }, [current, goTo]);
  const handlePrev = () => { setPaused(true); goTo(current - 1); };
  const handleNext = () => { setPaused(true); goTo(current + 1); };

  useEffect(() => {
    if (paused) return;
    const id = setInterval(advance, 6000);
    return () => clearInterval(id);
  }, [advance, paused]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
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
  };

  const slide = SLIDES[current];
  const ctaLabel = isAr ? slide.ctaAr : slide.ctaEn;

  return (
    <section
      className="relative overflow-hidden aspect-[1122/1402] md:aspect-auto md:min-h-[85vh] flex flex-col"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
        );
      })}

      {/* Bottom gradient — ensures CTA readable over any slide on mobile */}
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/55 to-transparent z-10 md:hidden pointer-events-none" />

      {/* CTA button — centered on mobile, left-anchored on desktop */}
      <div className="absolute bottom-20 md:bottom-16 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 z-20">
        <Link
          href={slide.ctaHref}
          className="inline-flex items-center gap-2 bg-white text-chako-ink font-display font-bold px-7 py-4 rounded-full shadow-xl hover:bg-white/95 hover:shadow-2xl active:scale-[0.96] transition-[transform,background-color,box-shadow] duration-150 text-sm md:text-base touch-manipulation whitespace-nowrap"
        >
          {ctaLabel}
          <span className="text-chako-orange text-base leading-none">→</span>
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

      {/* Dot indicators — centered, larger dots on mobile */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 z-20 flex items-center">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setPaused(true); goTo(i); }}
            className="p-3 md:p-2.5 touch-manipulation"
            aria-label={`Go to slide ${i + 1}`}
          >
            <span className={`block rounded-full transition-all duration-300 ${
              i === current
                ? 'w-8 h-3 md:w-6 md:h-2 bg-white shadow-md'
                : 'w-3 h-3 md:w-2 md:h-2 bg-white/50 hover:bg-white/80'
            }`} />
          </button>
        ))}
      </div>
    </section>
  );
}
