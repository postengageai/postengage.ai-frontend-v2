import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Server-side auth middleware — runs BEFORE any page renders.
 *
 * Uses the same httpOnly cookies the backend sets on login.
 * Common cookie names: access_token, token, session, connect.sid
 * We check for any of them to be safe.
 */
const AUTH_COOKIE_NAMES = [
  'access_token',
  'token',
  'session',
  'connect.sid',
  'jwt',
];

const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/resend-verification',
];

// OAuth callbacks need special treatment — they're popups, not normal pages
const OAUTH_ROUTES = ['/oauth/success', '/oauth/error'];

function hasAuthCookie(request: NextRequest): boolean {
  return AUTH_COOKIE_NAMES.some(name => request.cookies.has(name));
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    route => pathname === route || pathname.startsWith(route + '/')
  );
}

function isOAuthRoute(pathname: string): boolean {
  return OAUTH_ROUTES.some(
    route => pathname === route || pathname.startsWith(route)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip OAuth popup routes — they handle their own lifecycle
  if (isOAuthRoute(pathname)) {
    return NextResponse.next();
  }

  const authenticated = hasAuthCookie(request);

  // Root "/" — smart redirect based on auth state
  if (pathname === '/') {
    const destination = authenticated ? '/dashboard' : '/login';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Not authenticated + trying to access protected route → login with redirect
  if (!authenticated && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url);
    // Preserve intended destination so we can redirect back after login
    if (pathname !== '/dashboard') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated + on public auth pages (login/signup) → dashboard
  if (authenticated && isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, logo, images
     * - API routes
     */
    '/((?!_next/static|_next/image|favicon\\.ico|logo\\.jpeg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
