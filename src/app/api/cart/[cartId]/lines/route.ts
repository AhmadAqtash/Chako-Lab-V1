import { NextResponse } from 'next/server';
import { addToCart, updateCartLine, removeCartLines } from '@/lib/storefront';

interface Context {
  params: { cartId: string };
}

// POST /api/cart/:cartId/lines → add lines
export async function POST(req: Request, { params }: Context) {
  try {
    const cartId = decodeURIComponent(params.cartId);
    const { lines } = await req.json() as { lines: { merchandiseId: string; quantity: number }[] };
    const cart = await addToCart(cartId, lines);
    return NextResponse.json(cart);
  } catch (err) {
    console.error('[/api/cart/lines POST]', err);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

// PATCH /api/cart/:cartId/lines → update quantities
export async function PATCH(req: Request, { params }: Context) {
  try {
    const cartId = decodeURIComponent(params.cartId);
    const { lines } = await req.json() as { lines: { id: string; quantity: number }[] };
    const cart = await updateCartLine(cartId, lines);
    return NextResponse.json(cart);
  } catch (err) {
    console.error('[/api/cart/lines PATCH]', err);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

// DELETE /api/cart/:cartId/lines → remove lines
export async function DELETE(req: Request, { params }: Context) {
  try {
    const cartId = decodeURIComponent(params.cartId);
    const { lineIds } = await req.json() as { lineIds: string[] };
    const cart = await removeCartLines(cartId, lineIds);
    return NextResponse.json(cart);
  } catch (err) {
    console.error('[/api/cart/lines DELETE]', err);
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}
