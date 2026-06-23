import Link from '@/components/ui/LocalizedLink';
import ShopifyImage from '@/components/ui/ShopifyImage';
import { Product } from '@/types/shopify';
import { cn, extractColorName } from '@/lib/utils';
import T from '@/components/ui/T';

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
      <p className="text-sm text-chako-ink/60">
        <T k="product_color" />: <span className="font-semibold text-chako-ink">{colorName ?? 'Default'}</span>
      </p>
      <div className="flex flex-wrap gap-2 items-center pl-0.5 md:pl-0">
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
                'relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 transition-[box-shadow,transform] active:scale-95 touch-manipulation',
                isActive
                  ? 'ring-2 ring-chako-ink ring-offset-2'
                  : 'ring-1 ring-black/10 hover:ring-2 hover:ring-chako-ink/40 hover:ring-offset-1'
              )}
            >
              {sibling.featuredImage ? (
                <ShopifyImage
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
            className="text-xs font-semibold text-chako-ink/50 hover:text-chako-ink transition-colors px-1"
          >
            +{overflow} more
          </Link>
        )}
      </div>
    </div>
  );
}
