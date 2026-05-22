import { getRelatedProducts } from '@/lib/shopify';
import ProductCard from './ProductCard';
import T from '@/components/ui/T';

interface Props {
  productType: string;
  excludeHandles: string[];
}

export default async function RelatedProducts({ productType, excludeHandles }: Props) {
  const products = await getRelatedProducts(productType, excludeHandles).catch(() => []);
  if (!products.length) return null;

  return (
    <section className="border-t border-black/8 pt-14 mt-14">
      <h2 className="text-xl font-bold mb-6"><T k="product_you_may_like" /></h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
