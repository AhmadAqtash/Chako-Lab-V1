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
   * Optional shorter subline for PHONES only (desktop keeps subEn/subAr).
   * For portrait art whose clear zone cannot hold the full line.
   */
  subMobileEn?: string;
  subMobileAr?: string;
  /**
   * Where the text block sits over the desktop art — match the art's empty
   * space. 'left'/'right' are PHYSICAL sides (the art is not mirrored in RTL).
   * 'left' sits a little BELOW centre (it keeps the phone layout's top
   * padding); 'left-center' is true vertical centre — for art whose lower
   * left holds props. 'center-top' hugs the upper band for art whose middle
   * is busy; 'center-top-high' sits tighter to the top edge, for art whose
   * product rises into that band (the headline is a fixed 64px on desktop
   * while the art shrinks with the screen, so check 1280px — the tightest).
   */
  desktopPos: 'center' | 'left' | 'left-center' | 'right' | 'center-top' | 'center-top-high';
  /**
   * Where the text block sits over the mobile art. 'top-left' is PHYSICAL
   * left, left-aligned and capped at ~half the width — for portrait art whose
   * top-right is taken (a hand, a handle).
   */
  mobilePos: 'center' | 'top' | 'top-left';
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
   * not the headline. 'tight' (26rem) is for a centred block squeezed between
   * two busy sides.
   */
  width?: 'default' | 'narrow' | 'tight';
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
    // Bawang Lite launch (Sep 2026) — the three live colourways (Toffee & Pink,
    // White & Lemon, Pink & Mint) poolside with a straw hat, olives and cards.
    // Busy art with no designed text zone. The CTA says "Shop Bawang", not
    // "Shop Bawang Lite": it lands on the whole Bawang page, where the Lite
    // is listed after the other Bawangs (Ahmad chose to keep that order).
    // Claims come from the product descriptions: 770ml, wide straw for milk
    // tea and toppings. No retention hours — the Lite's are not published.
    enDesktop: '/hero/slide-bawang-lite-desktop.jpg',
    enMobile:  '/hero/slide-bawang-lite-mobile.jpg',
    arDesktop: '/hero/slide-bawang-lite-desktop.jpg',
    arMobile:  '/hero/slide-bawang-lite-mobile.jpg',
    ctaEn: 'Shop Bawang',
    ctaAr: 'تسوق باوانج',
    ctaHref: '/collections/bawang-cups',
    text: {
      headlineEn: 'Meet Bawang Lite.',
      headlineAr: 'تعرّف على باوانج لايت.',
      subEn: '770ml, with a wide straw made for milk tea and toppings.',
      subAr: '٧٧٠ مل، مع شفاطة عريضة للشاي بالحليب والإضافات.',
      // Desktop: over the straw hat (a prop), clear of the palm fronds above
      // and the olive plate below — 'left' sat low enough to run the subline
      // into the plate. Phone: the pool at the top is clear.
      desktopPos: 'left-center',
      mobilePos: 'top',
      width: 'narrow',
    },
  },
  {
    // CarryGo (art refreshed Sep 2026) — three bottles hung by their handles
    // on a golf club, soft green course behind.
    enDesktop: '/hero/slide-carrygo-golf-desktop.jpg',
    enMobile:  '/hero/slide-carrygo-golf-mobile.jpg',
    arDesktop: '/hero/slide-carrygo-golf-desktop.jpg',
    arMobile:  '/hero/slide-carrygo-golf-mobile.jpg',
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
      width: 'narrow', // bottles begin ~44% across — keep text clear of them
    },
  },
  {
    // Split Cup (art refreshed Sep 2026) — three cups on a purple suitcase,
    // hand on the trolley handle, palms and sea on the left.
    enDesktop: '/hero/slide-split-travel-desktop.jpg',
    enMobile:  '/hero/slide-split-travel-mobile.jpg',
    arDesktop: '/hero/slide-split-travel-desktop.jpg',
    arMobile:  '/hero/slide-split-travel-mobile.jpg',
    ctaEn: 'Shop Split Cup',
    ctaAr: 'تسوق سبليت',
    ctaHref: '/collections/split-cups',
    text: {
      headlineEn: 'The straw comes apart.',
      headlineAr: 'الشفاطة تنفصل بالكامل.',
      // Shortened for the Sep 2026 art: the straws rise to a third of the
      // frame height, so the block must stay short to sit above them.
      subEn: 'Easy to clean. 570ml, two straws in the box.',
      subAr: 'سهل التنظيف. ٥٧٠ مل، وشفاطتان في العلبة.',
      // Phones: a hand and the trolley handle fill the top-right, so the text
      // takes the clear sky top-left with a shorter subline that ends above
      // the straws.
      subMobileEn: '570ml, two straws in the box.',
      subMobileAr: '٥٧٠ مل، وشفاطتان في العلبة.',
      // Desktop: palms fill the left third, the trolley pole stands ~66%
      // across and the straw tops reach ~33% down; 'tight' + high keeps the
      // block in the clear sky between them (measured at 1280/1440/1920).
      desktopPos: 'center-top-high',
      mobilePos: 'top-left',
      width: 'tight',
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
