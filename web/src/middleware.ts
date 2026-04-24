import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PATHS = ['/', '/links'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!ADMIN_PATHS.includes(pathname)) return NextResponse.next();

  const session = request.cookies.get('admin_session')?.value;
  if (session === process.env.ADMIN_SECRET) return NextResponse.next();

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/', '/links'],
};
