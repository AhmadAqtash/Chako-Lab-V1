import T from '@/components/ui/T';
import type { ShopifyMetafield } from '@/types/shopify';

interface Props {
  metafields?: (ShopifyMetafield | null)[] | null;
}

function getMf(metafields: Props['metafields'], key: string): ShopifyMetafield | null {
  return metafields?.find((m) => m?.key === key) ?? null;
}

export default function ProductFeatures({ metafields }: Props) {
  const features = [1, 2, 3]
    .map((n) => ({
      title: getMf(metafields, `feature_${n}_title`)?.value ?? null,
      desc: getMf(metafields, `feature_${n}_desc`)?.value ?? null,
      image: getMf(metafields, `feature_${n}_image`)?.reference?.image ?? null,
    }))
    .filter((f) => f.title);

  if (!features.length) return null;

  return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-8 py-12 md:py-16">
      <h2 className="text-xl md:text-2xl font-bold mb-6">
        <T k="product_features" />
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feature, i) => (
          <div key={i} className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
            {feature.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={feature.image.url}
                alt={feature.image.altText ?? feature.title ?? ''}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-chako-accent" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className="inline-block bg-chako-highlight text-chako-dark text-xs font-bold px-3 py-1 rounded-full mb-2.5">
                {feature.title}
              </span>
              {feature.desc && (
                <p className="text-white/85 text-sm leading-relaxed">{feature.desc}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
