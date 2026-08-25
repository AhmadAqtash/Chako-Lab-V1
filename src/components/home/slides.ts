// ============================================================================
// Hero slideshow banners — plug-and-play registry.
//
// HOW TO ADD A BANNER (current workflow — clean art + live text)
// ---------------------------------------------------------------
// 1) Export TWO clean images (no text/logo baked in) into /public/hero/:
//      slide-5-desktop.jpg   landscape (~1600px wide) — md+ screens
//      slide-5-mobile.png    portrait 1122x1402       — phones
//    Mobile art MUST be 1122x1402 (or that exact ratio): the hero section is
//    locked to aspect-[1122/1402] on phones and uses object-cover, so other
//    ratios get cropped. Because headlines are rendered live by the site,
//    ONE image serves both languages.
//    (Legacy slides with per-locale text baked in can still point enDesktop
//    and arDesktop at different files — the fields stay separate.)
//
// 2) Append ONE object to the SLIDES array below: the image paths, the CTA
//    label + href + style, and a `text` block (localized headline/sub +
//    placement matched to the art's empty space + tone).
//
// 3) Done. Array order = display order. The FIRST slide is preloaded with
//    priority (keep the strongest banner first). Autoplay, swipe, arrows,
//    dots and the text pop-in all adapt automatically.
// ============================================================================

export interface SlideText {
  headlineEn: string;
  headlineAr: string;
  subEn?: string;
  subAr?: string;
  /**
   * Where the text block sits over the desktop art — match the art's empty
   * space. 'left'/'right' are PHYSICAL sides (the art is not mirrored in RTL).
   * 'center-top' hugs the upper band for art whose middle is busy.
   */
  desktopPos: 'center' | 'left' | 'right' | 'center-top';
  /** Where the text block sits over the mobile art. */
  mobilePos: 'center' | 'top';
  /**
   * 'ink' (default): charcoal text with a soft white halo.
   * 'bling': animated metallic gradient shimmer — for the Titanium slide.
   */
  tone?: 'ink' | 'bling';
  /**
   * Desktop text-block width. 'default' allows the full 2xl measure; 'narrow'
   * caps it so a long subline cannot run under the product. Use 'narrow' when
   * the art's clear zone is less than about half the frame — measure the art
   * rather than guessing, and remember the SUBLINE is usually the longest run,
   * not the headline.
   */
  width?: 'default' | 'narrow';
}

export interface Slide {
  /** Landscape banner, English — shown on md+ screens. */
  enDesktop: string;
  /** Portrait banner (1122x1402), English — shown on phones. */
  enMobile: string;
  /** Landscape banner, Arabic — same file as EN when the art carries no text. */
  arDesktop: string;
  /** Portrait banner (1122x1402), Arabic — same file as EN when the art carries no text. */
  arMobile: string;
  /** CTA pill label, English. Keep it short — the pill animates its width. */
  ctaEn: string;
  /** CTA pill label, Arabic. */
  ctaAr: string;
  /** Locale-less destination path; LocalizedLink adds /en or /ar. */
  ctaHref: string;
  /**
   * 'solid' (default): white pill. 'glass': translucent blur pill for art
   * where a solid pill would cover product. 'titanium': the site's indigo
   * sheen pill — matches the Titanium dark universe.
   */
  ctaStyle?: 'solid' | 'glass' | 'titanium';
  /** Live overlay text (headline + optional subline), localized. */
  text?: SlideText;
}

export const SLIDES: Slide[] = [
  {
    // CarryGo launch (Aug 2026) — pastel podium, four bottles right of centre,
    // clean lilac/peach gradient across the whole left third.
    enDesktop: '/hero/slide-carrygo-desktop.jpg',
    enMobile:  '/hero/slide-carrygo-mobile.jpg',
    arDesktop: '/hero/slide-carrygo-desktop.jpg',
    arMobile:  '/hero/slide-carrygo-mobile.jpg',
    ctaEn: 'Shop CarryGo',
    ctaAr: 'تسوق كاري جو',
    ctaHref: '/collections/carrygo-tumblers',
    text: {
      headlineEn: 'Big day? Grab the handle.',
      headlineAr: 'يوم طويل؟ أمسك المقبض.',
      subEn: '870ml of CarryGo. One fill, one hand, done.',
      subAr: '٨٧٠ مل من كاري جو. تعبئة واحدة تكفي يومك.',
      desktopPos: 'left',
      mobilePos: 'top',
      width: 'narrow', // bottles begin ~45% across — keep text clear of them
    },
  },
  {
    // Split Cup launch (Aug 2026) — cups float centre-right over lemons and
    // vinyl; the upper-left third of the yellow field is completely clear.
    enDesktop: '/hero/slide-split-desktop.jpg',
    enMobile:  '/hero/slide-split-mobile.jpg',
    arDesktop: '/hero/slide-split-desktop.jpg',
    arMobile:  '/hero/slide-split-mobile.jpg',
    ctaEn: 'Shop Split Cup',
    ctaAr: 'تسوق سبليت',
    ctaHref: '/collections/split-cups',
    text: {
      headlineEn: 'The straw comes apart.',
      headlineAr: 'الشفاطة تنفصل بالكامل.',
      subEn: 'Finally, a straw cup you can actually clean. 570ml, two straws in the box.',
      subAr: 'أخيراً كوب شفاطة يمكنك تنظيفه فعلاً. ٥٧٠ مل، وشفاطتان في العلبة.',
      desktopPos: 'left',
      mobilePos: 'top',
      width: 'narrow', // the floating cups start ~52% across
    },
  },
  {
    // LinLin kettles — pink studio, hands offering a kettle from each side
    enDesktop: '/hero/slide-3-desktop.jpg',
    enMobile:  '/hero/slide-3-mobile.png',
    arDesktop: '/hero/slide-3-desktop.jpg',
    arMobile:  '/hero/slide-3-mobile.png',
    ctaEn: 'Shop LinLin Kettles',
    ctaAr: 'تسوق أباريق لين لين',
    ctaHref: '/collections/linlin-kettles',
    text: {
      headlineEn: 'Grab joy by the handle.',
      headlineAr: 'أمسِك البهجة من مقبضها.',
      subEn: 'LinLin kettles, in colors that lift your day.',
      subAr: 'أباريق لين لين بألوان تُنعش يومك.',
      desktopPos: 'center',
      mobilePos: 'top',
    },
  },
  {
    // Titanium — glitter-finish tumblers & bottles on a pink chrome haze
    enDesktop: '/hero/slide-4-desktop.png',
    enMobile:  '/hero/slide-4-mobile.png',
    arDesktop: '/hero/slide-4-desktop.png',
    arMobile:  '/hero/slide-4-mobile.png',
    ctaEn: 'Shop Titanium',
    ctaAr: 'تسوق التيتانيوم',
    ctaHref: '/collections/titanium',
    ctaStyle: 'titanium', // indigo sheen pill — same family as the nav's Titanium button
    text: {
      headlineEn: 'Shine louder.',
      headlineAr: 'تألّق أكثر.',
      subEn: 'Feather-light titanium with a glitter finish.',
      subAr: 'تيتانيوم خفيف كالريشة بلمسة لامعة.',
      desktopPos: 'center-top', // the bottles own the middle of the wide art
      mobilePos: 'top',
      tone: 'bling',
    },
  },
];
