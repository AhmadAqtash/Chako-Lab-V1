import { NextResponse } from 'next/server';
import { getCart } from '@/lib/storefront';

// GET /api/cart/:cartId → fetch cart
export async function GET(_req: Request, { params }: { params: { cartId: string } }) {
  try {
    // cartId from URL is base64-encoded because of the gid:// prefix
    const cartId = decodeURIComponent(params.cartId);
    const cart = await getCart(cartId);
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    return NextResponse.json(cart);
  } catch (err) {
    console.error('[/api/cart GET]', err);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}
