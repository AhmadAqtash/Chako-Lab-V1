import type { Metadata } from 'next';
import type { Locale } from '@/lib/locale';
import { localeAlternates } from '@/lib/seo';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return {
    title: params.locale === 'ar' ? 'الأسئلة الشائعة' : 'FAQ',
    alternates: localeAlternates(params.locale, '/pages/faq'),
  };
}

const FAQS = {
  en: [
    {
      q: 'Where do you deliver?',
      a: 'We deliver across all seven Emirates: Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah and Umm Al Quwain. We do not currently ship outside the UAE.',
    },
    {
      q: 'When will my order arrive?',
      a: 'Order before 2PM on a business day (Monday to Friday) and we dispatch the same day; the courier then delivers on the next business day. Orders placed after 2PM, or on Saturday or Sunday, are dispatched on the next business day. Ras Al Khaimah and Fujairah may take one additional day. We do not offer same-day delivery — the Shipping & Returns page has worked examples.',
    },
    {
      q: 'What does shipping cost?',
      a: 'Shipping is free on orders of AED 250 and over. Below that it is a flat AED 25. There is one shipping option at checkout — we do not offer a paid express service.',
    },
    {
      q: 'What is your returns policy?',
      a: 'We offer a 15-day return policy on all unused, unopened items. If there is a manufacturing defect, we will replace or refund regardless of the timeframe. Contact us to initiate a return.',
    },
    {
      q: 'Are the products covered by warranty?',
      a: 'All Chako Lab products carry a 12-month warranty against manufacturing defects. This does not cover damage from misuse, drops, or normal wear and tear.',
    },
    {
      q: 'How do I care for my drinkware?',
      a: 'Most products are hand-wash recommended. Avoid abrasive cleaners on coated or ceramic surfaces. Do not microwave vacuum-insulated stainless steel products. Check the individual product page for specific care instructions.',
    },
    {
      q: 'Do you offer gift wrapping?',
      a: 'Gift packaging is available on selected items. Look for the gift option at checkout. You can also add a personalised message.',
    },
    {
      q: 'How do I track my order?',
      a: 'Once your order ships you will receive an email with a tracking number. You can also contact us via the Contact page for order status updates.',
    },
  ],
  ar: [
    {
      q: 'إلى أين توصلون؟',
      a: 'نوصّل إلى الإمارات السبع جميعها: دبي، أبوظبي، الشارقة، عجمان، رأس الخيمة، الفجيرة، وأم القيوين. ولا نشحن حالياً خارج دولة الإمارات.',
    },
    {
      q: 'متى يصلني طلبي؟',
      a: 'اطلب قبل الساعة 2 ظهراً في يوم عمل (من الاثنين إلى الجمعة) ونشحن طلبك في اليوم نفسه، ثم توصّله شركة التوصيل في يوم العمل التالي. الطلبات المقدمة بعد الساعة 2 ظهراً أو يومَي السبت والأحد تُشحن في يوم العمل التالي. وقد يستغرق التوصيل إلى رأس الخيمة والفجيرة يوماً إضافياً واحداً. لا نوفّر التوصيل في نفس اليوم — وتجد أمثلة عملية في صفحة الشحن والإرجاع.',
    },
    {
      q: 'كم تبلغ تكلفة الشحن؟',
      a: 'الشحن مجاني للطلبات بقيمة 250 درهماً فأكثر. وأقل من ذلك تكون الرسوم 25 درهماً ثابتة. يوجد خيار شحن واحد عند إتمام الطلب — ولا نوفّر خدمة توصيل سريع مدفوعة.',
    },
    {
      q: 'ما هي سياسة الإرجاع؟',
      a: 'نوفر سياسة إرجاع خلال 15 يوماً لجميع المنتجات غير المستخدمة وغير المفتوحة. وفي حال وجود عيب مصنعي، نستبدل المنتج أو نسترد المبلغ بغض النظر عن المدة. تواصل معنا لبدء عملية الإرجاع.',
    },
    {
      q: 'هل المنتجات مشمولة بالضمان؟',
      a: 'جميع منتجات شاكو لاب مشمولة بضمان 12 شهراً ضد عيوب التصنيع. لا يشمل الضمان الأضرار الناتجة عن سوء الاستخدام أو السقوط أو الاستهلاك الطبيعي.',
    },
    {
      q: 'كيف أعتني بأدوات الشرب؟',
      a: 'معظم المنتجات يُنصح بغسلها يدوياً. تجنب المنظفات الكاشطة على الأسطح المطلية أو الخزفية. لا تضع المنتجات الفولاذية المعزولة في الميكروويف. راجع صفحة كل منتج لتعليمات العناية الخاصة به.',
    },
    {
      q: 'هل توفرون تغليف هدايا؟',
      a: 'تغليف الهدايا متاح لمنتجات مختارة. ابحث عن خيار الهدية عند إتمام الطلب، ويمكنك أيضاً إضافة رسالة شخصية.',
    },
    {
      q: 'كيف أتتبع طلبي؟',
      a: 'بمجرد شحن طلبك ستصلك رسالة بريد إلكتروني تحتوي على رقم التتبع. يمكنك أيضاً التواصل معنا عبر صفحة اتصل بنا لمعرفة حالة الطلب.',
    },
  ],
} as const;

export default function FAQPage({ params }: { params: { locale: Locale } }) {
  const isAr = params.locale === 'ar';
  const faqs = isAr ? FAQS.ar : FAQS.en;
  return (
    <div className="max-w-screen-md mx-auto px-6 md:px-8 py-16 md:py-24">
      <p className="text-label font-semibold text-chako-ink/40 uppercase tracking-widest mb-3">
        {isAr ? 'مركز المساعدة' : 'Help Centre'}
      </p>
      <h1 className="text-heading font-display font-bold mb-10">
        {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
      </h1>

      <div className="space-y-0 divide-y divide-black/8">
        {faqs.map(({ q, a }) => (
          <details key={q} className="group py-5">
            <summary className="flex items-center justify-between cursor-pointer list-none font-semibold text-sm">
              {q}
              <span className="ms-4 flex-shrink-0 text-chako-ink/40 group-open:rotate-45 transition-transform duration-200 text-lg leading-none">+</span>
            </summary>
            <p className="mt-3 text-sm text-chako-ink/60 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
