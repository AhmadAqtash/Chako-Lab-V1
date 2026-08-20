import type { Metadata } from 'next';
import type { Locale } from '@/lib/locale';
import { localeAlternates } from '@/lib/seo';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return {
    title: params.locale === 'ar' ? 'الشحن والإرجاع' : 'Shipping & Returns',
    alternates: localeAlternates(params.locale, '/pages/shipping'),
  };
}

interface PolicySection {
  h: string;
  paras: string[];
  bullets?: string[];
  parasAfter?: string[];
}

// ─── SOURCE OF TRUTH ─────────────────────────────────────────────────────────
// Everything in the shipping half of this page must match the delivery profile
// configured in Shopify. As of Aug 2026 that is exactly ONE zone (UAE) and TWO
// rates: "Free Shipping" (AED 0, total >= AED 250) and "Standard Shipping"
// (AED 25, no conditions). There is NO express rate and NO GCC zone.
//
// This page previously advertised a AED 15 standard rate, a "Dubai Express"
// AED 25 service and GCC delivery — none of which existed. A customer paid the
// AED 25 (the only paid rate) believing they had bought express, and disputed
// the delivery date (order #1557). Hence: dispatch and delivery are now stated
// as separate steps, business days are defined, and the examples table covers
// the exact weekend-order case that caused the dispute.
//
// If the Shopify rates change, change this page in the SAME commit.
// Returns sections mirror sundooq.me/pages/returns-refunds — one store, one policy.
// ─────────────────────────────────────────────────────────────────────────────

interface Content {
  label: string;
  title: string;
  ratesTitle: string;
  rateHead: [string, string];
  rates: [string, string][];
  ratesNote: string;
  timelineTitle: string;
  timelineIntro: string;
  steps: { k: string; v: string }[];
  noSameDay: string;
  examplesTitle: string;
  examplesHead: [string, string, string];
  examples: [string, string, string][];
  examplesNote: string;
  eligibility: {
    h: string;
    intro: string;
    bullets: string[];
    contactPre: string;
    contactPost: string;
  };
  sections: PolicySection[];
}

