import type { ProductReviewData } from '@/lib/judgeme';
import translations, { reviewsBasedOnLabel } from '@/lib/translations';
import ReviewStars from './ReviewStars';
import Reveal from '@/components/ui/Reveal';
import { BadgeCheck, Store } from 'lucide-react';

interface Props {
  data: ProductReviewData;
  isAr: boolean;
}

// Server-rendered Judge.me reviews — reviews are written on either storefront
// (sundooq.me or here) against the same store, so they surface on both.
export default function ProductReviews({ data, isAr }: Props) {
  const t = translations[isAr ? 'ar' : 'en'];

  const dateFmt = new Intl.DateTimeFormat(isAr ? 'ar-AE' : 'en-AE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  // Judge.me dates are ISO, but a garbage value must not crash the PDP render
  const safeDate = (iso: string): string | null => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : dateFmt.format(d);
  };

  return (
    // scroll-mt clears the sticky announcement bar + header + nav stack
    <section id="reviews" className="mt-16 md:mt-24 scroll-mt-36">
      <Reveal variant="up">
        <h2 className="text-heading font-display font-bold mb-8">{t.reviews_title}</h2>
      </Reveal>

      <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-12 items-start">
        {/* Summary: big average + histogram */}
        <Reveal variant="up" className="bg-chako-accent rounded-3xl p-6 md:sticky md:top-24">
          <div className="flex items-end gap-3 mb-2">
            <span className="text-5xl font-display font-bold leading-none">
              {data.averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-chako-ink/50 font-semibold pb-1">/ 5</span>
          </div>
          <ReviewStars rating={data.averageRating} size={20} className="mb-2" />
          <p className="text-sm text-chako-ink/60 font-medium mb-5">
            {reviewsBasedOnLabel(data.count, isAr)}
          </p>
          <div className="space-y-1.5">
            {data.histogram.map((h) => (
              <div key={h.rating} className="flex items-center gap-2 text-xs font-semibold">
                <span className="w-3 text-chako-ink/60 tabular-nums">{h.rating}</span>
                <span className="text-amber-400" aria-hidden="true">★</span>
                <span className="flex-1 h-2 rounded-full bg-black/8 overflow-hidden">
                  <span
                    className="block h-full rounded-full bg-amber-400"
                    style={{ width: `${h.percentage}%` }}
                  />
                </span>
                <span className="w-5 text-end text-chako-ink/45 tabular-nums">{h.frequency}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Review cards */}
        <Reveal stagger={80} className="space-y-4 min-w-0">
          {data.reviews.map((r) => (
            <article key={r.uuid} className="bg-white rounded-3xl border border-black/6 p-5 md:p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Initial avatar */}
                  <span className="w-10 h-10 rounded-full bg-chako-ink text-chako-cream flex items-center justify-center font-display font-bold flex-shrink-0">
                    {r.reviewerName.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{r.reviewerName}</p>
                    {r.verifiedBuyer && (
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-green-700">
                        <BadgeCheck size={12} /> {t.reviews_verified}
                      </p>
                    )}
                  </div>
                </div>
                {r.createdAt && safeDate(r.createdAt) && (
                  <time className="text-xs text-chako-ink/40 font-medium flex-shrink-0 pt-1">
                    {safeDate(r.createdAt)}
                  </time>
                )}
              </div>

              <ReviewStars rating={r.rating} size={14} className="mb-2" />

              {/* dir="auto": customers write reviews in either language on either storefront */}
              {r.title && <h3 dir="auto" className="font-bold text-[15px] mb-1">{r.title}</h3>}
              {r.body && (
                <p dir="auto" className="text-[15px] text-chako-ink/75 leading-relaxed whitespace-pre-line font-medium">
                  {r.body}
                </p>
              )}

              {r.pictures.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {r.pictures.map((url) => (
                    // Judge.me-hosted photos — tiny volume, plain img keeps
                    // them off the Vercel optimizer and out of next.config
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={url}
                      src={url}
                      alt=""
                      loading="lazy"
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-black/8"
                    />
                  ))}
                </div>
              )}

              {r.reply && (
                <div className="mt-3 bg-chako-accent rounded-2xl p-4">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-chako-ink/60 mb-1">
                    <Store size={13} /> {t.reviews_store_reply}
                  </p>
                  <p dir="auto" className="text-sm text-chako-ink/75 leading-relaxed whitespace-pre-line">{r.reply}</p>
                </div>
              )}
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
