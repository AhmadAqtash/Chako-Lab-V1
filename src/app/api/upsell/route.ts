import { NextResponse } from 'next/server';
import { getCartUpsellPool } from '@/lib/shopify';

// GET /api/upsell?lang=ar|en → the cart drawer's "Make it a set" pool, plus
// the drinkware family map the client needs to order it for a given cart.
//
// Fetched by the client because the drawer lives in the root layout, outside
// any page's data flow. Best-effort by design: on any failure the drawer simply
// renders without the slider — an upsell must never break the cart.
//
// Briefly CDN-cached. Stock can move inside that window, which is safe: the
// add-to-cart route re-checks availability and refuses a sold-out line.

// Reads ?lang from the request, so it can never be prerendered. Saying so
// up front keeps Next from attempting it at build time — an attempt whose
// bail-out error the catch below would otherwise swallow and log as a failure.
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const lang = new URL(req.url).searchParams.get('lang') === 'ar' ? 'AR' : 'EN';
    const pool = await getCartUpsellPool(lang);
    // An EMPTY pool is almost always the family index failing (a transient
    // Shopify error). Caching that at the edge would hide the slider for every
    // shopper for minutes — so only a real answer is cacheable.
    const cacheable = pool.items.length > 0;
    return NextResponse.json(pool, {
      headers: {
        'Cache-Control': cacheable ? 'public, s-maxage=120, stale-while-revalidate=600' : 'no-store',
      },
    });
  } catch (err) {
    console.error('[/api/upsell GET]', err);
    return NextResponse.json({ items: [], families: {} });
  }
}
