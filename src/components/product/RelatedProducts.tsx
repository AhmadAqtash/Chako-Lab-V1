import { getRelatedProducts } from '@/lib/shopify';
import type { ShopifyLanguage } from '@/lib/shopify';
import ProductCard from './ProductCard';
import T from '@/components/ui/T';

interface Props {
  productType: string;
  excludeHandles: string[];
  isTitanium?: boolean;
  language?: ShopifyLanguage;
}

export default async function RelatedProducts({ productType, excludeHandles, isTitanium = false, language = 'EN' }: Props) {
  const products = await getRelatedProducts(productType, excludeHandles, language).catch(() => []);
  if (!products.length) return null;

  return (
    <section className="border-t border-black/8 pt-14 mt-14">
      {/* No extra px: the PDP wrapper already pads, so heading aligns with the first card */}
      <h2 className="text-heading font-display font-bold mb-6"><T k="product_you_may_like" /></h2>
      <div className="relative overflow-x-hidden">
        <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 overflow-x-auto md:overflow-visible scrollbar-hide snap-x snap-proximity md:snap-none scroll-momentum -mx-4 md:mx-0 px-4 md:px-0 pb-2 md:pb-0">
          {products.map((product) => (
            <div key={product.id} className={`flex-none w-[60vw] sm:w-[45vw] md:w-auto snap-start ${isTitanium ? 'related-ti-card' : ''}`}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        {/* Scroll-end fade — left edge in RTL so the first card is never obscured */}
        <div className={`absolute top-0 right-0 rtl:right-auto rtl:left-0 bottom-2 w-10 bg-gradient-to-l rtl:bg-gradient-to-r to-transparent pointer-events-none md:hidden ${isTitanium ? 'from-[#15171C]' : 'from-chako-bg'}`} />
      </div>
    </section>
  );
}
