import { NextResponse } from 'next/server';
import { addToCart, updateCartLine, removeCartLines, CartUserError, type CartLanguage } from '@/lib/storefront';

interface Context {
  params: { cartId: string };
}

// ?lang=ar|en → @inContext language for localized line titles/options
function langFrom(req: Request): CartLanguage {
  return new URL(req.url).searchParams.get('lang') === 'ar' ? 'AR' : 'EN';
}

function errorResponse(err: unknown, fallback: string) {
  if (err instanceof CartUserError) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
  return NextResponse.json({ error: fallback }, { status: 500 });
}

// POST /api/cart/:cartId/lines → add lines
export async function POST(req: Request, { params }: Context) {
  try {
    const cartId = decodeURIComponent(params.cartId);
    const { lines } = await req.json() as { lines: { merchandiseId: string; quantity: number }[] };
    const cart = await addToCart(cartId, lines, langFrom(req));
    return NextResponse.json(cart);
  } catch (err) {
    console.error('[/api/cart/lines POST]', err);
    return errorResponse(err, 'Failed to add to cart');
  }
}

// PATCH /api/cart/:cartId/lines → update quantities
export async function PATCH(req: Request, { params }: Context) {
  try {
    const cartId = decodeURIComponent(params.cartId);
    const { lines } = await req.json() as { lines: { id: string; quantity: number }[] };
    const cart = await updateCartLine(cartId, lines, langFrom(req));
    return NextResponse.json(cart);
  } catch (err) {
    console.error('[/api/cart/lines PATCH]', err);
    return errorResponse(err, 'Failed to update cart');
  }
}

// DELETE /api/cart/:cartId/lines → remove lines
export async function DELETE(req: Request, { params }: Context) {
  try {
    const cartId = decodeURIComponent(params.cartId);
    const { lineIds } = await req.json() as { lineIds: string[] };
    const cart = await removeCartLines(cartId, lineIds, langFrom(req));
    return NextResponse.json(cart);
  } catch (err) {
    console.error('[/api/cart/lines DELETE]', err);
    return errorResponse(err, 'Failed to remove from cart');
  }
}
