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
// 30 is Judge.me's real ceiling — anything larger silently clamps to 30, and a
// non-integer clamps to 1 (which would return a single review with no error).
const PER_PAGE = 30;
// Reviews shown on a pooled family list. The largest family is 7 products; at
// 34 reviews store-wide nothing is close, but an unbounded list would be a
// rendering cliff the day a product goes viral.
const MAX_POOLED = 60;

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
  /**
   * The colourway this review was actually written for, e.g. "Yellow & Blue".
   * Null when the review is for the product being viewed. Set only on pooled
   * family lists so a shopper always knows which colour was reviewed.
   */
  writtenFor: string | null;
}

export interface ProductReviewData {
  averageRating: number;
  count: number;
  histogram: { rating: number; frequency: number; percentage: number }[];
  reviews: JudgeMeReview[];
  /** How many colourways contributed. 1 = this product only; >1 = pooled family. */
  colourwaysPooled: number;
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
        // pictures_urls entries are OBJECTS ({original, huge, compact, small}),
        // not strings. The old String(...) cast produced "[object Object]",
        // which then failed the https:// guard — so EVERY review photo was
        // silently dropped and none had ever rendered.
        pictures: Array.isArray(r.pictures_urls)
          ? (r.pictures_urls as unknown[])
              .map((pic) => {
                if (typeof pic === 'string') return pic;
                const o = pic as Record<string, unknown> | null;
                return typeof o?.original === 'string'
                  ? o.original
                  : typeof o?.huge === 'string'
                    ? o.huge
                    : '';
              })
              .filter((u) => u.startsWith('https://'))
          : [],
        reply: r.reply_content ? htmlToText(String(r.reply_content)) : null,
        writtenFor: null,
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
      colourwaysPooled: 1,
    };
  } catch {
    return null;
  }
}

// ─── Family pooling ───────────────────────────────────────────────────────────

/**
 * Summary + histogram computed FROM the reviews, not by summing each response's
 * top-level fields.
 *
 * Averaging the per-product averages is the classic mean-of-means bug: a
 * product with one 3★ review and one with nine 5★ reviews averages to 4.0
 * instead of the true 4.8. It is invisible in this catalogue today because
 * every one of the 34 live reviews is 5★ — it would start lying silently on the
 * first 4★ review. Deriving is also correct if Judge.me server-side grouping is
 * ever switched on, where summing counts would double-count.
 */
function summarise(reviews: JudgeMeReview[], colourwaysPooled: number): ProductReviewData {
  const count = reviews.length;
  const total = reviews.reduce((s, r) => s + r.rating, 0);
  const freq = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    frequency: reviews.filter((r) => r.rating === rating).length,
  }));

  return {
    averageRating: count ? total / count : 0,
    count,
    histogram: freq.map((h) => ({
      ...h,
      percentage: count ? Math.round((h.frequency / count) * 100) : 0,
    })),
    reviews,
    colourwaysPooled,
  };
}

export interface FamilyReviewTarget {
  readonly gid: string;
  /** Colourway label for attribution, e.g. "Yellow & Blue". Null for the product being viewed. */
  readonly colourway: string | null;
}

/**
 * Reviews for a whole product family — every colourway of the same product,
 * pooled onto one PDP.
 *
 * Judge.me's public widget endpoint serves ONE product per request (comma
 * lists, product_ids and repeated product_id[] were all tested and return the
 * wrong thing), so this fans out and merges. The endpoint 429s under burst, so
 * a member that fails is simply skipped: a partial pool is a better PDP than no
 * reviews at all, and the per-request 5s timeout still bounds the render.
 */
export async function getFamilyReviews(
  targets: readonly FamilyReviewTarget[]
): Promise<ProductReviewData | null> {
  if (targets.length === 0) return null;
  if (targets.length === 1) return getProductReviews(targets[0].gid);

  const settled = await Promise.all(
    targets.map(async (t) => {
      const data = await getProductReviews(t.gid).catch(() => null);
      return data
        ? data.reviews.map((r) => ({ ...r, writtenFor: t.colourway }))
        : [];
    })
  );

  // Dedupe by uuid: if Judge.me grouping is ever enabled server-side, siblings
  // return each other's reviews and the same one would otherwise appear twice.
  const seen = new Set<string>();
  const merged: JudgeMeReview[] = [];
  for (const r of settled.flat()) {
    if (seen.has(r.uuid)) continue;
    seen.add(r.uuid);
    merged.push(r);
  }
  if (merged.length === 0) return null;

  merged.sort((a, b) => {
    const ta = Date.parse(a.createdAt), tb = Date.parse(b.createdAt);
    // Undated reviews sink rather than randomly leading the list
    if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
    if (Number.isNaN(ta)) return 1;
    if (Number.isNaN(tb)) return -1;
    return tb - ta;
  });

  const contributing = settled.filter((rs) => rs.length > 0).length;
  return summarise(merged.slice(0, MAX_POOLED), contributing);
}
