'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthSession, User, AuthActions } from '../schemas/auth';
import { ApiError } from '../http/errors';

interface AuthState extends AuthSession {
  errors: {
    loginError?: ApiError;
    signupError?: ApiError;
    verificationError?: ApiError;
    resetPasswordError?: ApiError;
  };
}

type AuthAction =
  | { type: 'SET_USER'; payload: User | null }
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
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  lastActivity: undefined,
  errors: {},
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        lastActivity: Date.now(),
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.state?.user) {
          dispatch({ type: 'SET_USER', payload: parsed.state.user });
        }
      }
    } catch (error) {
      console.warn('Failed to load auth state from storage:', error);
    }

    dispatch({ type: 'SET_INITIALIZED', payload: true });
  }, []);

  // Persist auth state to localStorage
  useEffect(() => {
    if (state.isInitialized) {
      try {
        localStorage.setItem(
          'auth-storage',
          JSON.stringify({
            state: {
              user: state.user,
              isAuthenticated: state.isAuthenticated,
              lastActivity: state.lastActivity,
            },
            version: 1,
          })
        );
      } catch (error) {
        console.warn('Failed to save auth state to storage:', error);
      }
    }
  }, [
    state.user,
    state.isAuthenticated,
    state.lastActivity,
    state.isInitialized,
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

// Helper hooks
export function useUser() {
  const { user } = useAuth();
  return user;
}

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
