'use client';

import Link from '@/components/ui/LocalizedLink';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import Reveal from '@/components/ui/Reveal';

const SERIES = [
  {
    handle: 'linlin-kettles',
    shortEn: 'LinLin',
    shortAr: 'لين لين',
    labelEn: 'LinLin Series',
    labelAr: 'مجموعة لين لين',
    descEn: 'Kettles',
    descAr: 'كيتل',
    imageEn: '/banners/en-linlin.png',
    imageAr: '/banners/ar-linlin.png',
  },
  {
    handle: 'milk-pods',
    shortEn: 'MilkPod',
    shortAr: 'ميلك بود',
    labelEn: 'MilkPod Series',
    labelAr: 'مجموعة ميلك بود',
    descEn: 'Cups',
    descAr: 'كوب',
    imageEn: '/banners/en-milkpod.png',
    imageAr: '/banners/ar-milkpod.png',
  },
  {
    handle: 'bawang-cups',
    shortEn: 'BaWang',
    shortAr: 'باوانج',
    labelEn: 'BaWang Series',
    labelAr: 'مجموعة باوانج',
    descEn: 'Cups',
    descAr: 'كوب',
    imageEn: '/banners/en-bawang.png',
    imageAr: '/banners/ar-bawang.png',
  },
  {
    handle: 'bobo-tumblers',
    shortEn: 'BoBo',
    shortAr: 'بوبو',
    labelEn: 'BoBo Series',
    labelAr: 'مجموعة بوبو',
    descEn: 'Tumblers',
    descAr: 'تمبلر',
    imageEn: '/banners/en-bobo.png',
    imageAr: '/banners/ar-bobo.png',
  },
  {
    handle: 'kada-bottles',
    shortEn: 'Kada',
    shortAr: 'كادا',
    labelEn: 'Kada Series',
    labelAr: 'مجموعة كادا',
    descEn: 'Bottles',
    descAr: 'زجاجة',
    imageEn: '/banners/en-kada.png',
    imageAr: '/banners/ar-kada.png',
  },
  {
    handle: 'pangpang-cups',
    shortEn: 'PangPang',
    shortAr: 'بانغ بانغ',
    labelEn: 'PangPang Series',
    labelAr: 'مجموعة بانغ بانغ',
    descEn: 'Cups',
    descAr: 'كوب',
    imageEn: '/banners/en-pangpang.png',
    imageAr: '/banners/ar-pangpang.png',
  },
  {
    handle: 'tumbler',
    shortEn: 'Hung',
    shortAr: 'هانج',
    labelEn: 'Hung Kettle',
    labelAr: 'كيتل هانج',
    descEn: 'Kettles',
    descAr: 'كيتل',
    imageEn: '/banners/en-hung-kettle.png',
    imageAr: '/banners/ar-hung-kettle.png',
  },
  {
    handle: 'titanium',
    shortEn: 'Titanium',
    shortAr: 'تيتانيوم',
    labelEn: 'Titanium Series',
    labelAr: 'مجموعة التيتانيوم',
    descEn: 'Premium',
    descAr: 'فاخر',
    imageEn: '/banners/en-titanium.png',
    imageAr: '/banners/ar-titanium.png',
  },
];

// Per-series palette: softBg for card bg, nameColor for series name text,
// btnBg + btnText for the CTA button
const PALETTE = [
  { softBg: 'bg-chako-linlin-soft',   nameColor: 'text-chako-ink',        btnBg: 'bg-chako-linlin',    btnText: 'text-chako-ink'  },
  { softBg: 'bg-chako-milkpod-soft',  nameColor: 'text-chako-milkpod',    btnBg: 'bg-chako-milkpod',   btnText: 'text-white'      },
  { softBg: 'bg-chako-bawang-soft',   nameColor: 'text-chako-bawang',     btnBg: 'bg-chako-bawang',    btnText: 'text-white'      },
  { softBg: 'bg-chako-bobo-soft',     nameColor: 'text-chako-bobo',       btnBg: 'bg-chako-bobo',      btnText: 'text-white'      },
  { softBg: 'bg-chako-kada-soft',     nameColor: 'text-chako-ink',        btnBg: 'bg-chako-kada',      btnText: 'text-chako-ink'  },
  { softBg: 'bg-chako-pangpang-soft', nameColor: 'text-chako-pangpang',   btnBg: 'bg-chako-pangpang',  btnText: 'text-white'      },
  { softBg: 'bg-chako-linlin-soft',   nameColor: 'text-chako-ink',        btnBg: 'bg-chako-linlin',    btnText: 'text-chako-ink'  },
  { softBg: 'bg-chako-titanium-soft', nameColor: 'text-chako-titanium',   btnBg: 'bg-chako-titanium',  btnText: 'text-white'      },
];

export default function SeriesBanners() {
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
        className="max-w-screen-xl mx-auto px-4 md:px-8 flex items-end justify-between mb-8 md:mb-12"
      >
        <h2 className="text-heading font-display font-bold">
          {isAr ? 'تسوق حسب المجموعة' : 'Shop by Series'}
        </h2>
        <Link
          href="/collections"
          className="text-sm font-semibold text-chako-ink/50 hover:text-chako-ink transition-colors underline underline-offset-4 whitespace-nowrap"
        >
          {isAr ? 'عرض الكل' : 'View all'}
        </Link>
      </Reveal>

      {/* Cards: stacked on mobile, 4-col grid on desktop */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <Reveal stagger={80} className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {SERIES.map((series, i) => {
            const img = isAr ? series.imageAr : series.imageEn;
            const shortName = isAr ? series.shortAr : series.shortEn;
            const desc = isAr ? series.descAr : series.descEn;
            const pal = PALETTE[i] ?? PALETTE[0];
            const isTitanium = series.handle === 'titanium';
            const shopLabel = isAr ? `تسوق ${series.shortAr}` : `Shop ${series.shortEn}`;

            return (
              <div key={`${series.handle}-${i}`}>
                <Link
                  href={`/collections/${series.handle}`}
                  className={cn(
                    'group relative block rounded-2xl overflow-hidden cursor-pointer',
                    'aspect-[3/4]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chako-ink focus-visible:ring-offset-2',
                    pal.softBg
                  )}
                >
                  {/* Full-bleed banner image fills the whole card */}
                  <Image
                    src={img}
                    alt={isAr ? series.labelAr : series.labelEn}
                    fill
                    quality={100}
                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 320px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    priority={i < 4}
                  />

                  {/* Overlaid Shop button (bottom corner) */}
                  <span
                    className={cn(
                      'absolute bottom-3 z-10 inline-flex items-center gap-1 px-3 py-2 rounded-full shadow-md',
                      'font-sans font-semibold text-[11px] md:text-xs uppercase tracking-wider',
                      'transition-transform duration-150 group-hover:scale-105 group-active:scale-95 touch-manipulation',
                      isAr ? 'left-3' : 'right-3',
                      isTitanium ? 'titanium-pill ps-6' : cn(pal.btnBg, pal.btnText)
                    )}
                  >
                    {isAr ? `تسوق ${series.shortAr}` : `Shop ${series.shortEn}`}
                    <span className="text-xs">{isAr ? '←' : '→'}</span>
                  </span>
                </Link>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
