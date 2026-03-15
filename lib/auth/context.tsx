'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { AuthApi } from '../api/auth';
import { useUserStore } from '../user/store';
import { useAuthStore } from './store';
import { setLogoutHandler } from '../http/setup';
import { useRouter } from 'next/navigation';

// ── Types ──────────────────────────────────────────────────────────────────────

interface AuthContextType {
  /** True while the initial session check is in flight */
  isLoading: boolean;
  /** True once the backend confirmed a valid session */
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────────

/**
 * AuthProvider is intentionally lean — route protection is handled server-side
 * by middleware.ts (checks for the `access_token` cookie before rendering).
 *
 * This provider's only jobs are:
 *  1. Resolve the current user from the backend once on mount
 *  2. Expose isAuthenticated / isLoading to the rest of the app
 *  3. Wire up the global logout handler so any 401 response clears state
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { setUser } = useUserStore(state => state.actions);
  const {
    isAuthenticated,
    isLoading,
    actions: { setIsAuthenticated, setLoading },
  } = useAuthStore();

  // Wire up the HTTP-client logout handler so 401 responses clear auth state
  useEffect(() => {
    setLogoutHandler(() => {
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    });
  }, [setUser, setIsAuthenticated, router]);

  // Resolve the user once on mount — single network call, no polling
  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      setLoading(true);
      try {
        const user = await AuthApi.checkAuth();
        if (cancelled) return;
        if (user) {
          setUser(user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initAuth();
    return () => {
      cancelled = true;
    };
  }, []); // intentionally empty — run once on mount

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useIsAuthenticated() {
  return useAuth().isAuthenticated;
}

export function useIsLoading() {
  return useAuth().isLoading;
}

// Re-export for backward compatibility
export { useUser } from '../user/store';
