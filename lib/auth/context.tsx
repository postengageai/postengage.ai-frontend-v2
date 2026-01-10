'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthSession, AuthActions } from '../schemas/auth';
import { ApiError } from '../http/errors';
import { AuthApi } from '../api/auth';
import { useUserStore } from '../user/store';
import { useAuthStore } from './store';

// Omit user from AuthState as it is managed by UserStore
interface AuthState extends Omit<AuthSession, 'user'> {
  errors: {
    loginError?: ApiError;
    signupError?: ApiError;
    verificationError?: ApiError;
    resetPasswordError?: ApiError;
  };
}

type AuthAction =
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'UPDATE_LAST_ACTIVITY' }
  | { type: 'CLEAR_AUTH' }
  | { type: 'CLEAR_ERRORS' }
  | {
      type: 'SET_ERROR';
      payload: { type: keyof AuthState['errors']; error: ApiError };
    };

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true, // Start loading by default
  isInitialized: false,
  lastActivity: undefined,
  errors: {},
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload,
        lastActivity: action.payload ? Date.now() : undefined,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: action.payload,
      };

    case 'UPDATE_LAST_ACTIVITY':
      return {
        ...state,
        lastActivity: Date.now(),
      };

    case 'CLEAR_AUTH':
      return {
        ...initialState,
        isLoading: false,
        isInitialized: true,
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {},
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.type]: action.payload.error,
        },
      };

    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  actions: AuthActions;
  dispatch: React.Dispatch<AuthAction>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/resend-verification',
  '/', // Landing page often public
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();
  const pathname = usePathname();
  const { setUser } = useUserStore(state => state.actions);
  const {
    setIsAuthenticated,
    setInitialized,
    setLoading: setAuthLoading,
  } = useAuthStore(state => state.actions);

  // Initialize auth state by checking session with backend
  useEffect(() => {
    const initAuth = async () => {
      setAuthLoading(true);
      try {
        const user = await AuthApi.checkAuth();
        if (user) {
          setUser(user);
          setIsAuthenticated(true);
          dispatch({ type: 'SET_AUTHENTICATED', payload: true });

          // Redirect authenticated users from public routes to dashboard
          if (PUBLIC_ROUTES.includes(pathname) && pathname !== '/') {
            router.push('/dashboard');
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          dispatch({ type: 'SET_AUTHENTICATED', payload: false });

          // Redirect if not on a public route
          if (!PUBLIC_ROUTES.includes(pathname)) {
            router.push('/login');
          }
        }
      } catch (_error) {
        // console.warn('Failed to check auth status:', _error);
        setUser(null);
        setIsAuthenticated(false);
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });

        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.push('/login');
        }
      } finally {
        dispatch({ type: 'SET_INITIALIZED', payload: true });
        dispatch({ type: 'SET_LOADING', payload: false });
        setInitialized(true);
        setAuthLoading(false);
      }
    };

    initAuth();
  }, [
    dispatch,
    pathname,
    router,
    setUser,
    setIsAuthenticated,
    setInitialized,
    setAuthLoading,
  ]);

  const value: AuthContextType = {
    ...state,
    actions: {
      login: async () => {},
      signup: async () => {},
      logout: async () => {},
      verifyEmail: async () => {},
      resendVerification: async () => {},
      forgotPassword: async () => {},
      resetPassword: async () => {},
      refreshSession: async () => {},
    },
    dispatch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Re-export user hook from store for backward compatibility and convenience
export { useUser } from '../user/store';

export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

export function useIsLoading() {
  const { isLoading } = useAuth();
  return isLoading;
}

export function useIsInitialized() {
  const { isInitialized } = useAuth();
  return isInitialized;
}

export function useAuthActions() {
  const { actions } = useAuth();
  return actions;
}

export function useAuthErrors() {
  const { errors } = useAuth();
  return errors;
}
