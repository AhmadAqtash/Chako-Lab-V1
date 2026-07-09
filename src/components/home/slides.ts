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
    // Brand statement — pastel sky, products floating in from both sides
    enDesktop: '/hero/slide-1-desktop.jpg',
    enMobile:  '/hero/slide-1-mobile.png',
    arDesktop: '/hero/slide-1-desktop.jpg',
    arMobile:  '/hero/slide-1-mobile.png',
    ctaEn: 'Shop All Products',
    ctaAr: 'تسوق جميع المنتجات',
    ctaHref: '/collections',
    // NOTE: the StatementOpener directly above already says "Drinkware with
    // personality, made for your daily ritual" — keep this headline distinct.
    text: {
      headlineEn: 'Joy you can sip.',
      headlineAr: 'بهجة تُرتشف.',
      subEn: 'Bold color, thoughtful design — the full Chako Lab collection.',
      subAr: 'ألوان جريئة وتصميم مدروس — تشكيلة شاكو لاب الكاملة.',
      desktopPos: 'center',
      mobilePos: 'top',
    },
  },
  {
    // BoBo tumblers — lilac studio, cups grouped on the right
    enDesktop: '/hero/slide-2-desktop.jpg',
    enMobile:  '/hero/slide-2-mobile.png',
    arDesktop: '/hero/slide-2-desktop.jpg',
    arMobile:  '/hero/slide-2-mobile.png',
    ctaEn: 'Shop BoBo Tumblers',
    ctaAr: 'تسوق تمبلر بوبو',
    ctaHref: '/collections/bobo-tumblers',
    ctaStyle: 'glass', // cups sit low in the mobile art — keep them visible
    text: {
      headlineEn: 'BoBo keeps it simple.',
      headlineAr: 'بوبو يحب البساطة.',
      subEn: 'Your everyday tumbler, done joyfully right.',
      subAr: 'تمبلر يومك المفضل — مصنوع بمرح، كما يجب.',
      desktopPos: 'left',
      mobilePos: 'top',
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
