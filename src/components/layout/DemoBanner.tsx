import { IS_DEMO } from '@/lib/shopify';

export default function DemoBanner() {
  if (!IS_DEMO) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
      <p className="text-xs text-amber-800 font-medium">
        Demo mode — showing placeholder products.{' '}
        <span className="opacity-70">
          Add <code className="font-mono bg-amber-100 px-1 rounded">SHOPIFY_STOREFRONT_ACCESS_TOKEN</code> to{' '}
          <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code> to load real products.
        </span>
      </p>
    </div>
  );
}
