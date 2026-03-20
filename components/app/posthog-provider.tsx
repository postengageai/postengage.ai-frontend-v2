'use client';

/**
 * PostHogProvider — initialises PostHog once and identifies the user
 * whenever the user store resolves.
 *
 * Rendered inside <Providers> so it has access to the user store.
 */

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useUser } from '@/lib/user/store';
import { analytics } from '@/lib/analytics';

export function PostHogProvider() {
  const user = useUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Identify when user loads ───────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      analytics.reset();
      return;
    }
    analytics.identify(user.id, {
      email: user.email,
      name:
        `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || undefined,
      plan: user.role ?? undefined,
    });
  }, [user]);

  // ── Track page views for soft navigations ─────────────────────────────────
  useEffect(() => {
    if (pathname) {
      // PostHog's autocapture is off; fire manual pageview on route change
      const url =
        pathname +
        (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      analytics.track('$pageview' as never, { $current_url: url } as never);
    }
  }, [pathname, searchParams]);

  return null;
}
