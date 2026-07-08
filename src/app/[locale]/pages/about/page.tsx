import type { Metadata } from 'next';
import Link from '@/components/ui/LocalizedLink';
import type { Locale } from '@/lib/locale';
import { localeAlternates } from '@/lib/seo';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return {
    title: params.locale === 'ar' ? 'عن شاكو لاب' : 'About Chako Lab',
    alternates: localeAlternates(params.locale, '/pages/about'),
  };
}

export default function AboutPage() {
  return (
    <div className="max-w-screen-md mx-auto px-6 md:px-8 py-16 md:py-24">
      <p className="text-label font-semibold text-chako-ink/40 uppercase tracking-widest mb-3">Our Story</p>
      <h1 className="text-heading font-display font-bold mb-8">About Chako Lab</h1>

      <div className="space-y-5 text-sm text-chako-ink/70 leading-relaxed">
        <p>
          Chako Lab was born out of a simple belief: the vessels we use every day should be as
          thoughtfully designed as the rituals they support. Whether it&apos;s the first kettle pour of
          the morning, a cold-brew carry through the afternoon, or a warm tumbler at your desk — each
          moment deserves better hardware.
        </p>
        <p>
          We source and curate drinkware that sits at the intersection of craft, function, and
          everyday beauty. Every product in our range is tested for real-world use: insulation
          performance, lid leak-proofing, grip ergonomics, and the kind of finish that still looks
          good after a year of daily use.
        </p>
        <p>
          Chako Lab is based in the UAE and delivers across the Emirates and the wider GCC. We are
          owned and operated by Gallop Enterprises LLC.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/collections"
          className="inline-flex items-center px-6 py-3 bg-chako-ink text-chako-cream font-semibold rounded-2xl text-sm hover:bg-chako-ink/90 transition-colors"
        >
          Shop All Products
        </Link>
        <Link
          href="/pages/contact"
          className="inline-flex items-center px-6 py-3 border border-black/15 font-semibold rounded-2xl text-sm hover:bg-black/5 transition-colors"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
