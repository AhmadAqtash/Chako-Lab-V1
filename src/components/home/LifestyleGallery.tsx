'use client';

import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import SectionLabel from '@/components/ui/SectionLabel';
import Reveal from '@/components/ui/Reveal';

// Editorial lifestyle imagery. Sources are 940px wide, so tiles are kept
// modest (≤ ~768px @2× on desktop) to avoid upscaling — never full-bleed.
// object-cover center-crops the mixed landscape/portrait set cleanly.
const IMAGES = [
  {
    src: '/lifestyle/lifestyle-08.jpg',
    altEn: 'Model carrying a purple polka-dot Chako Lab cup as a crossbody',
    altAr: 'عارضة تحمل كوب شاكو لاب الأرجواني المنقّط كحقيبة كتف',
    en: 'Goes where you go',
    ar: 'أينما تذهب',
  },
  {
    src: '/lifestyle/lifestyle-02.jpg',
    altEn: 'Two Chako Lab tumblers resting in a car cup holder',
    altAr: 'كوبان من شاكو لاب في حامل أكواب السيارة',
    en: 'Made for the long drive',
    ar: 'رفيق الطريق الطويل',
  },
  {
    src: '/lifestyle/lifestyle-06.jpg',
    altEn: 'BoBo cups on a table during a cozy game night',
    altAr: 'أكواب بوبو على الطاولة في أمسية ألعاب دافئة',
    en: 'Game night, sorted',
    ar: 'ليلة ألعاب مثالية',
  },
  {
    src: '/lifestyle/lifestyle-10.jpg',
    altEn: 'Hung Kettle bottles on a picnic table outdoors',
    altAr: 'زجاجات هانج كيتل على طاولة نزهة في الخارج',
    en: 'Picnic-ready, every time',
    ar: 'جاهز لكل نزهة',
  },
  {
    src: '/lifestyle/lifestyle-04.jpg',
    altEn: 'Chako Lab bottles tucked into a picnic basket on the grass',
    altAr: 'زجاجات شاكو لاب داخل سلة نزهة على العشب',
    en: 'Packed for the outdoors',
    ar: 'مُجهّز للخارج',
  },
  {
    src: '/lifestyle/brand-section-01.jpg',
    altEn: 'Hand holding a yellow Chako Lab tumbler by its handle',
    altAr: 'يد تمسك بكوب شاكو لاب الأصفر من المقبض',
    en: 'Everyday, in your colour',
    ar: 'كل يوم، بلونك',
  },
];

export default function LifestyleGallery() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <section
      className="py-14 md:py-20"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Section header */}
      <Reveal
        variant="up"
        className="max-w-screen-xl mx-auto px-4 md:px-8 mb-8 md:mb-12"
      >
        {/* PLACEHOLDER COPY — edit freely */}
        <SectionLabel className="mb-3">
          {isAr ? 'الحياة مع شاكو' : 'Life with Chako'}
        </SectionLabel>
        <h2 className="text-heading font-display font-bold">
          {isAr ? 'صُنع لكل لحظة' : 'Made for every moment'}
        </h2>
        <p className="text-body text-chako-ink/55 max-w-md mt-3">
          {isAr
            ? 'من زحمة الصباح إلى نزهة العصر — منتجات شاكو لاب ترافقك أينما ذهب يومك.'
            : 'From the morning commute to the afternoon picnic — Chako Lab drinkware goes wherever your day does.'}
        </p>
      </Reveal>

      {/* Editorial grid: 2-col on mobile, 3-col on desktop. Uniform square
          tiles keep every image well under its 940px source (no upscaling). */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <Reveal stagger={80} className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {IMAGES.map((img) => (
            <div key={img.src}>
              <div className="group relative aspect-square overflow-hidden rounded-2xl bg-chako-accent">
                <Image
                  src={img.src}
                  alt={isAr ? img.altAr : img.altEn}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                />
                {/* Readability scrim */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                {/* Caption */}
                <span className={`absolute bottom-3 ${isAr ? 'right-4 left-auto' : 'left-4'} z-10 font-display font-bold text-white text-sm md:text-base leading-tight drop-shadow-sm pe-4`}>
                  {isAr ? img.ar : img.en}
                </span>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
