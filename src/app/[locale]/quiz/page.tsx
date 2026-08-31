import { Suspense } from 'react';
import type { Metadata } from 'next';
import { localeAlternates } from '@/lib/seo';
import type { Locale } from '@/lib/locale';
import Breadcrumb from '@/components/ui/Breadcrumb';
import QuizStarter from '@/components/quiz/QuizStarter';

export const revalidate = 60;

const META = {
  en: {
    title: 'Find Your Chako',
    description:
      'Answer a few questions and we will match you to the right Chako Lab bottle — size, lining and lid, chosen for how you actually drink.',
  },
  ar: {
    title: 'اعثر على شاكو المناسب لك',
    description:
      'أجب عن بضعة أسئلة وسنرشدك إلى زجاجة شاكو لاب المناسبة لك — الحجم والبطانة والغطاء، مختارة حسب طريقة شربك.',
  },
} as const;

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return { ...META[params.locale], alternates: localeAlternates(params.locale, '/quiz') };
}

export default function QuizPage({ params }: { params: { locale: Locale } }) {
  const isAr = params.locale === 'ar';

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <Breadcrumb
        crumbs={[
          { label: 'Home', href: '/' },
          { label: isAr ? 'اعثر على شاكو المناسب لك' : 'Find Your Chako' },
        ]}
      />

      <div className="max-w-xl mx-auto mb-8 text-center">
        <p className="text-label font-sans font-semibold text-chako-ink/40 uppercase tracking-widest mb-2">
          {isAr ? 'اختبار المطابقة' : 'The bottle fit test'}
        </p>
        <h1 className="text-display font-display font-bold leading-none mb-3">
          {isAr ? 'اعثر على شاكو المناسب لك' : 'Find Your Chako'}
        </h1>
        <p className="text-body text-chako-ink/60 leading-relaxed">
          {isAr
            ? 'أسئلة قليلة عن طريقة شربك، ثم زجاجة واحدة مناسبة لك.'
            : 'A few questions about how you actually drink, then one bottle that fits.'}
        </p>
      </div>

      {/* useSearchParams needs a Suspense boundary; without it the whole route
          opts out of static rendering. */}
      <Suspense fallback={<div className="h-64" />}>
        <QuizStarter />
      </Suspense>
    </div>
  );
}
