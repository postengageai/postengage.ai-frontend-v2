import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Routes that do NOT require authentication.
 * All other routes are protected — unauthenticated users are redirected to /login.
 */
const PUBLIC_PATHS = new Set([
  '/login',
  '/2fa',
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

/**
 * Persists the affiliate ?ref= param to a cookie on the response so it
 * survives redirects. The signup page reads this cookie as a fallback when
 * sessionStorage hasn't been populated (e.g. when the middleware redirected
 * the user away before the page could render and call sessionStorage.setItem).
 */
function attachAffiliateRefCookie(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  const ref = request.nextUrl.searchParams.get('ref');
  if (ref && /^[A-Za-z0-9_-]{3,30}$/.test(ref)) {
    response.cookies.set('affiliate_ref', ref, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // must be JS-readable so the signup page can consume it
    });
  }
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The backend sets an HttpOnly cookie named `access_token` on login.
  // We only check for its *presence* here — actual JWT validation happens
  // inside the NestJS guards on every API call.
  const hasSession = Boolean(request.cookies.get('refresh_token')?.value);

  // ── Authenticated user hitting home or login → send to dashboard.
  // /login: no point staying there if already logged in.
  // /: marketing home page, logged-in users should go straight to dashboard.
  // We intentionally do NOT redirect from /signup or other auth pages —
  // users may want to create a new account, and auto-redirecting causes
  // the ?ref= affiliate param to be lost.
  const REDIRECT_TO_DASHBOARD = new Set(['/', '/login']);
  if (hasSession && REDIRECT_TO_DASHBOARD.has(pathname)) {
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    return attachAffiliateRefCookie(response, request);
  }

  // ── Unauthenticated user hitting a protected route → send to login.
  // Also save any ?ref= so it isn't lost if the user arrived via a referral
  // link while not logged in and the route happens to be protected.
  if (!hasSession && !isPublicPath(pathname)) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the intended destination so we can redirect back after login
    if (pathname !== '/login') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    const response = NextResponse.redirect(loginUrl);
    return attachAffiliateRefCookie(response, request);
  }

  // ── Public route with a ?ref= param: save it to a cookie proactively
  // (handles the case where the user refreshes or navigates away before JS runs).
  const ref = request.nextUrl.searchParams.get('ref');
  if (ref && /^[A-Za-z0-9_-]{3,30}$/.test(ref)) {
    const response = NextResponse.next();
    response.cookies.set('affiliate_ref', ref, {
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
    });
    return response;
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
