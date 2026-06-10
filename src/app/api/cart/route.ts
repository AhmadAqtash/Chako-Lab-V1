import { NextResponse } from 'next/server';
import { createCart, CartUserError } from '@/lib/storefront';

// POST /api/cart → create a new cart
export async function POST() {
  try {
    const cart = await createCart();
    return NextResponse.json(cart);
  } catch (err) {
    console.error('[/api/cart POST]', err);
    const status = err instanceof CartUserError ? 400 : 500;
    return NextResponse.json({ error: 'Failed to create cart' }, { status });
  }
}
