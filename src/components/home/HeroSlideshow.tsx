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
  ctaSecondaryEn?: string;
  ctaSecondaryAr?: string;
  ctaSecondaryHref?: string;
}

const SLIDES: Slide[] = [
  {
    enDesktop: '/hero/slide-1-en-desktop.png',
    enMobile: '/hero/slide-1-en-mobile.png',
    arDesktop: '/hero/slide-1-ar-desktop.png',
    arMobile: '/hero/slide-1-ar-mobile.png',
    ctaEn: 'Shop Milk Pod Titanium',
    ctaAr: 'تسوق ميلك بود تيتانيوم',
    ctaHref: '/collections/milk-pods',
  },
  {
    enDesktop: '/hero/slide-2-en-desktop.png',
    enMobile: '/hero/slide-2-en-mobile.png',
    arDesktop: '/hero/slide-2-ar-desktop.png',
    arMobile: '/hero/slide-2-ar-mobile.png',
    ctaEn: 'Shop Titanium Collection',
    ctaAr: 'تسوق مجموعة التيتانيوم',
    ctaHref: '/collections/bobo-tumblers',
  },
  {
    enDesktop: '/hero/slide-3-en-desktop.png',
    enMobile: '/hero/slide-3-en-mobile.png',
    arDesktop: '/hero/slide-3-ar-desktop.png',
    arMobile: '/hero/slide-3-ar-mobile.png',
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

  const prev = () => { setPaused(true); goTo(current - 1); };
  const next = useCallback(() => { goTo(current + 1); }, [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next, paused]);

  const slide = SLIDES[current];
  const desktopSrc = isAr ? slide.arDesktop : slide.enDesktop;
  const mobileSrc = isAr ? slide.arMobile : slide.enMobile;
  const ctaLabel = isAr ? slide.ctaAr : slide.ctaEn;
  const ctaSecondaryLabel = isAr ? slide.ctaSecondaryAr : slide.ctaSecondaryEn;

  return (
    <section
      className="relative overflow-hidden min-h-[85vh] flex flex-col"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide images */}
      <div className="absolute inset-0">
        <Image
          key={`desktop-${current}-${language}`}
          src={desktopSrc}
          alt="Chako Lab"
          fill
          priority={current === 0}
          className="hidden md:block object-cover object-center"
          sizes="100vw"
        />
        <Image
          key={`mobile-${current}-${language}`}
          src={mobileSrc}
          alt="Chako Lab"
          fill
          priority={current === 0}
          className="block md:hidden object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Logo */}
      <div className="relative z-10 px-6 md:px-8 pt-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/chako-lab-logo.png"
          alt="Chako Lab"
          style={{ height: '32px', width: 'auto' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
          }}
        />
        <span style={{ display: 'none' }} className="font-bold text-xl tracking-tight text-chako-dark">
          CHAKO LAB®
        </span>
      </div>

      {/* CTA buttons */}
      <div key={current} className="absolute bottom-16 left-6 md:left-8 z-20 animate-fade-slide-up flex flex-wrap gap-4">
          <Link
            href={slide.ctaHref}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-chako-dark text-chako-bg font-semibold rounded-2xl hover:bg-chako-dark/90 transition-colors text-sm"
          >
            {ctaLabel}
          </Link>
          {ctaSecondaryLabel && slide.ctaSecondaryHref && (
            <Link
              href={slide.ctaSecondaryHref}
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-chako-dark/20 bg-white/80 backdrop-blur-sm text-chako-dark font-semibold rounded-2xl hover:bg-white transition-colors text-sm"
            >
              {ctaSecondaryLabel}
            </Link>
          )}
      </div>

      {/* Previous / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md touch-manipulation"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} className="text-chako-dark" />
      </button>
      <button
        onClick={() => { setPaused(true); next(); }}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md touch-manipulation"
        aria-label="Next slide"
      >
        <ChevronRight size={20} className="text-chako-dark" />
      </button>

      {/* Dot indicators — padded for 44px+ touch target */}
      <div className="absolute bottom-6 left-4 md:left-8 z-20 flex items-center">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setPaused(true); goTo(i); }}
            className="p-2.5 touch-manipulation"
            aria-label={`Go to slide ${i + 1}`}
          >
            <span className={`block rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 h-2 bg-chako-dark'
                : 'w-2 h-2 bg-chako-dark/30 hover:bg-chako-dark/60'
            }`} />
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="absolute bottom-8 right-6 md:right-8 z-20 hidden md:flex gap-8">
        {[
          { value: t('hero_stat1_value'), label: t('hero_stat1_label') },
          { value: t('hero_stat2_value'), label: t('hero_stat2_label') },
          { value: t('hero_stat3_value'), label: t('hero_stat3_label') },
        ].map(({ value, label }) => (
          <div key={label} className="text-right">
            <p className="text-2xl font-bold text-chako-dark">{value}</p>
            <p className="text-xs text-chako-dark/40 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
