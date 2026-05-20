import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/shopify';
import { cn, extractColorName } from '@/lib/utils';

interface Props {
  siblings: Product[];
  currentHandle: string;
  colorName: string | null;
  collectionHandle?: string;
}

const MAX_VISIBLE = 8;

export default function ColorSwatches({ siblings, currentHandle, colorName, collectionHandle }: Props) {
  if (siblings.length <= 1) return null;

  const visible = siblings.slice(0, MAX_VISIBLE);
  const overflow = siblings.length - MAX_VISIBLE;

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm text-chako-dark/60">
        Color: <span className="font-semibold text-chako-dark">{colorName ?? 'Default'}</span>
      </p>
      <div className="flex flex-wrap gap-2 items-center">
        {visible.map((sibling) => {
          const isActive = sibling.handle === currentHandle;
          const isOOS = sibling.variants.nodes.every((v) => !v.availableForSale);
          const siblingColor = extractColorName(sibling.title);

          return (
            <Link
              key={sibling.handle}
              href={`/products/${sibling.handle}`}
              title={siblingColor ?? sibling.title}
              className={cn(
                'relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 transition-shadow',
                isActive
                  ? 'ring-2 ring-chako-dark ring-offset-2'
                  : 'ring-1 ring-black/10 hover:ring-2 hover:ring-chako-dark/40 hover:ring-offset-1'
              )}
            >
              {sibling.featuredImage ? (
                <Image
                  src={sibling.featuredImage.url}
                  alt={sibling.title}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="w-full h-full bg-chako-accent" />
              )}

              {isOOS && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to bottom right, transparent calc(50% - 1px), rgba(0,0,0,0.5) calc(50% - 1px), rgba(0,0,0,0.5) calc(50% + 1px), transparent calc(50% + 1px))',
                  }}
                />
              )}
            </Link>
          );
        })}

        {overflow > 0 && collectionHandle && (
          <Link
            href={`/collections/${collectionHandle}`}
            className="text-xs font-semibold text-chako-dark/50 hover:text-chako-dark transition-colors px-1"
          >
            +{overflow} more
          </Link>
        )}
      </div>
    </div>
  );
}
