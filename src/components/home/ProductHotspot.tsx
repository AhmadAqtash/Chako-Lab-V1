'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

interface HotspotDot {
  id: number;
  label: string;
  top: string;
  left: string;
}

const HOTSPOTS: HotspotDot[] = [
  { id: 1, label: 'Double Wall Insulation', top: '22%', left: '58%' },
  { id: 2, label: 'SUS 316 Steel Body',     top: '48%', left: '72%' },
  { id: 3, label: 'Leak-Proof Seal',         top: '74%', left: '55%' },
];

const FETCH_GQL = `{
  products(first: 1, sortKey: BEST_SELLING, query: "vendor:'Chako Lab' AND product_type:'Kada Bottle'") {
    nodes { featuredImage { url altText } }
  }
}`;

export default function ProductHotspot() {
  const [imageUrl, setImageUrl] = useState('/brand-banner.webp');
  const [imageAlt, setImageAlt] = useState('Kada Bottle product details');
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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
        // fallback already set
      }
    };
    fetchImage();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="overflow-hidden">
      <div
        ref={ref}
        className={`flex flex-col md:flex-row min-h-[500px] transition-all duration-700 ease-out ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Left: dark teal panel */}
        <div className="flex-1 bg-[#1a2f3a] flex items-center px-6 md:px-16 py-12 md:py-16">
          <div className="max-w-sm">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
              Premium Quality
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white uppercase leading-tight mb-5">
              HIGH-QUALITY<br />SUS 316 STEEL
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              Food-grade stainless steel. Built to last a lifetime.
            </p>
            <Link
              href="/collections/kada-bottles"
              className="inline-flex items-center gap-2 text-white font-semibold text-sm group"
            >
              <span className="border-b border-white/40 group-hover:border-white transition-colors pb-0.5">
                Shop Now
              </span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* Right: product image with hotspot dots */}
        <div className="flex-1 relative min-h-[400px] md:min-h-0">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/10" />

          {HOTSPOTS.map((spot) => (
            <div
              key={spot.id}
              className="absolute"
              style={{ top: spot.top, left: spot.left }}
            >
              <div className="relative flex items-center justify-center">
                {/* Pulse ring */}
                <span className="absolute w-5 h-5 rounded-full bg-white/50 animate-ping" />
                {/* Dot — 44px touch target via padding, 20px visual */}
                <button
                  className="relative p-[14px] -m-[14px] rounded-full z-10 touch-manipulation group"
                  onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                  onMouseEnter={() => setActiveHotspot(spot.id)}
                  onMouseLeave={() => setActiveHotspot(null)}
                  onFocus={() => setActiveHotspot(spot.id)}
                  onBlur={() => setActiveHotspot(null)}
                  aria-label={spot.label}
                  aria-expanded={activeHotspot === spot.id}
                >
                  <span className="block w-5 h-5 rounded-full bg-white shadow-lg group-hover:scale-125 transition-transform" />
                </button>
                {/* Tooltip */}
                {activeHotspot === spot.id && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-20 pointer-events-none">
                    <div className="bg-white text-chako-dark text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                      {spot.label}
                    </div>
                    <div className="w-2 h-2 bg-white rotate-45 mx-auto -mt-1 shadow-sm" />
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