const CONTENT: Record<'en' | 'ar', Content> = {
  en: {
    label: 'Delivery',
    title: 'Shipping & Returns',

    ratesTitle: 'What shipping costs',
    rateHead: ['Order total', 'Shipping'],
    rates: [
      ['AED 250 and over', 'Free'],
      ['Under AED 250', 'AED 25'],
    ],
    ratesNote:
      'We currently deliver within the United Arab Emirates only. There is one shipping speed at one price — there is no express option at checkout.',

    timelineTitle: 'When your order arrives',
    timelineIntro:
      'Two separate things happen after you order. First we dispatch it — we pack your parcel and hand it to the courier. Then the courier delivers it to you. Those are different days, and the times below say which is which.',
    steps: [
      {
        k: 'Dispatch',
        v: 'Order before 2PM on a business day and we dispatch the same day. Order after 2PM, or on a weekend, and we dispatch on the next business day.',
      },
      {
        k: 'Delivery',
        v: 'The courier delivers on the next business day after dispatch.',
      },
      {
        k: 'Business days',
        v: 'Monday to Friday. Saturday and Sunday are not business days — orders placed then are dispatched on Monday.',
      },
      {
        k: 'RAK & Fujairah',
        v: 'Deliveries to Ras Al Khaimah and Fujairah may take one additional day.',
      },
      {
        k: 'Tracking',
        v: 'As soon as your order is dispatched you will get an email with a live tracking link.',
      },
    ],
    noSameDay:
      'We do not offer same-day delivery. The earliest any order arrives is the next business day after it is dispatched.',

    examplesTitle: 'Worked examples',
    examplesHead: ['You order', 'We dispatch', 'It arrives'],
    examples: [
      ['Monday, 11:00', 'Monday', 'Tuesday'],
      ['Monday, 16:00', 'Tuesday', 'Wednesday'],
      ['Friday, 16:00', 'Monday', 'Tuesday'],
      ['Saturday or Sunday, any time', 'Monday', 'Tuesday'],
    ],
    examplesNote: 'Add one day for Ras Al Khaimah and Fujairah.',

    eligibility: {
      h: 'Eligibility for Returns',
      intro: 'You may request a return within 15 days of receiving your order if the item:',
      bullets: [
        'Arrived damaged or defective.',
        'Is incorrect or not as described.',
        'Is unused, in original packaging, and with all tags intact.',
      ],
      contactPre: 'To start a return, please contact us at',
      contactPost: 'with your order number and photos of the item.',
    },
    sections: [
      {
        h: 'Non-Returnable Items',
        paras: ['For hygiene and safety reasons, certain products are non-returnable. These include, but are not limited to:'],
        bullets: [
          'Personal care items (e.g., drinkware and bottles, once used).',
          'Opened or used products.',
          'Gift cards or promotional items.',
        ],
      },
      {
        h: 'Return Process',
        paras: ['Once your request is approved:'],
        bullets: [
          'You’ll receive instructions for courier pickup or drop-off.',
          'Returned items will be inspected within 3–5 working days of receipt.',
          'If approved, you’ll be eligible for either a refund or store credit.',
        ],
        parasAfter: ['Please ensure items are securely packaged. We reserve the right to decline returns that do not meet quality inspection standards.'],
      },
      {
        h: 'Refunds',
        paras: [
          'Refunds are processed to your original payment method within 7–14 working days after approval. Depending on your bank, the refund may take additional time to reflect.',
          'Shipping and handling fees are non-refundable unless the item was faulty or incorrect.',
        ],
      },
      {
        h: 'Exchanges',
        paras: ['If you prefer an exchange for the same or a different product, we’ll be happy to arrange it based on availability. Exchanges are subject to inspection and product stock.'],
      },
      {
        h: 'Damaged or Incorrect Items',
        paras: ['If your item arrives damaged or incorrect, please notify us within 48 hours of delivery with your order number and clear photos of the item and packaging. We’ll prioritize your replacement or refund at no additional cost to you.'],
      },
      {
        h: 'Cancellation Policy',
        paras: ['Orders can be cancelled within 2 hours of purchase if they have not yet been processed or shipped. After dispatch, the standard return process applies.'],
      },
      {
        h: 'Responsibility for Return Shipping',
        paras: ['For eligible returns (damaged or incorrect items), we cover the return shipping costs. For discretionary returns (change of mind), the customer may be responsible for shipping fees.'],
      },
      {
        h: 'Personalized and Engraved Items',
        paras: [
          'Items customized with a personalized engraved name or message are made especially for you and are not eligible for return or exchange.',
          'However, if your personalized item arrives damaged or has a manufacturing defect, we will gladly offer a replacement, exchange, or refund, depending on product availability and the nature of the issue. To help us resolve it quickly, please contact us within 48 hours of delivery and include your order number and clear photos of the item and packaging.',
        ],
      },
      {
        h: 'Warranty',
        paras: ['All products carry a 12-month warranty against manufacturing defects. Contact us with proof of purchase to make a warranty claim.'],
      },
    ],
  },

  ar: {
    label: 'التوصيل',
    title: 'الشحن والإرجاع',

    ratesTitle: 'تكلفة الشحن',
    rateHead: ['قيمة الطلب', 'الشحن'],
    rates: [
      ['250 درهماً فأكثر', 'مجاني'],
      ['أقل من 250 درهماً', '25 درهماً'],
    ],
    ratesNote:
      'نوصّل حالياً داخل دولة الإمارات العربية المتحدة فقط. لدينا سرعة شحن واحدة بسعر واحد — ولا يوجد خيار توصيل سريع عند إتمام الطلب.',

    timelineTitle: 'متى يصلك طلبك',
    timelineIntro:
      'بعد إتمام طلبك تحدث خطوتان منفصلتان. أولاً نشحنه — أي نجهّز الطرد ونسلّمه لشركة التوصيل. ثم توصّله شركة التوصيل إليك. هذان يومان مختلفان، والأوقات أدناه توضّح الفرق بينهما.',
    steps: [
      {
        k: 'الشحن',
        v: 'اطلب قبل الساعة 2 ظهراً في يوم عمل ونشحن طلبك في اليوم نفسه. الطلبات المقدمة بعد الساعة 2 ظهراً أو في عطلة نهاية الأسبوع تُشحن في يوم العمل التالي.',
      },
      {
        k: 'التوصيل',
        v: 'توصّل شركة التوصيل الطلب في يوم العمل التالي بعد شحنه.',
      },
      {
        k: 'أيام العمل',
        v: 'من الاثنين إلى الجمعة. السبت والأحد ليسا يومَي عمل — والطلبات المقدمة فيهما تُشحن يوم الاثنين.',
      },
      {
        k: 'رأس الخيمة والفجيرة',
        v: 'قد يستغرق التوصيل إلى رأس الخيمة والفجيرة يوماً إضافياً واحداً.',
      },
      {
        k: 'التتبع',
        v: 'بمجرد شحن طلبك ستصلك رسالة بريد إلكتروني تحتوي على رابط تتبّع مباشر.',
      },
    ],
    noSameDay:
      'لا نوفّر التوصيل في نفس اليوم. أقرب موعد لوصول أي طلب هو يوم العمل التالي بعد شحنه.',

    examplesTitle: 'أمثلة عملية',
    examplesHead: ['وقت طلبك', 'نشحنه', 'يصلك'],
    examples: [
      ['الاثنين، 11:00 صباحاً', 'الاثنين', 'الثلاثاء'],
      ['الاثنين، 4:00 عصراً', 'الثلاثاء', 'الأربعاء'],
      ['الجمعة، 4:00 عصراً', 'الاثنين', 'الثلاثاء'],
      ['السبت أو الأحد، في أي وقت', 'الاثنين', 'الثلاثاء'],
    ],
    examplesNote: 'أضف يوماً واحداً لرأس الخيمة والفجيرة.',

    eligibility: {
      h: 'أهلية الإرجاع',
      intro: 'يمكنك طلب الإرجاع خلال 15 يوماً من استلام طلبك إذا كان المنتج:',
      bullets: [
        'وصل تالفاً أو به عيب.',
        'غير صحيح أو غير مطابق للوصف.',
        'غير مستخدم، في عبوته الأصلية، وجميع البطاقات سليمة.',
      ],
      contactPre: 'لبدء عملية الإرجاع، تواصل معنا على',
      contactPost: 'مع رقم طلبك وصور للمنتج.',
    },
    sections: [
      {
        h: 'منتجات غير قابلة للإرجاع',
        paras: ['لأسباب تتعلق بالنظافة والسلامة، بعض المنتجات غير قابلة للإرجاع، ومنها على سبيل المثال لا الحصر:'],
        bullets: [
          'منتجات العناية الشخصية (مثل أدوات الشرب والقوارير بعد استخدامها).',
          'المنتجات المفتوحة أو المستخدمة.',
          'بطاقات الهدايا أو المنتجات الترويجية.',
        ],
      },
      {
        h: 'خطوات الإرجاع',
        paras: ['بعد الموافقة على طلبك:'],
        bullets: [
          'ستصلك تعليمات لاستلام الشحنة بواسطة المندوب أو تسليمها.',
          'تُفحص المنتجات المرتجعة خلال 3–5 أيام عمل من الاستلام.',
          'في حال الموافقة، يحق لك استرداد المبلغ أو الحصول على رصيد في المتجر.',
        ],
        parasAfter: ['يرجى التأكد من تغليف المنتجات بإحكام. نحتفظ بحق رفض المرتجعات التي لا تجتاز فحص الجودة.'],
      },
      {
        h: 'استرداد المبلغ',
        paras: [
          'يُعاد المبلغ إلى وسيلة الدفع الأصلية خلال 7–14 يوم عمل بعد الموافقة. وقد يستغرق ظهور المبلغ وقتاً إضافياً حسب البنك.',
          'رسوم الشحن والمناولة غير قابلة للاسترداد إلا إذا كان المنتج معيباً أو غير صحيح.',
        ],
      },
      {
        h: 'الاستبدال',
        paras: ['إذا كنت تفضل استبدال المنتج بنفس المنتج أو بمنتج آخر، يسعدنا ترتيب ذلك حسب التوفر. يخضع الاستبدال للفحص وتوفر المخزون.'],
      },
      {
        h: 'المنتجات التالفة أو غير الصحيحة',
        paras: ['إذا وصل منتجك تالفاً أو غير صحيح، يرجى إبلاغنا خلال 48 ساعة من التسليم مع رقم طلبك وصور واضحة للمنتج والعبوة. سنمنح استبدالك أو استرداد مبلغك الأولوية دون أي تكلفة إضافية.'],
      },
      {
        h: 'سياسة الإلغاء',
        paras: ['يمكن إلغاء الطلب خلال ساعتين من الشراء إذا لم تتم معالجته أو شحنه بعد. وبعد الشحن، تُطبق خطوات الإرجاع المعتادة.'],
      },
      {
        h: 'تكاليف شحن الإرجاع',
        paras: ['للمرتجعات المؤهلة (منتج تالف أو غير صحيح)، نتحمل نحن تكاليف شحن الإرجاع. أما الإرجاع الاختياري (تغيير الرأي) فقد يتحمل العميل رسوم الشحن.'],
      },
      {
        h: 'المنتجات المخصصة والمنقوشة',
        paras: [
          'المنتجات المخصصة باسم أو رسالة منقوشة تُصنع خصيصاً لك وهي غير قابلة للإرجاع أو الاستبدال.',
          'ومع ذلك، إذا وصل منتجك المخصص تالفاً أو به عيب مصنعي، يسعدنا تقديم بديل أو استبدال أو استرداد للمبلغ حسب توفر المنتج وطبيعة المشكلة. ولمساعدتنا في حل الأمر بسرعة، يرجى التواصل معنا خلال 48 ساعة من التسليم مع رقم طلبك وصور واضحة للمنتج والعبوة.',
        ],
      },
      {
        h: 'الضمان',
        paras: ['جميع المنتجات مشمولة بضمان 12 شهراً ضد عيوب التصنيع. تواصل معنا مع إثبات الشراء لتقديم مطالبة ضمان.'],
      },
    ],
  },
};

