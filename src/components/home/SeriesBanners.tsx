'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

const SERIES = [
  {
    handle: 'linlin-kettles',
    labelEn: 'LinLin Series',
    labelAr: 'مجموعة لين لين',
    imageEn: '/banners/en-linlin.png',
    imageAr: '/banners/ar-linlin.png',
    accent: '#FFF9D0',
  },
  {
    handle: 'milk-pods',
    labelEn: 'MilkPod Series',
    labelAr: 'مجموعة ميلك بود',
    imageEn: '/banners/en-milkpod.png',
    imageAr: '/banners/ar-milkpod.png',
    accent: '#FFF5DC',
  },
  {
    handle: 'bawang-cups',
    labelEn: 'BaWang Series',
    labelAr: 'مجموعة باوانج',
    imageEn: '/banners/en-bawang.png',
    imageAr: '/banners/ar-bawang.png',
    accent: '#FFE0F0',
  },
  {
    handle: 'bobo-tumblers',
    labelEn: 'BoBo Series',
    labelAr: 'مجموعة بوبو',
    imageEn: '/banners/en-bobo.png',
    imageAr: '/banners/ar-bobo.png',
    accent: '#F0DCFF',
  },
  {
    handle: 'kada-bottles',
    labelEn: 'Kada Series',
    labelAr: 'مجموعة كادا',
    imageEn: '/banners/en-kada.png',
    imageAr: '/banners/ar-kada.png',
    accent: '#D7F2E6',
  },
  {
    handle: 'pangpang-cups',
    labelEn: 'PangPang Series',
    labelAr: 'مجموعة بانغ بانغ',
    imageEn: '/banners/en-pangpang.png',
    imageAr: '/banners/ar-pangpang.png',
    accent: '#DCF0FF',
  },
  {
    handle: 'tumbler',
    labelEn: 'Hung Kettle',
    labelAr: 'مجموعة كيتل',
    imageEn: '/banners/en-hung-kettle.png',
    imageAr: '/banners/ar-hung-kettle.png',
    accent: '#FFF0E0',
  },
  {
    handle: 'bobo-tumblers',
    labelEn: 'Titanium Series',
    labelAr: 'مجموعة التيتانيوم الفاخرة',
    imageEn: '/banners/en-titanium.png',
    imageAr: '/banners/ar-titanium.png',
    accent: '#E8E8E8',
  },
];

const EASE = 'cubic-bezier(0.23,1,0.32,1)';

export default function SeriesBanners() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) { setRevealed(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full max-w-screen-xl mx-auto px-4 md:px-8 py-16 md:py-24"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Section header */}
      <div
        className="mb-8 md:mb-12 flex items-end justify-between"
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'translateY(0)' : 'translateY(20px)',
          transition: `opacity 600ms ${EASE}, transform 600ms ${EASE}`,
        }}
      >
        <div>
          <p className="text-xs font-semibold text-chako-dark/40 uppercase tracking-widest mb-2">
            {isAr ? 'استكشف' : 'Explore'}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">
            {isAr ? 'تسوق حسب المجموعة' : 'Shop by Series'}
          </h2>
        </div>
        <Link
          href="/collections"
          className="text-sm font-semibold underline underline-offset-4 hover:opacity-60 transition-opacity whitespace-nowrap cursor-pointer"
        >
          {isAr ? 'عرض الكل' : 'View all'}
        </Link>
      </div>

      {/* Banner grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {SERIES.map((series, i) => {
          const img = isAr ? series.imageAr : series.imageEn;
          const label = isAr ? series.labelAr : series.labelEn;

          return (
            /* Outer div handles entrance animation; inner Link handles hover */
            <div
              key={`${series.handle}-${i}`}
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity 600ms ${EASE} ${i * 70}ms, transform 600ms ${EASE} ${i * 70}ms`,
              }}
            >
              <Link
                href={`/collections/${series.handle}`}
                className="group relative block overflow-hidden rounded-2xl cursor-pointer transition-[transform,box-shadow] duration-300 ease-out hover:scale-[1.03] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chako-dark focus-visible:ring-offset-2"
              >
                {/* Background colour while image loads */}
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: series.accent }}
                />

                {/* Banner image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
                  <Image
                    src={img}
                    alt={label}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    priority={i < 3}
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent transition-opacity duration-300 group-hover:from-black/40" />

                  {/* Label pill — slides up 4px on hover */}
                  <div className="absolute bottom-0 inset-x-0 p-4">
                    <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-chako-dark text-sm font-bold px-3 py-2 rounded-full shadow-sm transition-[transform,background-color,box-shadow] duration-200 ease-out group-hover:-translate-y-1 group-hover:bg-white group-hover:shadow-md max-w-full min-w-0">
                      <span className="truncate">{label}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14" height="14"
                        viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"
                        className={`flex-shrink-0 opacity-60 transition-transform duration-200 group-hover:translate-x-1 ${isAr ? 'rotate-180 group-hover:translate-x-0 group-hover:-translate-x-1' : ''}`}
                      >
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
