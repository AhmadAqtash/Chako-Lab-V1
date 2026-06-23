'use client';

import { useEffect, useRef } from 'react';
import { Truck, RotateCcw, Shield, CreditCard, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { gsap, prefersReducedMotion } from '@/lib/gsapClient';
import type { TranslationKey } from '@/lib/translations';

// Candy tint rotation — soft series tints that sit happily side by side.
// LinLin's bold yellow is too light for an icon on white, so that tile
// borrows chako-orange instead.
const TINTS: { bg: string; icon: string }[] = [
  { bg: 'bg-chako-linlin-soft', icon: 'text-chako-orange' },
  { bg: 'bg-chako-bawang-soft', icon: 'text-chako-bawang' },
  { bg: 'bg-chako-bobo-soft', icon: 'text-chako-bobo' },
  { bg: 'bg-chako-kada-soft', icon: 'text-chako-kada' },
];

const BADGE_DEFS: { Icon: React.ElementType; labelKey: TranslationKey; subKey: TranslationKey; wide?: boolean; highlight?: boolean }[] = [
  { Icon: Truck, labelKey: 'product_free_shipping', subKey: 'product_free_shipping_sub' },
  { Icon: RotateCcw, labelKey: 'product_easy_returns', subKey: 'product_easy_returns_sub' },
  { Icon: Shield, labelKey: 'product_authentic', subKey: 'product_authentic_sub' },
  { Icon: CreditCard, labelKey: 'product_secure', subKey: 'product_secure_sub' },
  { Icon: Clock, labelKey: 'product_order_2pm', subKey: 'product_order_2pm_sub', wide: true, highlight: true },
];

export default function TrustBadges() {
  const { t } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);

  // Entrance: stagger pop on mount (above the fold — no ScrollTrigger needed)
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.from('[data-badge]', {
        scale: 0.6,
        opacity: 0,
        duration: 0.55,
        ease: 'back.out(2)',
        stagger: 0.07,
        // Clear inline transform/opacity afterwards so the CSS hover lift works
        clearProps: 'transform,opacity',
      });
    }, root);

    return () => ctx.revert();
  }, []);

  // Icon wiggle: quick rotate punch with an elastic settle
  const wiggleIcon = (tile: HTMLElement) => {
    if (prefersReducedMotion()) return;
    const icon = tile.querySelector('[data-badge-icon]');
    if (!icon) return;
    gsap.killTweensOf(icon);
    gsap
      .timeline()
      .to(icon, { rotation: -12, scale: 1.12, duration: 0.1, ease: 'power2.out' })
      .to(icon, { rotation: 12, duration: 0.12, ease: 'power1.inOut' })
      .to(icon, { rotation: 0, scale: 1, duration: 0.7, ease: 'elastic.out(1.2, 0.4)' });
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    // Hover is desktop-only; touch devices get the pointerdown path instead
    if (e.pointerType === 'mouse') wiggleIcon(e.currentTarget);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    wiggleIcon(e.currentTarget);
  };

  return (
    <div ref={rootRef} className="trust-badges grid grid-cols-2 gap-2 pt-2">
      {BADGE_DEFS.map(({ Icon, labelKey, subKey, wide, highlight }, i) => {
        const tint = TINTS[i % TINTS.length];
        return (
          <div
            key={labelKey}
            data-badge
            onPointerEnter={handlePointerEnter}
            onPointerDown={handlePointerDown}
            className={`flex items-center gap-2.5 rounded-2xl px-3 py-2.5 transition-transform duration-300 ease-[var(--ease-out-strong)] motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-[0.98] ${tint.bg} ${wide ? 'col-span-2' : ''} ${highlight ? 'ring-1 ring-chako-orange/30' : ''}`}
          >
            <span
              data-badge-icon
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm ${tint.icon}`}
            >
              <Icon size={17} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold">{t(labelKey)}</p>
              <p className="text-xs text-chako-ink/60 leading-tight mt-0.5">{t(subKey)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
