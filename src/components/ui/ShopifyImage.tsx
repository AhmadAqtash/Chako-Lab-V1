'use client';

import Image, { type ImageProps } from 'next/image';

/**
 * next/image wrapper for Shopify-hosted images.
 *
 * Shopify's CDN already resizes and serves modern formats via its own
 * `?width=` transform params, so we route these images STRAIGHT to the
 * Shopify CDN and bypass Vercel's Image Optimization (which is metered —
 * product images × responsive widths × formats burn the quota fast).
 *
 * Local /public images keep the default next/image optimizer — only Shopify
 * URLs are handled here. Marked 'use client' so the loader function never has
 * to cross an RSC boundary (safe to render inside server components).
 */
function shopifyLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  if (!src.includes('cdn.shopify.com')) return src;
  try {
    const u = new URL(src);
    u.searchParams.set('width', String(width));
    return u.toString();
  } catch {
    return src;
  }
}

export default function ShopifyImage(props: ImageProps) {
  return <Image {...props} loader={shopifyLoader} />;
}
