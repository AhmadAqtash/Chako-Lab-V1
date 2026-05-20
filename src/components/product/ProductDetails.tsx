'use client';

import { useState, useCallback, useRef } from 'react';
import { Product, ProductVariant } from '@/types/shopify';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';
import VariantSelector from './VariantSelector';
import AddToCartButton from './AddToCartButton';
import StickyATC from './StickyATC';
import TrustBadges from './TrustBadges';
import ColorSwatches from './ColorSwatches';
import { Minus, Plus, Share2, Check } from 'lucide-react';

interface Props {
  product: Product;
  colorSiblings?: Product[];
  colorName?: string | null;
  collectionHandle?: string;
}

const TABS = ['Description', 'Specs', 'Shipping'] as const;
type Tab = (typeof TABS)[number];

const SHIPPING_INFO = [
  { label: 'Standard (UAE)', value: '2–4 business days', sub: 'Free over AED 250' },
  { label: 'Express (Dubai)', value: 'Same / next day', sub: 'AED 25' },
  { label: 'GCC countries', value: '5–7 business days', sub: 'Calculated at checkout' },
];

export default function ProductDetails({ product, colorSiblings, colorName, collectionHandle }: Props) {
  const getInitialSelection = useCallback((): Record<string, string> => {
    const init: Record<string, string> = {};
    product.options.forEach((opt) => { init[opt.name] = opt.values[0]; });
    return init;
  }, [product.options]);

  const [selected, setSelected] = useState<Record<string, string>>(getInitialSelection);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('Description');
  const [copied, setCopied] = useState(false);
  const atcRef = useRef<HTMLDivElement>(null);

  const selectedVariant: ProductVariant | undefined = product.variants.nodes.find((v) =>
    v.selectedOptions.every((opt) => selected[opt.name] === opt.value)
  );

  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const compareAt = selectedVariant?.compareAtPrice ?? product.compareAtPriceRange?.minVariantPrice;
  const discount = compareAt ? getDiscountPercent(compareAt, price) : 0;
  const maxQty = selectedVariant?.quantityAvailable ?? 99;

  const hasOptions =
    product.options.length > 1 ||
    (product.options.length === 1 && product.options[0].values[0] !== 'Default Title');

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Parse tags for spec hints (e.g. "capacity:500ml", "material:Stainless Steel")
  const specTags = product.tags
    .map((t) => {
      const [key, val] = t.split(':');
      return val ? { key: key.replace(/-/g, ' '), val } : null;
    })
    .filter(Boolean) as { key: string; val: string }[];

  return (
    <>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold text-chako-dark/40 uppercase tracking-widest mb-1.5">
            {product.productType}
          </p>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{product.title}</h1>
            <button
              onClick={handleShare}
              className="flex-shrink-0 mt-1 p-2 rounded-full hover:bg-black/5 transition-colors text-chako-dark/40 hover:text-chako-dark"
              aria-label="Share"
            >
              {copied ? <Check size={18} className="text-green-600" /> : <Share2 size={18} />}
            </button>
          </div>
        </div>

        {/* Color swatches */}
        {colorSiblings && colorSiblings.length > 1 && (
          <ColorSwatches
            siblings={colorSiblings}
            currentHandle={product.handle}
            colorName={colorName ?? null}
            collectionHandle={collectionHandle}
          />
        )}

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold">{formatPrice(price)}</span>
          {discount > 0 && compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount) && (
            <>
              <span className="text-base text-chako-dark/40 line-through">{formatPrice(compareAt)}</span>
              <span className="text-xs font-bold bg-chako-highlight text-chako-dark px-2.5 py-0.5 rounded-full">
                Save {discount}%
              </span>
            </>
          )}
        </div>

        {/* Variant selector */}
        {hasOptions && (
          <VariantSelector
            options={product.options.filter((o) => o.name !== 'Title')}
            variants={product.variants.nodes}
            selected={selected}
            onChange={(name, value) => setSelected((prev) => ({ ...prev, [name]: value }))}
          />
        )}

        {/* Quantity + ATC */}
        <div ref={atcRef} className="flex gap-3">
          <div className="flex items-center gap-2 bg-black/5 rounded-xl px-3 py-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="p-1 rounded-lg hover:bg-black/10 transition-colors disabled:opacity-30"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="w-7 text-center font-semibold text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              className="p-1 rounded-lg hover:bg-black/10 transition-colors disabled:opacity-30"
              disabled={quantity >= maxQty}
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="flex-1">
            {selectedVariant ? (
              <AddToCartButton
                variantId={selectedVariant.id}
                available={selectedVariant.availableForSale}
                quantityAvailable={selectedVariant.quantityAvailable}
                quantity={quantity}
              />
            ) : (
              <button disabled className="w-full py-4 bg-black/5 text-chako-dark/40 font-semibold rounded-2xl text-sm cursor-not-allowed">
                Select options
              </button>
            )}
          </div>
        </div>

        {/* Trust badges */}
        <TrustBadges />

        {/* Tabs */}
        <div className="border-t border-black/8 pt-4">
          <div className="flex gap-0 border-b border-black/8 mb-4">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                  activeTab === tab
                    ? 'border-chako-dark text-chako-dark'
                    : 'border-transparent text-chako-dark/45 hover:text-chako-dark'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Description' && (
            <div className="text-sm text-chako-dark/65 leading-relaxed px-4 md:px-0">
              {product.descriptionHtml ? (
                <div
                  className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-2 prose-ul:pl-4 prose-ol:pl-4 prose-li:marker:text-chako-dark/40"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              ) : product.description ? (
                <p>{product.description}</p>
              ) : (
                <p className="text-chako-dark/35 italic">No description available.</p>
              )}
            </div>
          )}

          {activeTab === 'Specs' && (
            <div className="space-y-0">
              {specTags.length > 0 ? (
                specTags.map(({ key, val }) => (
                  <div
                    key={key}
                    className="flex justify-between py-2.5 border-b border-black/5 last:border-0"
                  >
                    <span className="text-sm text-chako-dark/50 capitalize">{key}</span>
                    <span className="text-sm font-medium text-right max-w-[55%]">{val}</span>
                  </div>
                ))
              ) : (
                <>
                  {[
                    { label: 'Product Type', value: product.productType },
                    { label: 'Vendor', value: product.vendor },
                    { label: 'SKU', value: selectedVariant?.id.split('/').pop() ?? '—' },
                    ...(product.tags.length
                      ? [{ label: 'Tags', value: product.tags.join(', ') }]
                      : []),
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex justify-between py-2.5 border-b border-black/5 last:border-0"
                    >
                      <span className="text-sm text-chako-dark/50">{label}</span>
                      <span className="text-sm font-medium text-right max-w-[55%]">{value}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'Shipping' && (
            <div className="space-y-3">
              {SHIPPING_INFO.map(({ label, value, sub }) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 py-2.5 border-b border-black/5 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-chako-dark/45 mt-0.5">{sub}</p>
                  </div>
                  <span className="text-sm text-chako-dark/70 flex-shrink-0">{value}</span>
                </div>
              ))}
              <p className="text-xs text-chako-dark/35 pt-1">
                Orders placed before 3pm GST typically ship same day.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky ATC (mobile, appears when ATC button scrolls out) */}
      {selectedVariant && (
        <StickyATC
          title={product.title}
          price={price}
          variantId={selectedVariant.id}
          available={selectedVariant.availableForSale}
          triggerRef={atcRef as React.RefObject<HTMLElement>}
          featuredImage={product.featuredImage?.url}
        />
      )}
    </>
  );
}
