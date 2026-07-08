// Judge.me reviews, read from the SAME Shopify store (qpd26f-qg) that powers
// both sundooq.me (where the Judge.me app is installed) and this headless
// storefront — product IDs are shared, so no cross-store mapping is needed.
//
// Data source: Judge.me's public `reviews_for_widget` endpoint — the same JSON
// the on-store widget fetches from the browser, so it needs no API token.
// Everything is best-effort: any failure returns null and the PDP simply
// renders without a reviews section.

const STORE = process.env.SHOPIFY_STORE_DOMAIN || 'qpd26f-qg.myshopify.com';
const JUDGEME_ENDPOINT = 'https://judge.me/reviews/reviews_for_widget';
const PER_PAGE = 24; // plenty at current review volume; paginate later if needed

export interface JudgeMeReview {
  uuid: string;
  rating: number;
  title: string;
  /** Plain text with \n\n between paragraphs — body_html is stripped server-side */
  body: string;
  verifiedBuyer: boolean;
  createdAt: string;
  reviewerName: string;
  pictures: string[];
  reply: string | null;
}

export interface ProductReviewData {
  averageRating: number;
  count: number;
  histogram: { rating: number; frequency: number; percentage: number }[];
  reviews: JudgeMeReview[];
}

// Judge.me body_html is platform-sanitized, but we still refuse to render raw
// HTML: strip to plain text (paragraphs preserved) and decode common entities.
function htmlToText(html: string): string {
  return html
    .replace(/<\s*(?:\/p|br)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Fetch published reviews for a product. `productGid` is the Storefront API
 * gid (gid://shopify/Product/123...); Judge.me keys on the numeric part.
 * Returns null when the product has no reviews or Judge.me is unreachable.
 */
export async function getProductReviews(productGid: string): Promise<ProductReviewData | null> {
  const numericId = productGid.split('/').pop();
  if (!numericId || !/^\d+$/.test(numericId)) return null;

  const params = new URLSearchParams({
    url: STORE,
    shop_domain: STORE,
    platform: 'shopify',
    page: '1',
    per_page: String(PER_PAGE),
    product_id: numericId,
  });

  try {
    const res = await fetch(`${JUDGEME_ENDPOINT}?${params}`, {
      // Reviews change rarely; don't re-hit Judge.me on every 60s ISR pass
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();

    const count = Number(data?.number_of_reviews) || 0;
    if (count < 1 || !Array.isArray(data?.reviews)) return null;

    const reviews: JudgeMeReview[] = data.reviews
      .filter((r: Record<string, unknown>) => r && typeof r === 'object')
      .map((r: Record<string, unknown>): JudgeMeReview => ({
        uuid: String(r.uuid ?? ''),
        rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
        title: htmlToText(String(r.title ?? '')),
        body: htmlToText(String(r.body_html ?? '')),
        verifiedBuyer: r.verified_buyer === true,
        createdAt: String(r.created_at ?? ''),
        reviewerName: htmlToText(String(r.reviewer_name ?? '')) || 'Anonymous',
        pictures: Array.isArray(r.pictures_urls)
          ? (r.pictures_urls as unknown[]).map(String).filter((u) => u.startsWith('https://'))
          : [],
        reply: r.reply_content ? htmlToText(String(r.reply_content)) : null,
      }))
      // Rating-only reviews (no text) still render as star+name+date cards;
      // only reviews with no usable identity at all are dropped
      .filter((r: JudgeMeReview) => r.uuid && r.rating > 0);

    if (reviews.length === 0) return null;

    return {
      averageRating: Number(data.average_rating) || 0,
      count,
      histogram: Array.isArray(data.histogram)
        ? data.histogram.map((h: Record<string, unknown>) => ({
            rating: Number(h.rating) || 0,
            frequency: Number(h.frequency) || 0,
            percentage: Number(h.percentage) || 0,
          }))
        : [],
      reviews,
    };
  } catch {
    return null;
  }
}
