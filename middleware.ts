import { NextRequest, NextResponse } from 'next/server';

/**
 * How premium SaaS (Linear, Vercel, Stripe, Notion) handle auth routing:
 *
 * 1. Middleware is the ONLY route guard — it runs server-side on every request
 *    before any page renders. No client-side redirect waterfalls.
 *
 * 2. Auth state is derived from the cookie on the server, not from an async
 *    client-side API call that can race with the page render.
 *
 * 3. Public "auth-only" pages (login, reset-password, etc.) immediately
 *    redirect authenticated users to the app — no flash of the login page.
 *
 * 4. Protected pages immediately redirect unauthenticated users to login
 *    with a `redirect` param so they land back where they started after login.
 *
 * Cookie name must match what the backend sets on successful login.
 */

const AUTH_COOKIE = 'access_token';

/**
 * Routes that require an authenticated session.
 * Any path that starts with one of these prefixes is protected.
 */
const PROTECTED_PREFIXES = ['/dashboard'];

/**
 * Routes that are only for unauthenticated users.
 * Authenticated users visiting these will be sent to /dashboard.
 *
 * IMPORTANT: keep this list in sync with lib/auth/context.tsx PUBLIC_ROUTES
 * so both the middleware and the client-side handler agree on what's public.
 */
const AUTH_ONLY_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/resend-verification',
  '/account-locked',
  '/account-suspended',
  '/2fa',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const isAuthenticated = Boolean(token);

  const isProtectedRoute = PROTECTED_PREFIXES.some(prefix =>
    pathname.startsWith(prefix)
  );

  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  // Unauthenticated user trying to access a protected route →
  // redirect to /login and remember where they were going
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access an auth-only page →
  // skip the login/reset screens entirely and send them to the app
  if (isAuthOnlyRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static assets
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
