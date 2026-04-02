import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAINTENANCE_UNTIL_ISO =
  process.env.MAINTENANCE_UNTIL_ISO || '2026-04-04T11:00:00.000Z'; // 4 Nisan 2026 14:00 (TR, UTC+3)

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  const pathname = url.pathname;

  // Bakım sayfası açık kalsın, middleware döngüye girmesin.
  if (pathname.startsWith('/bakim')) return NextResponse.next();

  // Admin panelini dışarıda bırak (istersen kaldırabilirsin)
  if (pathname.startsWith('/admin')) return NextResponse.next();

  // API çağrılarını ve Next.js statik asset'lerini bozmayalım
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const now = new Date();
  const until = new Date(MAINTENANCE_UNTIL_ISO);

  if (now <= until) {
    url.pathname = '/bakim';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // API ve Next statik asset'lerini bozmayalım; bakım sayfasını da hariç tutalım.
    '/((?!api|_next/static|_next/image|favicon.ico|bakim|admin).*)',
  ],
};

