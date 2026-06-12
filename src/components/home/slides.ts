// ============================================================================
// Hero slideshow banners — plug-and-play registry.
//
// HOW TO ADD A BANNER
// -------------------
// 1) Export FOUR images (one per language x device) into /public/hero/:
//      slide-4-en-desktop.png   landscape, wide (>= 1920px) — desktop, English
//      slide-4-en-mobile.png    portrait 1122x1402          — mobile,  English
//      slide-4-ar-desktop.png   landscape, wide             — desktop, Arabic
//      slide-4-ar-mobile.png    portrait 1122x1402          — mobile,  Arabic
//    The numbered filenames are just our convention — any path under /public
//    works. Mobile art MUST be 1122x1402 (or that exact ratio): the hero
//    section is locked to aspect-[1122/1402] on phones and uses object-cover,
//    so other ratios get cropped.
//
// 2) Append ONE object to the SLIDES array below:
//      - the 4 image paths (enDesktop / enMobile / arDesktop / arMobile)
//      - 2 CTA strings (ctaEn / ctaAr) — the white pill button label
//      - ctaHref — locale-less path like '/collections/titanium'
//        (LocalizedLink prefixes /en or /ar automatically — never hardcode it)
//
// 3) Done. Array order = display order. The FIRST slide is preloaded with
//    priority, so keep the strongest banner first. Autoplay, swipe, arrows,
//    dot progress and transitions all adapt to the array length automatically.
// ============================================================================

export interface Slide {
  /** Landscape banner, English — shown on md+ screens. */
  enDesktop: string;
  /** Portrait banner (1122x1402), English — shown on phones. */
  enMobile: string;
  /** Landscape banner, Arabic — shown on md+ screens. */
  arDesktop: string;
  /** Portrait banner (1122x1402), Arabic — shown on phones. */
  arMobile: string;
  /** CTA pill label, English. Keep it short — the pill animates its width. */
  ctaEn: string;
  /** CTA pill label, Arabic. */
  ctaAr: string;
  /** Locale-less destination path; LocalizedLink adds /en or /ar. */
  ctaHref: string;
}

export const SLIDES: Slide[] = [
  {
    enDesktop: '/hero/slide-1-en-desktop.png',
    enMobile:  '/hero/slide-1-en-mobile.png',
    arDesktop: '/hero/slide-1-ar-desktop.png',
    arMobile:  '/hero/slide-1-ar-mobile.png',
    ctaEn: 'Shop Titanium Collection',
    ctaAr: 'تسوق مجموعة التيتانيوم',
    ctaHref: '/collections/titanium',
  },
  {
    enDesktop: '/hero/slide-2-en-desktop.png',
    enMobile:  '/hero/slide-2-en-mobile.png',
    arDesktop: '/hero/slide-2-ar-desktop.png',
    arMobile:  '/hero/slide-2-ar-mobile.png',
    ctaEn: 'Shop Milk Pod Titanium',
    ctaAr: 'تسوق ميلك بود تيتانيوم',
    ctaHref: '/collections/titanium',
  },
  {
    enDesktop: '/hero/slide-3-en-desktop.png',
    enMobile:  '/hero/slide-3-en-mobile.png',
    arDesktop: '/hero/slide-3-ar-desktop.png',
    arMobile:  '/hero/slide-3-ar-mobile.png',
    ctaEn: 'Shop Now - 10% Off',
    ctaAr: 'تسوق الآن - خصم ١٠٪',
    ctaHref: '/collections',
  },
];
