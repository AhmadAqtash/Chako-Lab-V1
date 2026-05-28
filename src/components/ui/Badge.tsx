/*
  Badge / Sticker — Phase 1 primitive
  ────────────────────────────────────────────────────────
  Variants:
    default  — solid color background, bold label
    sticker  — bold + slight CCW rotation (.sticker-rotate)
    pill     — extra-rounded, softer feel
    outline  — bordered, transparent fill

  Colors (maps to series palette):
    ink        — #1a1a1a bg, cream text
    orange     — chako-orange bg, ink text
    linlin     — yellow bg, ink text
    milkpod    — purple bg, white text
    bawang     — rose bg, white text
    bobo       — teal bg, white text
    kada       — orange/coral bg, ink text
    pangpang   — hot pink bg, white text
    titanium   — indigo bg, white text
    soft-*     — tint bg with series-colored text (e.g. soft-linlin)

  rotate?: true adds .sticker-rotate class (-3deg tilt)

  Usage examples:
    <Badge label="RED DOT WINNER" color="ink" variant="sticker" rotate />
    <Badge label="NEW" color="bawang" variant="pill" />
    <Badge label="BPA FREE" color="bobo" variant="default" />
    <Badge label="SALE" color="orange" variant="pill" />
*/

import { cn } from '@/lib/utils';

type BadgeColor =
  | 'ink' | 'orange'
  | 'linlin' | 'milkpod' | 'bawang' | 'bobo' | 'kada' | 'pangpang' | 'titanium'
  | 'soft-linlin' | 'soft-milkpod' | 'soft-bawang' | 'soft-bobo'
  | 'soft-kada' | 'soft-pangpang' | 'soft-titanium';

type BadgeVariant = 'default' | 'sticker' | 'pill' | 'outline';

interface BadgeProps {
  label:    string;
  color?:   BadgeColor;
  variant?: BadgeVariant;
  rotate?:  boolean;
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  ink:             'bg-chako-ink text-chako-cream',
  orange:          'bg-chako-orange text-chako-ink',
  linlin:          'bg-chako-linlin text-chako-ink',
  milkpod:         'bg-chako-milkpod text-white',
  bawang:          'bg-chako-bawang text-white',
  bobo:            'bg-chako-bobo text-white',
  kada:            'bg-chako-kada text-chako-ink',
  pangpang:        'bg-chako-pangpang text-white',
  titanium:        'bg-chako-titanium text-white',
  'soft-linlin':   'bg-chako-linlin-soft text-chako-ink',
  'soft-milkpod':  'bg-chako-milkpod-soft text-chako-milkpod',
  'soft-bawang':   'bg-chako-bawang-soft text-chako-bawang',
  'soft-bobo':     'bg-chako-bobo-soft text-chako-bobo',
  'soft-kada':     'bg-chako-kada-soft text-chako-kada',
  'soft-pangpang': 'bg-chako-pangpang-soft text-chako-pangpang',
  'soft-titanium': 'bg-chako-titanium-soft text-chako-titanium',
};

const variantClasses: Record<BadgeVariant, string> = {
  default: 'rounded-lg',
  sticker: 'rounded-lg shadow-sm',
  pill:    'rounded-full',
  outline: 'rounded-lg border-2 bg-transparent',
};

export function Badge({ label, color = 'ink', variant = 'default', rotate = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center',
        'font-sans font-bold text-[11px] uppercase tracking-widest',
        'px-2.5 py-1 leading-none',
        colorClasses[color],
        variantClasses[variant],
        rotate && 'sticker-rotate',
        className
      )}
    >
      {label}
    </span>
  );
}

export default Badge;