export default function ShippingPage({ params }: { params: { locale: Locale } }) {
  const c = params.locale === 'ar' ? CONTENT.ar : CONTENT.en;
  return (
    <div className="max-w-screen-md mx-auto px-6 md:px-8 py-16 md:py-24">
      <p className="text-label font-semibold text-chako-ink/40 uppercase tracking-widest mb-3">{c.label}</p>
      <h1 className="text-heading font-display font-bold mb-10">{c.title}</h1>

      <div className="space-y-10 text-sm text-chako-ink/70 leading-relaxed">
        {/* ── What it costs ── */}
        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-4">{c.ratesTitle}</h2>
          <div className="divide-y divide-black/8 border border-black/8 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-2 px-4 py-2.5 bg-chako-accent/60 text-[11px] font-semibold uppercase tracking-wider text-chako-ink/50">
              <span>{c.rateHead[0]}</span>
              <span>{c.rateHead[1]}</span>
            </div>
            {c.rates.map(([order, cost]) => (
              <div key={order} className="grid grid-cols-2 px-4 py-3.5 text-xs">
                <span className="font-semibold text-chako-ink">{order}</span>
                <span className="font-semibold text-chako-ink">{cost}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-chako-ink/45">{c.ratesNote}</p>
        </section>

        {/* ── Dispatch vs delivery: the distinction this page exists to make ── */}
        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-3">{c.timelineTitle}</h2>
          <p>{c.timelineIntro}</p>

          <dl className="mt-4 divide-y divide-black/8 border border-black/8 rounded-2xl overflow-hidden">
            {c.steps.map(({ k, v }) => (
              <div key={k} className="px-4 py-3.5 sm:grid sm:grid-cols-[130px_1fr] sm:gap-3">
                <dt className="font-semibold text-chako-ink text-xs mb-1 sm:mb-0">{k}</dt>
                <dd className="text-xs leading-relaxed m-0">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 rounded-2xl border-2 border-chako-ink/15 bg-chako-accent/60 px-4 py-3.5 text-xs font-semibold text-chako-ink">
            {c.noSameDay}
          </p>
        </section>

        {/* ── Worked examples ── */}
        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-4">{c.examplesTitle}</h2>
          <div className="divide-y divide-black/8 border border-black/8 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 px-4 py-2.5 bg-chako-accent/60 text-[11px] font-semibold uppercase tracking-wider text-chako-ink/50">
              {c.examplesHead.map((h) => <span key={h}>{h}</span>)}
            </div>
            {c.examples.map(([order, dispatch, arrives]) => (
              <div key={order} className="grid grid-cols-3 px-4 py-3.5 text-xs">
                <span className="font-semibold text-chako-ink">{order}</span>
                <span>{dispatch}</span>
                <span>{arrives}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-chako-ink/45">{c.examplesNote}</p>
        </section>

        {/* ── Returns ── */}
        <section>
          <h2 className="text-base font-display font-bold text-chako-ink mb-3">{c.eligibility.h}</h2>
          <p>{c.eligibility.intro}</p>
          <ul className="mt-3 space-y-1.5 list-disc ps-5">
            {c.eligibility.bullets.map((b) => <li key={b}>{b}</li>)}
          </ul>
          <p className="mt-3">
            {c.eligibility.contactPre}{' '}
            <a href="mailto:hi@sundooq.me" className="font-semibold text-chako-ink underline underline-offset-2" dir="ltr">hi@sundooq.me</a>{' '}
            {c.eligibility.contactPost}
          </p>
        </section>

        {c.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-base font-display font-bold text-chako-ink mb-3">{s.h}</h2>
            {s.paras.map((p, i) => <p key={p} className={i > 0 ? 'mt-3' : undefined}>{p}</p>)}
            {s.bullets && (
              <ul className="mt-3 space-y-1.5 list-disc ps-5">
                {s.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
            )}
            {s.parasAfter?.map((p) => <p key={p} className="mt-3">{p}</p>)}
          </section>
        ))}
      </div>
    </div>
  );
}
