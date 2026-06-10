// Single source of truth for the Shopify Storefront API version.
// Kept in its own module (no server-only imports) so both server code
// (lib/shopify.ts, lib/storefront.ts) and client components that call the
// Storefront API directly can share it without bloating the client bundle.
//
// Shopify supports each quarterly version for ~12 months — review this
// constant at least once a year.
export const SHOPIFY_API_VERSION = '2025-10';
