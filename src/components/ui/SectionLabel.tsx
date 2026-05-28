/*
  SectionLabel — Phase 1 primitive
  ────────────────────────────────────────────────────────
  The small uppercase wide-tracking eyebrow that sits above
  a section headline. Use sparingly: max 1 per 3 sections.

  Usage:
    <SectionLabel>Featured Series</SectionLabel>
    <SectionLabel color="bobo">BoBo Tumblers</SectionLabel>
*/

import { cn } from '@/lib/utils';

type LabelColor = 'muted' | 'ink' | 'orange' | 'linlin' | 'milkpod' | 'bawang' | 'bobo' | 'kada' | 'pangpang' | 'titanium';

interface SectionLabelProps {
  children:  React.ReactNode;
  color?:    LabelColor;
  className?: string;
}

const colorClasses: Record<LabelColor, string> = {
  muted:    'text-chako-ink/40',
  ink:      'text-chako-ink',
  orange:   'text-chako-orange',
  linlin:   'text-chako-linlin',
  milkpod:  'text-chako-milkpod',
  bawang:   'text-chako-bawang',
  bobo:     'text-chako-bobo',
  kada:     'text-chako-kada',
  pangpang: 'text-chako-pangpang',
  titanium: 'text-chako-titanium',
};

export function SectionLabel({ children, color = 'muted', className }: SectionLabelProps) {
  return (
    <p
      className={cn(
        'font-sans font-semibold uppercase tracking-widest',
        'text-label leading-none',
        colorClasses[color],
        className
      )}
    >
      {children}
    </p>
  );
}

export default SectionLabel;
