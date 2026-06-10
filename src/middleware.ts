import { NextRequest, NextResponse } from 'next/server';
import { LOCALES, DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/locale';

// The chako_lang cookie is ONLY used here, to pick a locale for legacy
// un-prefixed URLs. Rendering never reads it — the URL is the source of truth.
function detectLocale(req: NextRequest): Locale {
  const cookie = req.cookies.get('chako_lang')?.value;
  if (cookie && isLocale(cookie)) return cookie;
  const accept = req.headers.get('accept-language') ?? '';
  return /(^|,|\s)ar\b/i.test(accept) ? 'ar' : DEFAULT_LOCALE;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const pathLocale = LOCALES.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );

  if (pathLocale) {
    // Remember the visitor's locale for future legacy-URL redirects
    const res = NextResponse.next();
    res.cookies.set('chako_lang', pathLocale, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    });
    return res;
  }

  // Legacy/bare URL (old links, bookmarks, ads): 307 to the locale-prefixed
  // path, preserving the full path and query string so nothing ever 404s.
  const url = req.nextUrl.clone();
  url.pathname = `/${detectLocale(req)}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  // Skip API routes, Next internals, and static files (anything with a dot)
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
