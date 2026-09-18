// Picks ONE real customer quote to sit under the purchase buttons.
//
// A quote in the buy box is store advertising, so the bar is higher than for
// the reviews section below it:
//   - shown WHOLE or not at all — never trimmed, clamped or paraphrased;
//   - verified buyers only;
//   - nothing the store cannot stand behind: a review that mentions delivery
//     speed, price, offers, or ANY number is skipped. ("Arrived next day" is a
//     shipping promise in a customer's mouth; "ice for 2 days" is a performance
//     claim beyond the spec sheet.) Over-filtering is the safe direction;
//   - no fallback to another product's review. No candidate → render nothing.
//
// Pure and deterministic, so the same visit always sees the same quote.

export interface QuotableReview {
  uuid: string;
  rating: number;
  body: string;
  verifiedBuyer: boolean;
  reviewerName: string;
  /** Colourway the review was written for; null = the product being viewed. */
  writtenFor: string | null;
}

export interface ReviewQuote {
  uuid: string;
  text: string;
  name: string;
  writtenFor: string | null;
}

const MIN_LEN = 40;
const MAX_LEN = 150;
const ARABIC = /[؀-ۿ]/;
const ANONYMOUS = /^(anonymous|anon|مجهول)?$/i;

const CLAIM_FILTERS: RegExp[] = [
  // delivery / shipping / speed
  /deliver|shipp|arriv|courier|same[\s-]?day|next[\s-]?day|express|overnight|fast|quick/i,
  /توصيل|شحن|وصل|وصول|مندوب|نفس اليوم|اليوم التالي|سريع/,
  // price / offers / payment
  /discount|coupon|promo|code|free gift|cash on delivery|\bcod\b|price|cheap|aed|dirham/i,
  /خصم|كوبون|كود|هدية مجانية|الدفع عند الاستلام|سعر|رخيص|درهم/,
  // any digit at all, either script
  /[\d٠-٩]/,
];

/**
 * Owner pins: family key → review uuid. A pin is honoured only if that review
 * passes every rule above. Empty by default. (All live reviews are 5-star, and
 * a perfect record is believed through specifics — this lets Ahmad choose the
 * specific one.)
 */
export const PINNED_QUOTES: Record<string, string> = {};

function qualifies(r: QuotableReview): string | null {
  if (r.rating !== 5 || !r.verifiedBuyer) return null;
  // One paragraph only — a multi-paragraph review cannot be shown whole, and
  // showing part of it would be editing the customer.
  if (/\n/.test(r.body.trim())) return null;
  const text = r.body.trim().replace(/\s+/g, ' ');
  if (text.length < MIN_LEN || text.length > MAX_LEN) return null;
  if (CLAIM_FILTERS.some((re) => re.test(text))) return null;
  return text;
}

export function pickReviewQuote(
  reviews: readonly QuotableReview[],
  isAr: boolean,
  pinnedUuid?: string | null
): ReviewQuote | null {
  const toQuote = (r: QuotableReview, text: string): ReviewQuote => ({
    uuid: r.uuid,
    text,
    name: r.reviewerName.trim(),
    writtenFor: r.writtenFor,
  });

  if (pinnedUuid) {
    const pinned = reviews.find((r) => r.uuid === pinnedUuid);
    const text = pinned ? qualifies(pinned) : null;
    if (pinned && text) return toQuote(pinned, text);
  }

  let best: { r: QuotableReview; text: string; score: number } | null = null;
  for (const r of reviews) {
    const text = qualifies(r);
    if (!text) continue;

    let score = 0;
    // A quote the shopper can actually read outranks one they cannot
    if (ARABIC.test(text) === isAr) score += 3;
    // Written for THIS colourway beats a sibling's review
    if (r.writtenFor === null) score += 2;
    // A name is part of why a quote is believed: "— Anonymous" is the weakest
    // attribution there is, so a named reviewer wins when one exists
    if (!ANONYMOUS.test(r.reviewerName.trim())) score += 1.5;
    // Prefer substance — peak around 90 characters
    score += 1 - Math.abs(text.length - 90) / 90;

    if (!best || score > best.score || (score === best.score && r.uuid < best.r.uuid)) {
      best = { r, text, score };
    }
  }
  return best ? toQuote(best.r, best.text) : null;
}
