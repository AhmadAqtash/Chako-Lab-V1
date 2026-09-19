'use client';

import { BadgeCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import ReviewStars from './ReviewStars';
import type { ReviewQuote as Quote } from '@/lib/review-quote';

/**
 * One real, verified, whole 5-star review under the purchase buttons — for the
 * hesitater who scrolls past them. Selection (and everything a quote is NOT
 * allowed to contain) lives in lib/review-quote.ts; this component never clamps
 * or trims: the text fits whole by construction (<= 150 characters).
 *
 * The lightest treatment on purpose — a border, not another card — and one big
 * tap target to the full reviews. The quotation marks are the template's, not
 * the customer's. A sibling colourway's review always says which colour it was
 * written for; it is never passed off as this one.
 */
export default function ReviewQuote({ quote }: { quote: Quote }) {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  return (
    // No aria-label: on a link it REPLACES the content, so a screen-reader user
    // would hear "Customer review" and never the review. The link's own text —
    // stars, quote, name, "Read all reviews" — is the accessible name.
    <a href="#reviews" className="pdp-quote block border-s-4 border-chako-highlight ps-3.5 py-1 group">
      <span className="flex items-center gap-2">
        <ReviewStars rating={5} size={13} />
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-800">
          <BadgeCheck size={12} aria-hidden="true" />
          {t('reviews_verified')}
        </span>
      </span>

      {/* dir="auto": customers write in either language on either storefront */}
      <span dir="auto" className="mt-1 block text-sm font-medium leading-snug text-chako-ink/80">
        {isAr ? '«' : '“'}{quote.text}{isAr ? '»' : '”'}
      </span>

      <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-chako-ink/70">
        <span dir="auto">— {quote.name}</span>
        {quote.writtenFor && (
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px]">
            {t('reviews_written_for')} {quote.writtenFor}
          </span>
        )}
        <span className="ms-auto underline underline-offset-2 group-hover:text-chako-ink transition-colors">
          {t('pdp_quote_read_all')}
        </span>
      </span>
    </a>
  );
}
