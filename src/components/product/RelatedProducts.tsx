import { getRelatedProducts } from '@/lib/shopify';
import ProductCard from './ProductCard';
import T from '@/components/ui/T';

interface Props {
  productType: string;
  excludeHandles: string[];
  isTitanium?: boolean;
}

export default async function RelatedProducts({ productType, excludeHandles, isTitanium = false }: Props) {
  const products = await getRelatedProducts(productType, excludeHandles).catch(() => []);
  if (!products.length) return null;

  return (
    <section className="border-t border-black/8 pt-14 mt-14">
      <h2 className="text-heading font-display font-bold mb-6 px-4 md:px-0"><T k="product_you_may_like" /></h2>
      <div className="relative overflow-x-hidden">
        <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-4 overflow-x-auto md:overflow-visible scrollbar-hide snap-x snap-proximity md:snap-none scroll-momentum -mx-4 md:mx-0 px-4 md:px-0 pb-2 md:pb-0">
          {products.map((product) => (
            <div key={product.id} className={`flex-none w-[60vw] sm:w-[45vw] md:w-auto snap-start ${isTitanium ? 'related-ti-card' : ''}`}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <div className={`absolute top-0 right-0 bottom-2 w-10 bg-gradient-to-l to-transparent pointer-events-none md:hidden ${isTitanium ? 'from-[#15171C]' : 'from-chako-bg'}`} />
      </div>
    </section>
  );
}
