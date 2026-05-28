'use client';

/*
  Tag / Chip — Phase 1 primitive
  ────────────────────────────────────────────────────────
  Used for category filters, collection selectors, and
  any multi-select chip row. Active state picks up the
  series color. Inactive is neutral muted.

  Sizes:
    sm  → min-h-[36px] px-3 py-1.5 text-xs
    md  → min-h-[44px] px-4 py-2.5 text-xs   (default)
    lg  → min-h-[48px] px-5 py-3   text-sm

  Usage:
    <Tag label="Kettles" active />
    <Tag label="Tumblers" color="bobo" active onClick={() => {}} />
    <Tag label="All" onClick={() => {}} />
*/

import { cn } from '@/lib/utils';

type TagColor = 'ink' | 'orange' | 'linlin' | 'milkpod' | 'bawang' | 'bobo' | 'kada' | 'pangpang' | 'titanium';
type TagSize  = 'sm' | 'md' | 'lg';

interface TagProps {
  label:     string;
  active?:   boolean;
  color?:    TagColor;
  size?:     TagSize;
  onClick?:  () => void;
  className?: string;
}

const activeColorClasses: Record<TagColor, string> = {
  ink:      'bg-chako-ink text-chako-cream',
  orange:   'bg-chako-orange text-chako-ink',
  linlin:   'bg-chako-linlin text-chako-ink',
  milkpod:  'bg-chako-milkpod text-white',
  bawang:   'bg-chako-bawang text-white',
  bobo:     'bg-chako-bobo text-white',
  kada:     'bg-chako-kada text-chako-ink',
  pangpang: 'bg-chako-pangpang text-white',
  titanium: 'bg-chako-titanium text-white',
};

const sizeClasses: Record<TagSize, string> = {
  sm: 'min-h-[36px] px-3 py-1.5 text-xs',
  md: 'min-h-[44px] px-4 py-2.5 text-xs',
  lg: 'min-h-[48px] px-5 py-3 text-sm',
};

export function Tag({ label, active = false, color = 'ink', size = 'md', onClick, className }: TagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center',
        'font-sans font-semibold rounded-full',
        'transition-all duration-150 touch-manipulation',
        'active:scale-95',
        sizeClasses[size],
        active
          ? activeColorClasses[color]
          : 'bg-black/5 text-chako-ink/60 hover:bg-black/10 hover:text-chako-ink',
        className
      )}
    >
      {label}
    </button>
  );
}

export default Tag;
