'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

interface HotspotDot {
  id: number;
  labelEn: string;
  labelAr: string;
  top: string;
  left: string;
}

const HOTSPOTS: HotspotDot[] = [
  { id: 1, labelEn: 'Double Wall Insulation', labelAr: 'عزل بجدارين',        top: '22%', left: '58%' },
  { id: 2, labelEn: 'SUS 316 Steel Body',     labelAr: 'هيكل فولاذ SUS 316', top: '48%', left: '72%' },
  { id: 3, labelEn: 'Leak-Proof Seal',         labelAr: 'ختم مانع للتسرب',   top: '74%', left: '55%' },
];

const FETCH_GQL = `{
  products(first: 1, sortKey: BEST_SELLING, query: "vendor:'Chako Lab' AND product_type:'Kada Bottle'") {
    nodes { featuredImage { url altText } }
  }
}`;

const EASE = 'cubic-bezier(0.23,1,0.32,1)';

export default function ProductHotspot() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [imageUrl, setImageUrl] = useState('/brand-banner.webp');
  const [imageAlt, setImageAlt] = useState('Kada Bottle product details');
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const res = await fetch(`https://${STORE}/api/2024-01/graphql.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': TOKEN,
          },
          body: JSON.stringify({ query: FETCH_GQL }),
        });
        const data = await res.json();
        const node = data.data?.products?.nodes?.[0];
        if (node?.featuredImage?.url) {
          setImageUrl(node.featuredImage.url);
          if (node.featuredImage.altText) setImageAlt(node.featuredImage.altText);
        }
      } catch {
        // fallback image already set
      }
    };
    fetchImage();
  }, []);

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
      className="overflow-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        opacity: revealed ? 1 : 0,
        transition: `opacity 700ms ${EASE}`,
      }}
    >
      <div className="flex flex-col md:flex-row min-h-[480px]">
        {/* Left/right text panel: kada series soft tint */}
        <div className="flex-1 bg-chako-kada-soft flex items-center px-6 md:px-16 py-12 md:py-20 order-2 md:order-1">
          <div
            className="max-w-sm"
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? 'translateY(0)' : 'translateY(24px)',
              transition: `opacity 700ms ${EASE} 150ms, transform 700ms ${EASE} 150ms`,
            }}
          >
            <h2 className="font-display font-bold leading-none text-chako-ink mb-4" style={{ fontSize: 'clamp(2rem, 7vw, 4rem)' }}>
              {isAr ? (
                'فولاذ SUS 316'
              ) : (
                <>SUS 316<br />Steel</>
              )}
            </h2>
            <p className="text-chako-ink/60 leading-relaxed mb-8 max-w-[40ch]" style={{ fontSize: 'clamp(0.9375rem, 2.5vw, 1.0625rem)' }}>
              {isAr
                ? 'فولاذ مقاوم للصدأ صالح للاستخدام الغذائي، مصنوع ليدوم مدى الحياة مع الحفاظ الكامل على نقاء الطعم.'
                : 'Food-grade stainless steel built to last a lifetime, with zero compromise on taste or safety.'}
            </p>
            <Link
              href="/collections/kada-bottles"
              className="inline-flex items-center gap-2 bg-chako-kada text-chako-ink font-display font-bold px-6 py-3.5 rounded-full text-sm hover:opacity-90 active:scale-[0.97] transition-[transform,opacity] duration-150 touch-manipulation"
            >
              {isAr ? 'تسوق كادا' : 'Shop Kada'}
              <span className="text-base leading-none">→</span>
            </Link>
          </div>
        </div>

        {/* Image panel with hotspot dots */}
        <div className="flex-1 relative min-h-[340px] md:min-h-0 bg-chako-kada-soft order-1 md:order-2">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {HOTSPOTS.map((spot) => (
            <div
              key={spot.id}
              className="absolute"
              style={{ top: spot.top, left: spot.left }}
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-5 h-5 rounded-full bg-white/60 animate-ping" />
                <button
                  className="relative p-[14px] -m-[14px] rounded-full z-10 touch-manipulation group"
                  onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                  onMouseEnter={() => setActiveHotspot(spot.id)}
                  onMouseLeave={() => setActiveHotspot(null)}
                  onFocus={() => setActiveHotspot(spot.id)}
                  onBlur={() => setActiveHotspot(null)}
                  aria-label={isAr ? spot.labelAr : spot.labelEn}
                  aria-expanded={activeHotspot === spot.id}
                >
                  <span className="block w-5 h-5 rounded-full bg-white shadow-lg group-hover:scale-125 group-active:scale-95 transition-transform duration-150" />
                </button>
                {activeHotspot === spot.id && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-20 pointer-events-none">
                    <div className="bg-chako-ink text-chako-cream text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                      {isAr ? spot.labelAr : spot.labelEn}
                    </div>
                    <div className="w-2 h-2 bg-chako-ink rotate-45 mx-auto -mt-1" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
