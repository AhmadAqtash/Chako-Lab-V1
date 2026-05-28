'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Product, ProductVariant } from '@/types/shopify';
import { formatPrice, getDiscountPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';
import VariantSelector from './VariantSelector';
import AddToCartButton from './AddToCartButton';
import StickyATC from './StickyATC';
import TrustBadges from './TrustBadges';
import ColorSwatches from './ColorSwatches';
import { Minus, Plus, Share2, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const PUB_STORE = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const PUB_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const AR_PRODUCT_QUERY = `
  query GetProductAR($handle: String!) @inContext(language: AR) {
    product(handle: $handle) {
      title
      description
      descriptionHtml
    }
  }
`;

interface Props {
  product: Product;
  colorSiblings?: Product[];
  colorName?: string | null;
  collectionHandle?: string;
}

type Tab = 'Description' | 'Specs' | 'Shipping';

const SHIPPING_INFO = [
  { label: 'Standard (UAE)', value: '2–4 business days', sub: 'Free over AED 250' },
  { label: 'Express (Dubai)', value: 'Same / next day', sub: 'AED 25' },
  { label: 'GCC countries', value: '5–7 business days', sub: 'Calculated at checkout' },
];

export default function ProductDetails({ product, colorSiblings, colorName, collectionHandle }: Props) {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  // Client-side Arabic content: re-fetches translated title + description when
  // language is switched to Arabic without a full page reload, or when the
  // server didn't have the cookie yet on the first visit.
  const [arContent, setArContent] = useState<{ title: string; descriptionHtml: string } | null>(null);
  useEffect(() => {
    if (!isAr || !PUB_STORE || !PUB_TOKEN) { setArContent(null); return; }
    let cancelled = false;
    fetch(`https://${PUB_STORE}/api/2024-01/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': PUB_TOKEN,
      },
      body: JSON.stringify({ query: AR_PRODUCT_QUERY, variables: { handle: product.handle } }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const p = data.data?.product;
        if (p?.title) setArContent({ title: p.title, descriptionHtml: p.descriptionHtml ?? '' });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isAr, product.handle]);

  const displayTitle = (isAr && arContent?.title) ? arContent.title : product.title;
  const displayDescHtml = (isAr && arContent?.descriptionHtml) ? arContent.descriptionHtml : product.descriptionHtml;
  const displayDesc = (isAr && arContent?.descriptionHtml) ? '' : product.description;

  const TABS: { key: Tab; label: string }[] = [
    { key: 'Description', label: t('product_description') },
    { key: 'Specs', label: t('product_specs') },
    { key: 'Shipping', label: t('product_shipping') },
  ];

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
      <div className="flex flex-col gap-5 min-w-0">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold text-chako-dark/40 uppercase tracking-widest mb-1.5">
            {product.productType}
          </p>
          <div className="flex items-start justify-between gap-4 min-w-0">
            <h1 className="text-fluid-heading font-bold leading-tight min-w-0">{displayTitle}</h1>
            <button
              onClick={handleShare}
              className="flex-shrink-0 mt-1 p-2.5 rounded-full hover:bg-black/5 active:scale-95 transition-[transform,background-color] duration-150 text-chako-dark/40 hover:text-chako-dark touch-manipulation"
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
          <div className="flex items-center gap-1 bg-black/5 rounded-xl px-2 py-1.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/10 active:scale-90 transition-[transform,background-color] duration-150 disabled:opacity-30 touch-manipulation"
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-semibold text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/10 active:scale-90 transition-[transform,background-color] duration-150 disabled:opacity-30 touch-manipulation"
              disabled={quantity >= maxQty}
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
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
        <div className="border-t border-black/8 pt-4 min-w-0">
          <div className="flex gap-0 border-b border-black/8 mb-4">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  'flex-1 md:flex-none px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors touch-manipulation min-h-[48px]',
                  activeTab === key
                    ? 'border-chako-dark text-chako-dark'
                    : 'border-transparent text-chako-dark/45 hover:text-chako-dark'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'Description' && (
            <div className="text-sm text-chako-dark/65 leading-relaxed px-4 md:px-0">
              {displayDescHtml ? (
                <div
                  className="chako-description prose prose-sm max-w-none prose-p:leading-relaxed prose-ul:pl-4 prose-ol:pl-4 prose-li:marker:text-chako-dark/40"
                  dangerouslySetInnerHTML={{ __html: displayDescHtml }}
                />
              ) : displayDesc ? (
                <ul className="space-y-2">
                  {displayDesc
                    .split(/\.\s+|\n/)
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((sentence, i) => (
                      <li key={i} className="flex gap-2.5 items-start">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-chako-dark/40 flex-shrink-0" />
                        <span>{sentence.endsWith('.') ? sentence : `${sentence}.`}</span>
                      </li>
                    ))}
                </ul>
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
