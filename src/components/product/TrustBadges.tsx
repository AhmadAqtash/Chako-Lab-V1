import { Truck, RotateCcw, Shield, CreditCard, Clock } from 'lucide-react';

const BADGES = [
  { Icon: Truck, label: 'Free shipping', sub: 'Orders over AED 250' },
  { Icon: RotateCcw, label: 'Easy returns', sub: '14-day policy' },
  { Icon: Shield, label: 'Authentic', sub: '100% genuine' },
  { Icon: CreditCard, label: 'Secure checkout', sub: 'SSL encrypted' },
];

export default function TrustBadges() {
  return (
    <div className="flex flex-col gap-2 pt-2">
      <div className="grid grid-cols-2 gap-2">
        {BADGES.map(({ Icon, label, sub }) => (
          <div
            key={label}
            className="flex items-start gap-2.5 bg-chako-accent rounded-xl px-3 py-2.5"
          >
            <Icon size={16} className="flex-shrink-0 mt-0.5 text-chako-dark/50" />
            <div>
              <p className="text-xs font-semibold">{label}</p>
              <p className="text-[11px] text-chako-dark/45 leading-tight">{sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2.5 bg-chako-highlight/30 rounded-xl px-3 py-2.5">
        <Clock size={16} className="flex-shrink-0 text-chako-dark/50" />
        <div>
          <p className="text-xs font-semibold">Order before 2PM</p>
          <p className="text-[11px] text-chako-dark/45 leading-tight">For next-day delivery</p>
        </div>
      </div>
    </div>
  );
}
