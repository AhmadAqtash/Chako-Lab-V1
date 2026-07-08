import { cn } from '@/lib/utils';

// Pure SVG star row — server-safe, no client JS. Supports fractional fill
// (e.g. 4.5) via a per-star clip on the gold layer.
export default function ReviewStars({
  rating,
  size = 16,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn('inline-flex items-center gap-0.5 shrink-0', className)}
      role="img"
      aria-label={`${rating.toFixed(1)} / 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - (i - 1)));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="text-black/15" />
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star size={size} className="text-amber-400" />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

function Star({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2l2.94 6.26 6.87.88-5.05 4.73 1.3 6.8L12 17.35l-6.06 3.32 1.3-6.8-5.05-4.73 6.87-.88L12 2z" />
    </svg>
  );
}
