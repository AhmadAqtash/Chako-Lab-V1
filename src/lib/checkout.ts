// Shopify checkout URL in the storefront's current language.
// Shared by the cart drawer's Checkout button and the PDP's Buy it now.
export function checkoutHref(url: string, language: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set('locale', language);
    return u.toString();
  } catch {
    return url;
  }
}
