'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useLogout() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      // H-7 NOTE: intentionally proceed with client-side logout even when the
      // API call fails (network down, server error) — the httpOnly cookie will
      // expire naturally. Log in dev so it's traceable without alarming users.
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn(
          '[logout] API call failed, proceeding with client logout:',
          err
        );
      }
    } finally {
      // Always redirect to login
      router.push('/login');
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
}
