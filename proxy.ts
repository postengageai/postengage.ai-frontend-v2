import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Routes that do NOT require authentication.
 * All other routes are protected — unauthenticated users are redirected to /login.
 */
const PUBLIC_PATHS = new Set([
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/resend-verification',
  '/account-locked',
  '/account-suspended',
  '/',
]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  // All /oauth/* paths are public (covers new providers added in the future)
  if (pathname.startsWith('/oauth/')) return true;
  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The backend sets an HttpOnly cookie named `access_token` on login.
  // We only check for its *presence* here — actual JWT validation happens
  // inside the NestJS guards on every API call.
  const hasSession = Boolean(request.cookies.get('access_token')?.value);

  // ── Authenticated user hitting a public route → send to dashboard
  if (hasSession && isPublicPath(pathname) && pathname !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ── Unauthenticated user hitting a protected route → send to login
  if (!hasSession && !isPublicPath(pathname)) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the intended destination so we can redirect back after login
    if (pathname !== '/login') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static  (static files)
     *  - _next/image   (image optimisation)
     *  - favicon.ico
     *  - public assets (svg, png, jpg, jpeg, gif, webp, ico, txt)
     *
     * This ensures the middleware runs on every page navigation but not on
     * static-asset requests (which don't need auth checks).
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt)$).*)',
  ],
};
