// The add-to-cart "ladder" for a product plus its ticked pairing accessories.
//
// Lived inside AddToCartButton until 18 Sep 2026, which meant the mobile sticky
// bar — the first CTA most shoppers see — did NOT have it: it added quantity 1
// and silently dropped every ticked accessory. One implementation, used by the
// main button and the sticky bar, so they can never disagree again.
//
//   1. try the whole bundle in one atomic call (error toast held back);
//   2. if that fails for any reason OTHER than the product itself being sold
//      out, retry with the product alone — the server already drops stale
//      sold-out accessories, so a bundle failure is usually transient;
//   3. tell the shopper if their accessories did not make it.

import type { AddOptions, AddResult, CartLineInput } from '@/context/CartContext';

type AddItems = (lines: CartLineInput[], opts?: AddOptions) => Promise<AddResult>;

export async function addWithPairings(
  addItems: AddItems,
  main: CartLineInput,
  extras: readonly CartLineInput[],
  opts: { source: AddOptions['source']; onExtrasDropped: () => void }
): Promise<AddResult> {
  const first = await addItems(
    [main, ...extras],
    // Bundle attempt: hold the error toast — the main-only retry decides the outcome
    { source: opts.source, ...(extras.length > 0 ? { suppressErrorToast: true } : {}) }
  );
  if (first.ok || first.soldOut || extras.length === 0) return first;

  const second = await addItems([main], { source: opts.source });
  if (second.ok) opts.onExtrasDropped();
  return second;
}
