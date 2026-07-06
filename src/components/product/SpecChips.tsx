'use client';

import { useEffect, useRef } from 'react';
import { Droplets, Snowflake, Flame, Feather, Sparkles } from 'lucide-react';
import type { Product } from '@/types/shopify';
import { useLanguage } from '@/context/LanguageContext';
import { resolveSpecs } from '@/lib/product-specs';
import { getSeriesStory } from '@/lib/pdp-story';
import { gsap, prefersReducedMotion } from '@/lib/gsapClient';

interface Props {
  product: Product;
  baseType?: string;
  collectionHandle?: string;
  isTitanium?: boolean;
}

/**
 * Canonical spec chips in the buy box: capacity (always), 36h cold + 18h hot
 * (insulated products only), featherlight chip for plastic bodies. Candy
 * colors from the series palette; GSAP stagger pop on mount, icon wiggle
 * on tap/hover.
 */
export default function SpecChips({ product, baseType, collectionHandle, isTitanium }: Props) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const rootRef = useRef<HTMLDivElement>(null);

  const resolved = resolveSpecs(product, baseType);
  const story = getSeriesStory(collectionHandle, isTitanium, resolved.plastic);

  const chips: { icon: React.ReactNode; text: string; bg: string; fg: string }[] = [];

  if (resolved.accessory) {
    // Accessories carry no drinkware specs — just a playful, always-true chip
    chips.push({
      icon: <Sparkles size={14} />,
      text: isAr ? 'إكسسوار تشاكو الأصلي' : 'Original Chako accessory',
      bg: story.accentSoft,
      fg: '#1a1a1a',
    });
  }

  if (resolved.capacityMl) {
    chips.push({
      icon: <Droplets size={14} />,
      text: `${resolved.capacityMl}ml`,
      bg: story.accent,
      fg: story.posterInk === 'light' ? '#ffffff' : '#1a1a1a',
    });
  }
  if (resolved.retention) {
    chips.push(
      {
        icon: <Snowflake size={14} />,
        text: isAr ? `بارد ${resolved.retention.coldHours} ساعة` : `${resolved.retention.coldHours}h cold`,
        bg: '#E6FAF9', // bobo soft teal
        fg: '#0D9488',
      },
      {
        icon: <Flame size={14} />,
        text: isAr ? `ساخن ${resolved.retention.hotHours} ساعة` : `${resolved.retention.hotHours}h hot`,
        bg: '#FFF3E8', // kada soft orange
        fg: '#F97316',
      }
    );
  } else if (resolved.plastic) {
    // Plastic drinkware only — accessories already got their chip above
    chips.push({
      icon: <Feather size={14} />,
      text: isAr ? 'خفيفة وخالية من BPA' : 'Featherlight · BPA-free',
      bg: '#FFFDE6', // linlin soft
      fg: '#8a7a00',
    });
  }

  useEffect(() => {
    if (prefersReducedMotion() || !rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-spec-chip]', {
        scale: 0.5,
        opacity: 0,
        duration: 0.55,
        ease: 'back.out(2.4)',
        stagger: 0.08,
      });
    }, rootRef.current);
    return () => ctx.revert();
  }, []);

  const wiggle = (e: React.PointerEvent<HTMLSpanElement>) => {
    if (prefersReducedMotion()) return;
    const icon = e.currentTarget.querySelector('[data-chip-icon]');
    if (icon) {
      gsap.fromTo(
        icon,
        { rotation: 0 },
        {
          keyframes: [
            { rotation: -16, duration: 0.1 },
            { rotation: 12, duration: 0.1 },
            { rotation: 0, duration: 0.35, ease: 'elastic.out(1.4, 0.4)' },
          ],
          overwrite: true,
        }
      );
    }
  };

  if (!chips.length) return null;

  return (
    <div ref={rootRef} className="flex flex-wrap gap-2">
      {chips.map((chip, i) => (
        <span
          key={i}
          data-spec-chip
          onPointerEnter={wiggle}
          onPointerDown={wiggle}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold select-none cursor-default touch-manipulation"
          style={{ backgroundColor: chip.bg, color: chip.fg }}
        >
          <span data-chip-icon className="inline-flex">
            {chip.icon}
          </span>
          {chip.text}
        </span>
      ))}
    </div>
  );
}
