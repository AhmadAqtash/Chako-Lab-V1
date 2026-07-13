'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { SectionLabel } from '@/components/ui/SectionLabel';
import Reveal from '@/components/ui/Reveal';

const FAQS_EN = [
  {
    q: 'Where does Chako Lab ship to?',
    a: 'We ship across the UAE and GCC region. Standard delivery takes 2-4 business days within the UAE.',
  },
  {
    q: 'Are the products food-safe and BPA-free?',
    a: 'Yes. All Chako Lab products are made from food-grade materials and are completely BPA-free. We use 304 stainless steel, borosilicate glass, and food-safe plastics.',
  },
  {
    q: 'How do I clean and care for my Chako Lab product?',
    a: 'Most products are hand-wash recommended. Avoid abrasive cleaners. For insulated items, do not submerge lids with silicone seals in water for extended periods.',
  },
  {
    q: 'What is the return policy?',
    a: 'We accept returns within 15 days of delivery for unused, undamaged items in original packaging. Contact us via Instagram or email to initiate a return.',
  },
  {
    q: 'Do the insulated bottles keep drinks hot/cold?',
    a: 'Our double-wall vacuum-insulated drinkware keeps beverages cold for up to 36 hours and hot for up to 18 hours under normal conditions.',
  },
  {
    q: 'Can I buy Chako Lab products in-store in the UAE?',
    a: 'Currently, Chako Lab is online-only. We ship directly to your door with fast UAE delivery.',
  },
];

const FAQS_AR = [
  {
    q: 'إلى أين يشحن شاكو لاب؟',
    a: 'نشحن عبر الإمارات العربية المتحدة ومنطقة الخليج العربي. يستغرق التوصيل القياسي 2-4 أيام عمل داخل الإمارات.',
  },
  {
    q: 'هل المنتجات آمنة للطعام وخالية من BPA؟',
    a: 'نعم. جميع منتجات شاكو لاب مصنوعة من مواد آمنة للطعام وخالية تماماً من BPA. نستخدم الفولاذ المقاوم للصدأ 304 والزجاج البوروسيليكاتي.',
  },
  {
    q: 'كيف أنظف منتج شاكو لاب وأعتني به؟',
    a: 'يوصى بالغسيل اليدوي لمعظم المنتجات. تجنب المنظفات الكاشطة. للعناصر المعزولة، لا تغمر الأغطية ذات الأختام السيليكونية في الماء لفترات طويلة.',
  },
  {
    q: 'ما هي سياسة الإرجاع؟',
    a: 'نقبل الإرجاع خلال 15 يوماً من التسليم للمنتجات غير المستخدمة وغير التالفة في عبواتها الأصلية. تواصل معنا عبر إنستغرام أو البريد الإلكتروني.',
  },
  {
    q: 'هل تحافظ الزجاجات المعزولة على درجة حرارة المشروبات؟',
    a: 'أدوات الشرب لدينا ذات الجدار المزدوج بتقنية الفراغ تحافظ على المشروبات باردة لمدة تصل إلى 36 ساعة وساخنة لمدة تصل إلى 18 ساعة.',
  },
  {
    q: 'هل يمكنني شراء منتجات شاكو لاب في المتاجر بالإمارات؟',
    a: 'حالياً، شاكو لاب متاح عبر الإنترنت فقط. نشحن مباشرة إلى بابك بتوصيل سريع داخل الإمارات.',
  },
];

export default function FAQ() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [open, setOpen] = useState<number | null>(null);

  const FAQS = isAr ? FAQS_AR : FAQS_EN;

  return (
    <section
      className="max-w-screen-xl mx-auto px-4 md:px-8 py-16 md:py-24"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="max-w-2xl mx-auto">
        <Reveal variant="up" className="text-center mb-10">
          <SectionLabel className="mb-3">
            {t('faq_label')}
          </SectionLabel>
          <h2 className="text-heading font-display font-bold">{t('faq_heading')}</h2>
        </Reveal>

        <Reveal stagger={80} className="space-y-2">
          {FAQS.map(({ q, a }, i) => (
            <div
              key={i}
              className="border border-black/[0.08] rounded-2xl overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 min-h-[56px] text-left hover:bg-black/[0.02] active:bg-black/[0.04] transition-colors cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-chako-ink/20"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="font-sans font-semibold text-sm md:text-[0.9375rem] leading-snug pr-4 rtl:pr-0 rtl:pl-4 text-chako-ink">
                  {q}
                </span>
                <ChevronDown
                  size={18}
                  className={`flex-shrink-0 text-chako-ink/40 transition-transform duration-300 ease-out ${
                    open === i ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div className={`faq-panel ${open === i ? 'faq-open' : ''}`}>
                <div>
                  <div className="px-5 pb-5">
                    <p className="text-sm text-chako-ink/60 leading-relaxed">{a}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
