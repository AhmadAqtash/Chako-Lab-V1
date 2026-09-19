// Picks ONE real customer quote to sit under the purchase buttons.
//
// A quote in the buy box is store ADVERTISING, so the bar is far higher than
// for the reviews section below it. Two independent guards:
//
// 1. APPROVAL (the real guard). A review can only appear here if its id is in
//    APPROVED_QUOTES — i.e. a person has read it. Keyword filters are inherently
//    bypassable ("got mine the same evening" names no listed word, yet claims a
//    same-day delivery this store never offers), and the first version of this
//    file proved the other failure too: it auto-picked "Great but I lost my cap.
//    I wish it was some who connected" — five stars, verified, and a complaint —
//    for the best-selling PangPang page. With ~34 reviews store-wide, reading
//    them is cheaper than being wrong once.
//
// 2. FILTERS (the backstop, applied even to approved and pinned reviews):
//    - shown WHOLE or not at all — never trimmed, clamped or paraphrased;
//    - 5 stars, verified buyer, one paragraph, 40–150 characters;
//    - no claim the store cannot stand behind: delivery speed, price, offers,
//      or ANY number ("ice for two days" is a performance claim beyond the
//      spec sheet). Over-filtering is the safe direction;
//    - no reservations: "but", "wish", "lost", "leaks"… a quote with a caveat
//      is not an endorsement.
//
// No fallback to another product's review. No candidate → render nothing.
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

/**
 * Judge.me review ids a person has read and cleared for the buy box.
 * To add one: read the review on the product page, make sure you would be happy
 * to see it in an advert, then add its uuid here. (Approved reviews still have
 * to pass every filter below.)
 */
export const APPROVED_QUOTES: ReadonlySet<string> = new Set<string>([
  // Seeded 19 Sep 2026 from a scan of all 37 live reviews: exactly four were
  // 5-star + verified + one paragraph + 40–150 chars, and these are the three
  // that are unreservedly positive. (The fourth was the lost-cap complaint.)
  '494837f2-5eb5-44e7-8b7b-703214983c16', // Divya · LinLin Kettle (White & Blue) — "Love my bottle & I've introduced the brand to many of the friends…"
  'fbb58d92-b36c-4908-9f5d-e65d8cf70546', // Tina Goubran · Bawang Cup (White & Blue) — "Its an amazing water bottle! I love using it so much!"
  'cb033a43-093e-4e85-bcf0-f8ae8518fc51', // Anonymous · PangPang Cup (Yellow & Blue) — "love it! the quality and size are better in person…"
]);

/** Owner pins: family key → review uuid. Must also be approved and pass the filters. */
export const PINNED_QUOTES: Record<string, string> = {};

const MIN_LEN = 40;
const MAX_LEN = 150;
const ARABIC = /[؀-ۿ]/;
const ANONYMOUS = /^(anonymous|anon|مجهول)?$/i;

// JavaScript's \b is ASCII-only, so the Arabic patterns carry no word boundaries.
const CLAIM_FILTERS: RegExp[] = [
  // any numeral in any script (Latin, Arabic-Indic, Persian/Urdu, fullwidth, ½, ²…).
  // Built with the constructor: the project type-checks at an ES5 target, which
  // rejects the `u` flag on a regex LITERAL — every runtime we ship to has it.
  new RegExp('\\p{N}', 'u'),
  // delivery / speed
  /deliver|shipp|arriv|courier|same[\s-]?day|next[\s-]?day|express|overnight|fast|quick/i,
  /\b(receiv\w*|got (it|mine|them)|came|reach\w*|showed up|turned up|within|hours?|minutes?|(next|following|same)[\s-]?(morning|afternoon|evening|night)|speedy|prompt\w*|rapid|instant\w*)\b/i,
  /توصيل|شحن|وصل|وصول|مندوب|نفس اليوم|اليوم التالي|سريع|استلم|وصلني|جاني|جتني|ثاني يوم|اليوم الثاني|يومين|يوم واحد|ساعة|ساعات|ساعتين/,
  // price / offers / payment
  /discount|coupon|promo|code|free gift|cash on delivery|\bcod\b|price|cheap|aed|dirham/i,
  /\b(sale|offer\w*|deal|bargain|steal|half off|buy one|bogo|worth|money|paid|cost\w*|expensive|afford\w*|value)\b/i,
  /خصم|كوبون|كود|هدية مجانية|الدفع عند الاستلام|سعر|رخيص|درهم|عرض|تخفيض|مجان|غالي|فلوس/,
  // a number spelled out and attached to a time unit ("two whole days", "a week")
  /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|couple|few|several|half|a|an)\s+(whole\s+|full\s+)?(hour|day|night|week|month)s?\b/i,
  /\b\w+ (hour|day|week)s\b/i,
];

const RESERVATION_FILTERS: RegExp[] = [
  /\b(but|however|although|though|except|wish(ed|es)?|lost|lose|losing|missing|br(oke|oken|eaks?|eaking)|crack\w*|leak\w*|scratch\w*|dent(ed|s)?|chip(ped|s)?|peel\w*|rust\w*|smell\w*|disappoint\w*|unfortunately|sadly|downside|only (issue|problem|complaint)|could be better|not (as|so|very|great|good|happy|worth)|return(ed)?|refund\w*)\b/i,
  /لكن|للأسف|مشكلة|ياريت|يا ريت|ليت|ضاع|انكسر|مكسور|تسريب|يسرب|خدش|عيب|إرجاع|استرجاع/,
];

function qualifies(r: QuotableReview, approved: ReadonlySet<string> | null): string | null {
  if (approved && !approved.has(r.uuid)) return null;
  if (r.rating !== 5 || !r.verifiedBuyer) return null;
  // One paragraph only — a multi-paragraph review cannot be shown whole, and
  // showing part of it would be editing the customer.
  if (/\n/.test(r.body.trim())) return null;
  const text = r.body.trim().replace(/\s+/g, ' ');
  if (text.length < MIN_LEN || text.length > MAX_LEN) return null;
  if (CLAIM_FILTERS.some((re) => re.test(text))) return null;
  if (RESERVATION_FILTERS.some((re) => re.test(text))) return null;
  return text;
}

/**
 * @param approved the allow-list; defaults to APPROVED_QUOTES. `null` disables
 *   the allow-list — for tests of the filters, and for the maintenance script
 *   that lists candidates. Production callers never pass it.
 */
export function pickReviewQuote(
  reviews: readonly QuotableReview[],
  isAr: boolean,
  pinnedUuid?: string | null,
  approved: ReadonlySet<string> | null = APPROVED_QUOTES
): ReviewQuote | null {
  const toQuote = (r: QuotableReview, text: string): ReviewQuote => ({
    uuid: r.uuid,
    text,
    name: r.reviewerName.trim(),
    writtenFor: r.writtenFor,
  });

  if (pinnedUuid) {
    const pinned = reviews.find((r) => r.uuid === pinnedUuid);
    const text = pinned ? qualifies(pinned, approved) : null;
    if (pinned && text) return toQuote(pinned, text);
  }

  let best: { r: QuotableReview; text: string; score: number } | null = null;
  for (const r of reviews) {
    const text = qualifies(r, approved);
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
