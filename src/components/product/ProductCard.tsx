'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/shopify';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem, isLoading } = useCart();
  const { t } = useLanguage();
  const variant = product.variants?.nodes?.[0];
  const inStock = variant?.availableForSale ?? true;
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange?.minVariantPrice;
  const discount = compareAt ? getDiscountPercent(compareAt, price) : 0;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!variant || !inStock) return;
    await addItem(variant.id);
  }

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group relative flex flex-col bg-chako-bg rounded-2xl overflow-hidden border border-black/5 hover:border-black/10 transition-all hover:shadow-md"
    >
      <div className="relative aspect-square bg-chako-accent overflow-hidden">
        {product.featuredImage ? (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-chako-accent" />
        )}

        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 rtl:left-auto rtl:right-2.5 bg-chako-dark text-chako-bg text-xs font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}

        {!inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-semibold text-chako-dark/50 bg-white px-3 py-1 rounded-full">
              {t('product_out_of_stock')}
            </span>
          </div>
        )}

        {inStock && variant && (
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className="absolute bottom-2.5 right-2.5 rtl:right-auto rtl:left-2.5 bg-chako-dark text-chako-bg p-2.5 rounded-full md:opacity-0 md:translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:bg-chako-dark/90 disabled:opacity-50"
            aria-label="Add to cart"
          >
            <ShoppingBag size={16} />
          </button>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <p className="text-xs text-chako-dark/40 font-medium mb-0.5">{product.productType}</p>
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 flex-1">{product.title}</h3>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-semibold text-sm">{formatPrice(price)}</span>
          {compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount) && (
            <span className="text-xs text-chako-dark/40 line-through">{formatPrice(compareAt)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
