import Link from 'next/link';
import Image from 'next/image';
import { COLLECTION_DISPLAY_NAMES, ALL_COLLECTION_HANDLES, COLLECTION_HANDLE_TO_TYPE, getProducts } from '@/lib/shopify';
import T from '@/components/ui/T';
import type { TranslationKey } from '@/lib/translations';

const HANDLE_TO_CAT_KEY: Record<string, TranslationKey> = {
  'linlin-kettles':   'cat_linlin',
  'bawang-cups':      'cat_bawang',
  'bobo-tumblers':    'cat_bobo',
  'kada-bottles':     'cat_kada',
  'pots':             'cat_pots',
  'mugs':             'cat_mugs',
  'milk-pods':        'cat_milkpods',
  'baobao-food-cups': 'cat_baobao',
  'pangpang-cups':    'cat_pangpang',
  'square-cups':      'cat_square',
  'tumbler':          'cat_tumbler',
  'bobo-cup':         'cat_bobo_cup',
  'baobao-cup':       'cat_baobao',
  'accessories':      'cat_accessories',
};

async function getCategoryImages(): Promise<Record<string, string | null>> {
  const results = await Promise.allSettled(
    ALL_COLLECTION_HANDLES.map((handle) =>
      getProducts({ first: 1, productType: COLLECTION_HANDLE_TO_TYPE[handle] })
    )
  );

  return Object.fromEntries(
    ALL_COLLECTION_HANDLES.map((handle, i) => {
      const result = results[i];
      const image =
        result.status === 'fulfilled' && result.value[0]?.featuredImage?.url
          ? result.value[0].featuredImage.url
          : null;
      return [handle, image];
    })
  );
}

export default async function CategoryBar() {
  const images = await getCategoryImages();

  return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-8 py-10 md:py-14">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs font-semibold text-chako-dark/40 uppercase tracking-widest mb-1">
            <T k="browse_label" />
          </p>
          <h2 className="text-fluid-heading font-bold"><T k="browse_heading" /></h2>
        </div>
      </div>

      <div className="relative">
        {/* Fade hint right edge — mobile only */}
        <div className="absolute right-0 top-0 bottom-2 w-10 bg-gradient-to-l from-chako-bg to-transparent pointer-events-none z-10 md:hidden" />

        <div className="flex md:grid md:grid-cols-5 gap-3 overflow-x-auto md:overflow-visible scrollbar-hide snap-x snap-mandatory md:snap-none scroll-momentum -mx-4 md:mx-0 px-4 md:px-0 pb-2 md:pb-0">
        {ALL_COLLECTION_HANDLES.map((handle) => (
          <Link
            key={handle}
            href={`/collections/${handle}`}
            className="flex-none w-20 md:w-auto snap-start flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 bg-chako-accent rounded-2xl hover:bg-chako-highlight/40 hover:shadow-sm active:scale-95 transition-[background-color,box-shadow,transform] duration-200 ease-out group text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chako-dark focus-visible:ring-offset-2 touch-manipulation"
          >
            <div className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl overflow-hidden bg-white/60 flex items-center justify-center flex-shrink-0">
              {images[handle] ? (
                <Image
                  src={images[handle]!}
                  alt={COLLECTION_DISPLAY_NAMES[handle]}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full transition-transform duration-300 ease-out group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-chako-highlight/30 rounded-2xl" />
              )}
            </div>
            <span className="text-[10px] md:text-xs font-semibold text-chako-dark/70 group-hover:text-chako-dark transition-[color,transform] duration-200 leading-tight group-hover:-translate-y-0.5">
              <T k={HANDLE_TO_CAT_KEY[handle] ?? 'cat_all'} />
            </span>
          </Link>
        ))}
        </div>
      </div>
    </section>
  );
}
