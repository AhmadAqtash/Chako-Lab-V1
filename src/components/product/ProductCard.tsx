'use client';

import Link from '@/components/ui/LocalizedLink';
import ShopifyImage from '@/components/ui/ShopifyImage';
import { Product } from '@/types/shopify';
import { formatPrice, getDiscountPercent, cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/Badge';
import { useState } from 'react';

const isTitaniumHandle = (h: string) => /titanium|(^|-)ti(-|$)/i.test(h);

interface Props {
  product: Product;
}

// Map productType → series tint bg for the image area
const TYPE_BG: Record<string, string> = {
  'LinLin Kettle': 'bg-chako-linlin-soft',
  'Milk Pod':      'bg-chako-milkpod-soft',
  'Bawang Cup':    'bg-chako-bawang-soft',
  'Thermos Cup':   'bg-chako-bobo-soft',
  'Kada Bottle':   'bg-chako-kada-soft',
  'PangPang Cup':  'bg-chako-pangpang-soft',
};

export default function ProductCard({ product }: Props) {
  const { addItem, isLoading } = useCart();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [pressing, setPressing] = useState(false);

  const variant = product.variants?.nodes?.[0];
  const inStock = variant?.availableForSale ?? true;
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange?.minVariantPrice;
  const discount = compareAt ? getDiscountPercent(compareAt, price) : 0;

  const imgBg = TYPE_BG[product.productType] ?? 'bg-chako-titanium-soft';
  const isTitanium = isTitaniumHandle(product.handle);

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!variant || !inStock) return;
    setPressing(true);
    await addItem(variant.id);
    setTimeout(() => setPressing(false), 300);
  }

  return (
    <Link
      href={`/products/${product.handle}`}
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-[border-color,box-shadow,transform] duration-300 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isTitanium
          ? 'bg-[#1F232B] border border-white/10 hover:border-white/20 focus-visible:ring-white/40'
          : 'bg-chako-bg border border-black/[0.06] hover:border-black/[0.12] focus-visible:ring-chako-ink'
      )}
    >
      {/* Image area */}
      <div className={cn('relative aspect-[4/5] overflow-hidden', isTitanium ? 'bg-white' : imgBg)}>
        {product.featuredImage ? (
          <ShopifyImage
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className={cn('w-full h-full', imgBg)} />
        )}

        {/* Sale badge */}
        {discount > 0 && (
          <div className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5">
            <Badge label={`-${discount}%`} color="bawang" variant="pill" />
          </div>
        )}

        {/* Titanium premium badge — real Ti icon + sheen */}
        {isTitanium && (
          <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 z-10 w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden shadow-lg ring-1 ring-white/30"
               style={{ background: 'radial-gradient(circle at 35% 30%, #3A4150, #15171C)' }}>
            <img
              src="/titanium/ti-badge-white.png"
              alt="Titanium"
              className="absolute inset-0 w-full h-full object-contain p-1.5"
            />
            <span className="ti-badge-sheen absolute inset-y-0 -left-1/2 w-1/2 block"
                  style={{ background: 'linear-gradient(115deg, transparent, rgba(255,255,255,0.6), transparent)' }} />
          </div>
        )}

        {/* Sold out overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <Badge
              label={isAr ? 'غير متوفر' : 'Sold Out'}
              color="ink"
              variant="sticker"
              rotate
            />
          </div>
        )}
      </div>

      {/* Product info */}
      <div className={cn('p-3 flex-1 flex flex-col gap-1', isTitanium && 'bg-[#1F232B]')}>
        <p className={cn('text-[10px] font-medium uppercase tracking-wider', isTitanium ? 'text-white/45' : 'text-chako-ink/40')}>
          {product.productType}
        </p>
        <h3 className={cn('text-sm font-semibold leading-snug line-clamp-2 flex-1', isTitanium ? 'text-white' : 'text-chako-ink')}>
          {product.title}
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
          <span className={cn('font-display font-bold text-sm', isTitanium ? 'text-white' : 'text-chako-ink')}>
            {formatPrice(price)}
          </span>
          {compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount) && (
            <span className="text-xs text-chako-ink/40 line-through">
              {formatPrice(compareAt)}
            </span>
          )}
        </div>
      </div>

      {/* ATC button: always visible on mobile, hover-reveal on desktop */}
      {inStock && variant && (
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          style={{
            transform: pressing ? 'scale(0.97)' : undefined,
            transition: 'transform 150ms ease-out, opacity 200ms ease',
          }}
          className={cn(
            'w-full flex items-center justify-center gap-2',
            'py-3 text-xs font-semibold uppercase tracking-wider',
            isTitanium ? 'bg-white text-[#1F232B]' : 'bg-chako-ink text-chako-cream',
            'touch-manipulation cursor-pointer',
            'disabled:opacity-50',
            'md:opacity-0 md:group-hover:opacity-100',
            'transition-opacity duration-200'
          )}
          aria-label={isAr ? 'أضف إلى السلة' : 'Add to cart'}
        >
          <ShoppingBag size={13} />
          {isAr ? 'أضف للسلة' : 'Add to Cart'}
        </button>
      )}
    </Link>
  );
}
