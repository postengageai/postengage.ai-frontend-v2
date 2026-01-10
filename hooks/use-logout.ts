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
    } catch {
      // Continue with logout even if API call fails
    } finally {
      // Always redirect to login
      router.push('/login');
      setIsLoggingOut(false);
    }
  };

  return { logout, isLoggingOut };
}
