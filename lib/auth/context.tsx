'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthApi } from '../api/auth';
import { useAuthStore } from './store';
import { useUserStore } from '../user/store';
import { setLogoutHandler } from '../http/setup';
import { useToast } from '@/hooks/use-toast';

// OAuth routes should not trigger auth redirects (they're popups)
const OAUTH_ROUTES = ['/oauth/success', '/oauth/error'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { actions, sessionActions } = useAuthStore();
  const userStoreActions = useUserStore(state => state.actions);
  const isInitializedRef = useRef(false);

  const isOAuthRoute = OAUTH_ROUTES.some(route => pathname?.startsWith(route));

  // Logout handler — called by HTTP interceptor on unrecoverable 401
  const handleForceLogout = useCallback(() => {
    actions.clearAuth();
    userStoreActions.setUser(null); // Sync legacy user store
    if (!isOAuthRoute) {
      router.push('/login');
    }
  }, [actions, userStoreActions, router, isOAuthRoute]);

  // Setup HTTP client logout handler
  useEffect(() => {
    setLogoutHandler(handleForceLogout);
  }, [handleForceLogout]);

  // Session warning & expiry callbacks
  useEffect(() => {
    sessionActions.setWarningCallback(() => {
      toast({
        title: 'Session Expiring',
        description:
          'Your session will expire in 5 minutes due to inactivity. Click anywhere to stay logged in.',
        duration: 30000,
      });
    });

    sessionActions.setExpiredCallback(async () => {
      try {
        await AuthApi.logout();
      } catch {
        // Best effort
      }
      actions.clearAuth();
      userStoreActions.setUser(null);
      router.push('/login');
      toast({
        variant: 'destructive',
        title: 'Session Expired',
        description:
          'You were logged out due to inactivity. Please log in again.',
      });
    });

    return () => {
      sessionActions.setWarningCallback(null);
      sessionActions.setExpiredCallback(null);
    };
  }, [actions, sessionActions, userStoreActions, router, toast]);

  // Initialize auth — verify user session on first load
  useEffect(() => {
    if (isInitializedRef.current || isOAuthRoute) return;

    const initAuth = async () => {
      try {
        const user = await AuthApi.checkAuth();
        if (user) {
          actions.setUser(user);
          userStoreActions.setUser(user); // Sync legacy user store
          actions.setIsAuthenticated(true);

          // Start activity tracking for session timeout (store handles double-init guard)
          sessionActions.initActivityTracking();
        } else {
          actions.setIsAuthenticated(false);
          actions.setUser(null);
          userStoreActions.setUser(null);
        }
      } catch {
        actions.setIsAuthenticated(false);
        actions.setUser(null);
        userStoreActions.setUser(null);
      } finally {
        actions.setLoading(false);
        actions.setInitialized(true);
        isInitializedRef.current = true;
      }
    };

    initAuth();

    return () => {
      sessionActions.cleanupActivityTracking();
    };
  }, []);

  return <>{children}</>;
}

// ─── Re-export all hooks from store for convenience ─────────────────

export {
  useUser,
  useIsAuthenticated,
  useIsLoading,
  useAuthActions,
  useAuthErrors,
  useAuthErrorActions,
  useSessionActions,
} from './store';

/**
 * Legacy useAuth hook — returns store state for backward compatibility.
 * New code should use specific hooks: useUser(), useIsAuthenticated(), useAuthActions(), etc.
 */
export function useAuth() {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    lastActivity: store.lastActivity,
    errors: store.errors,
    actions: store.actions,
  };
}
