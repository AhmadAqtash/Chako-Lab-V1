import { NextResponse } from 'next/server';
import { createCart, CartUserError } from '@/lib/storefront';

// POST /api/cart → create a new cart (?lang=ar|en for localized content)
export async function POST(req: Request) {
  try {
    const lang = new URL(req.url).searchParams.get('lang') === 'ar' ? 'AR' : 'EN';
    const cart = await createCart(lang);
    return NextResponse.json(cart);
  } catch (err) {
    console.error('[/api/cart POST]', err);
    const status = err instanceof CartUserError ? 400 : 500;
    return NextResponse.json({ error: 'Failed to create cart' }, { status });
  }
}
