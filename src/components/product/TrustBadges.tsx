import { Truck, RotateCcw, Shield, CreditCard, Clock } from 'lucide-react';

const BADGES: { Icon: React.ElementType; label: string; sub: string; wide?: boolean; highlight?: boolean }[] = [
  { Icon: Truck, label: 'Free shipping', sub: 'Orders over AED 250' },
  { Icon: RotateCcw, label: 'Easy returns', sub: '14-day policy' },
  { Icon: Shield, label: 'Authentic', sub: '100% genuine' },
  { Icon: CreditCard, label: 'Secure checkout', sub: 'SSL encrypted' },
  { Icon: Clock, label: 'Order before 2PM', sub: 'For next-day delivery', wide: true, highlight: true },
];

import React from 'react';

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-2 pt-2">
      {BADGES.map(({ Icon, label, sub, wide, highlight }) => (
        <div
          key={label}
          className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 ${wide ? 'col-span-2' : ''} ${highlight ? 'bg-chako-highlight/30' : 'bg-chako-accent'}`}
        >
          <Icon size={16} className="flex-shrink-0 mt-0.5 text-chako-dark/50" />
          <div>
            <p className="text-xs font-semibold">{label}</p>
            <p className="text-[11px] text-chako-dark/45 leading-tight">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
