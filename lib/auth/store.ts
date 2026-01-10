import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthSession, AuthActions, User } from '../schemas/auth';
import { ApiError } from '../http/errors';

interface AuthStore extends AuthSession {
  actions: {
    setUser: (user: User | null) => void;
    setLoading: (isLoading: boolean) => void;
    setInitialized: (isInitialized: boolean) => void;
    updateLastActivity: () => void;
    clearAuth: () => void;
  };
  errors: {
    loginError?: ApiError;
    signupError?: ApiError;
    verificationError?: ApiError;
    resetPasswordError?: ApiError;
    clearErrors: () => void;
    setError: (
      type: keyof Omit<AuthStore['errors'], 'clearErrors'>,
      error: ApiError
    ) => void;
  };
}

const initialState: Omit<AuthStore, 'actions' | 'errors'> = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  lastActivity: undefined,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      actions: {
        setUser: (user: User | null) => {
          set({
            user,
            isAuthenticated: !!user,
            lastActivity: Date.now(),
          });
        },

        setLoading: (isLoading: boolean) => {
          set({ isLoading });
        },

        setInitialized: (isInitialized: boolean) => {
          set({ isInitialized });
        },

        updateLastActivity: () => {
          set({ lastActivity: Date.now() });
        },

        clearAuth: () => {
          set(initialState);
        },
      },

      errors: {
        loginError: undefined,
        signupError: undefined,
        verificationError: undefined,
        resetPasswordError: undefined,

        clearErrors: () => {
          set({
            errors: {
              ...get().errors,
              loginError: undefined,
              signupError: undefined,
              verificationError: undefined,
              resetPasswordError: undefined,
            },
          });
        },

        setError: (type, error) => {
          set({
            errors: {
              ...get().errors,
              [type]: error,
            },
          });
        },
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
      }),
    }
  )
);

// Session timeout management (30 minutes inactivity)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

let inactivityTimer: NodeJS.Timeout | null = null;

const resetInactivityTimer = () => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  inactivityTimer = setTimeout(() => {
    const { user, isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated && user) {
      console.log('Session expired due to inactivity');
      useAuthStore.getState().actions.clearAuth();
      // Note: We don't call logout API here since cookies will be cleared naturally
    }
  }, SESSION_TIMEOUT);
};

// Initialize activity tracking
export const initActivityTracking = () => {
  const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];

  events.forEach(event => {
    document.addEventListener(event, () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        useAuthStore.getState().actions.updateLastActivity();
        resetInactivityTimer();
      }
    });
  });

  resetInactivityTimer();
};

// Cleanup function
export const cleanupActivityTracking = () => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
};

// Helper hooks
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () =>
  useAuthStore(state => state.isAuthenticated);
export const useIsLoading = () => useAuthStore(state => state.isLoading);
export const useIsInitialized = () =>
  useAuthStore(state => state.isInitialized);
export const useAuthActions = () => useAuthStore(state => state.actions);
export const useAuthErrors = () => useAuthStore(state => state.errors);
