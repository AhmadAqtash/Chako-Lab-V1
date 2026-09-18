// Thin wrapper over the GTM dataLayer already loaded by the root layout.
//
// Exists so the conversion work can be MEASURED: before this, the site pushed
// nothing on add-to-cart, so there was no baseline for add-to-cart rate or
// cart→checkout rate, and no way to attribute a lift.
//
// Event names are GA4's RECOMMENDED ecommerce events (view_item, add_to_cart,
// view_cart, begin_checkout…): they fill GA4's built-in funnel reports and map
// to Meta AddToCart / InitiateCheckout in GTM with no custom work. Only
// `free_shipping_unlocked` is custom. Every custom parameter needs a GA4 custom
// dimension, so the list is short on purpose.
//
// Never throws and never blocks: analytics must not be able to break a sale.

export type TrackEvent =
  | 'view_item'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'view_cart'
  | 'view_item_list'
  | 'select_item'
  | 'begin_checkout'
  | 'free_shipping_unlocked';

export type AtcSource =
  | 'pdp_button'
  | 'pdp_sticky'
  | 'pdp_buy_now'
  | 'cart_set_slider'
  | 'product_card'
  | 'other';

export interface TrackItem {
  item_id: string;
  item_group_id?: string;
  item_name: string;
  item_brand: 'Chako Lab';
  item_variant?: string;
  item_category?: string;
  price: number;
  quantity: number;
  index?: number;
}

/** 'gid://shopify/ProductVariant/123' → '123' */
export const numericId = (gid: string) => gid.split('/').pop() ?? gid;

type DataLayer = Record<string, unknown>[];
const layer = (): DataLayer | null =>
  typeof window === 'undefined' ? null : ((window as unknown as { dataLayer?: DataLayer }).dataLayer ?? null);

export function track(event: TrackEvent, payload: Record<string, unknown> = {}): void {
  try {
    const dl = layer();
    if (!dl) return;
    // GA4: clear the previous ecommerce object so items never leak across events
    if ('ecommerce' in payload) dl.push({ ecommerce: null });
    dl.push({ event, ...payload });
  } catch {
    // swallow — see header
  }
}

/**
 * Track, THEN navigate. For the two events fired immediately before leaving
 * the page (begin_checkout from the drawer and from Buy it now) — otherwise the
 * hit is often lost, especially inside the Instagram webview. `fn` runs exactly
 * once: on GTM's eventCallback, or after 350ms, whichever comes first.
 */
export function trackThen(event: TrackEvent, payload: Record<string, unknown>, fn: () => void): void {
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    fn();
  };
  try {
    const dl = layer();
    if (!dl) return go();
    if ('ecommerce' in payload) dl.push({ ecommerce: null });
    dl.push({ event, ...payload, eventCallback: go, eventTimeout: 300 });
    setTimeout(go, 350);
  } catch {
    go();
  }
}
