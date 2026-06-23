'use client';

import { useEffect, useRef, useState } from 'react';
import ShopifyImage from '@/components/ui/ShopifyImage';
import { ChevronDown } from 'lucide-react';
import type { Product } from '@/types/shopify';
import { useLanguage } from '@/context/LanguageContext';
import { getSeriesStory } from '@/lib/pdp-story';
import { resolveSpecs } from '@/lib/product-specs';
import { gsap, prefersReducedMotion } from '@/lib/gsapClient';

interface Props {
  product: Product;
  collectionHandle?: string;
  isTitanium?: boolean;
  /** Language-stable productType (AR pages localize product.productType) */
  baseType?: string;
}

/**
 * Below-the-fold PDP story: chakolab.net-style candy-color feature posters
 * (live HTML — localized, zero baked text), animated spec counters, what's
 * in the box, and FAQs. Series content comes from src/lib/pdp-story.ts;
 * hard numbers only from the product's own title/description.
 *
 * GSAP/ScrollTrigger drives everything; with prefers-reduced-motion (or no
 * JS) the section renders fully visible and static.
 */
export default function ProductStory({ product, collectionHandle, isTitanium, baseType }: Props) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const pick = <T extends { en: string; ar: string }>(l: T) => (isAr ? l.ar : l.en);

  // Canonical specs: 36h cold / 18h hot for every insulated product, no
  // retention claims for plastic bodies, capacity always resolved (extracted
  // or series fallback) — see src/lib/product-specs.ts
  const resolved = resolveSpecs(product, baseType);
  const story = getSeriesStory(collectionHandle, isTitanium, resolved.plastic);
  const specs = [
    ...(resolved.capacityMl
      ? [{ value: resolved.capacityMl, suffix: 'ml', label: { en: 'Capacity', ar: 'السعة' } }]
      : []),
    ...(resolved.retention
      ? [
          { value: resolved.retention.coldHours, suffix: 'h', label: { en: 'Stays cold', ar: 'يبقى باردًا' } },
          { value: resolved.retention.hotHours, suffix: 'h', label: { en: 'Stays hot', ar: 'يبقى ساخنًا' } },
        ]
      : []),
  ];
  const images = product.images.nodes.length ? product.images.nodes : [];
  const posterImage = (i: number) => images[i % Math.max(images.length, 1)];

  const rootRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number>(-1);

  const light = story.posterInk === 'light';
  const inkCls = light ? 'text-white' : 'text-chako-ink';
  const chipCls = light
    ? 'bg-white/20 text-white border-white/30'
    : 'bg-black/10 text-chako-ink border-black/15';

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // Narrative words rise out of their masks
      gsap.from('[data-sw]', {
        yPercent: 130,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.05,
        scrollTrigger: { trigger: '[data-narrative]', start: 'top 80%' },
      });

      // Posters: image card swings gently with scroll; content cascades in
      gsap.utils.toArray<HTMLElement>('[data-poster]').forEach((poster) => {
        const img = poster.querySelector('[data-poster-img]');
        if (img) {
          gsap.fromTo(
            img,
            { y: '4%', rotation: 2.5 },
            {
              y: '-4%',
              rotation: -2.5,
              ease: 'none',
              scrollTrigger: { trigger: poster, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
            }
          );
        }
        gsap.from(poster.querySelectorAll('[data-poster-rise]'), {
          y: 28,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.1,
          scrollTrigger: { trigger: poster, start: 'top 70%' },
        });
        // Leader lines draw toward the chips, then chips pop
        gsap.from(poster.querySelectorAll('[data-line]'), {
          scaleX: 0,
          transformOrigin: isAr ? 'right center' : 'left center',
          duration: 0.55,
          ease: 'power2.inOut',
          stagger: 0.15,
          scrollTrigger: { trigger: poster, start: 'top 62%' },
        });
        gsap.from(poster.querySelectorAll('[data-chip]'), {
          scale: 0,
          duration: 0.55,
          ease: 'back.out(2.2)',
          stagger: 0.15,
          delay: 0.25,
          scrollTrigger: { trigger: poster, start: 'top 62%' },
        });
      });

      // Spec counters count up once
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const target = parseInt(el.dataset.count || '0', 10);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.v));
          },
        });
      });

      // Box items slide in from the inline-start side
      gsap.from('[data-box-item]', {
        x: isAr ? 24 : -24,
        opacity: 0,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.09,
        scrollTrigger: { trigger: '[data-box]', start: 'top 78%' },
      });
    }, root);

    return () => ctx.revert();
  }, [isAr]);

  const narrativeWords = pick(story.narrative).split(' ');

  return (
    <div ref={rootRef} className="max-w-screen-xl mx-auto px-4 md:px-8 py-14 md:py-20 space-y-14 md:space-y-20">
      {/* ── Narrative band ── */}
      <section data-narrative className="text-center max-w-3xl mx-auto">
        <p className="text-label uppercase tracking-widest text-chako-ink/40 mb-4">
          {isAr ? 'لماذا ستحبها' : 'Why you’ll love it'}
        </p>
        <h2 className="font-display text-display font-semibold text-chako-ink">
          {narrativeWords.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.18em] -mb-[0.18em]">
              <span data-sw className="inline-block">
                {w}
              </span>
              {i < narrativeWords.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h2>
      </section>

      {/* ── Feature posters ── */}
      <div className="space-y-6 md:space-y-10">
        {story.features.map((f, i) => {
          const img = posterImage(i);
          const flip = i % 2 === 1;
          return (
            <section
              key={i}
              data-poster
              className="rounded-[2rem] overflow-hidden"
              style={{ backgroundColor: story.accent }}
            >
              <div className="p-6 md:p-12 grid md:grid-cols-2 gap-7 md:gap-12 items-center">
                {/* Product image card */}
                <div className={`relative ${flip ? 'md:order-2' : ''}`}>
                  <div
                    data-poster-img
                    className="relative aspect-square rounded-3xl overflow-hidden bg-chako-cream shadow-2xl will-change-transform"
                  >
                    {img && (
                      <ShopifyImage
                        src={img.url}
                        alt={img.altText ?? product.title}
                        fill
                        sizes="(min-width: 768px) 44vw, 92vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Copy + callouts */}
                <div className={`${inkCls} ${flip ? 'md:order-1' : ''}`}>
                  <span data-poster-rise className="font-display text-sm tracking-[0.18em] opacity-60 block mb-3">
                    [0{i + 1}]
                  </span>
                  <h3 data-poster-rise className="font-display text-heading font-bold leading-tight mb-3">
                    {pick(f.title)}
                  </h3>
                  <p data-poster-rise className="text-body opacity-85 max-w-md mb-6">
                    {pick(f.body)}
                  </p>

                  <div className="space-y-3">
                    {f.callouts.map((c, ci) => (
                      <div key={ci} className="flex items-center gap-0 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${light ? 'bg-white' : 'bg-chako-ink'}`}
                        />
                        <span
                          data-line
                          className={`h-px flex-1 max-w-[72px] border-t border-dashed ${
                            light ? 'border-white/60' : 'border-black/40'
                          }`}
                        />
                        <span
                          data-chip
                          className={`ms-2 inline-block px-3.5 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap ${chipCls}`}
                        >
                          {pick(c)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Spec counters (only specs the product itself states) ── */}
      {specs.length > 0 && (
        <section className="rounded-[2rem] bg-chako-ink text-chako-cream p-8 md:p-12">
          <div className={`grid gap-8 ${specs.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'} md:gap-12 text-center`}>
            {specs.map((s, i) => (
              <div key={i}>
                <p className="font-display font-bold text-[clamp(2rem,9vw,3.5rem)] leading-none">
                  <span data-count={s.value}>{s.value}</span>
                  <span className="text-chako-orange text-[0.5em] align-top ms-0.5">{s.suffix}</span>
                </p>
                <p className="text-sm opacity-60 mt-2">{pick(s.label)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── What's in the box ── */}
      <section
        data-box
        className="whats-in-box rounded-[2rem] p-7 md:p-12"
        style={{ backgroundColor: story.accentSoft }}
      >
        <h3 className="font-display text-heading font-bold text-chako-ink mb-6">
          {isAr ? 'ماذا يوجد في الصندوق؟' : 'What’s in the box'}
        </h3>
        <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-4 max-w-2xl">
          {story.inBox.map((item, i) => (
            <li key={i} data-box-item className="flex items-center gap-3">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                style={{ backgroundColor: story.accent }}
              >
                ✓
              </span>
              <span className="text-body text-chako-ink/85">{pick(item)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── FAQs ── */}
      <section className="max-w-2xl mx-auto">
        <h3 className="font-display text-heading font-bold text-chako-ink mb-2 text-center">
          {isAr ? 'أسئلة وأجوبة' : 'Questions, answered.'}
        </h3>
        <div className="divide-y divide-black/8">
          {story.faqs.map((faq, i) => {
            const open = openFaq === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(open ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-start touch-manipulation"
                  aria-expanded={open}
                >
                  <span className="font-semibold text-[15px] md:text-base text-chako-ink">{pick(faq.q)}</span>
                  <ChevronDown
                    size={18}
                    className={`flex-shrink-0 text-chako-ink/50 transition-transform duration-300 ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-[15px] leading-relaxed text-chako-ink/70">{pick(faq.a)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
