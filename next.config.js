/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // WebP-only (dropped AVIF): halves Vercel Image-Optimization transforms for
    // the few local images still optimized here. Shopify product images bypass
    // this entirely via the ShopifyImage loader (served + sized by Shopify CDN).
    formats: ['image/webp'],
    // Trimmed from the 8 default deviceSizes / 8 imageSizes → fewer width
    // variants generated per source image (lower transform count, same look).
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [64, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
