import { create } from 'zustand';
import { User } from '../schemas/auth';
import { ApiError } from '../http/errors';

// ─── Types ──────────────────────────────────────────────────────────

export interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  lastActivity: number | undefined;

  // Errors
  errors: {
    loginError?: ApiError;
    signupError?: ApiError;
    verificationError?: ApiError;
    resetPasswordError?: ApiError;
  };

  // Actions
  actions: {
    setUser: (user: User | null) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    setLoading: (isLoading: boolean) => void;
    setInitialized: (initialized: boolean) => void;
    updateLastActivity: () => void;
    clearAuth: () => void;
    updateUser: (updates: Partial<User>) => void;
  };

  // Error actions
  errorActions: {
    clearErrors: () => void;
    setError: (
      type: keyof AuthStore['errors'],
      error: ApiError | undefined
    ) => void;
  };
}

// ─── Store ──────────────────────────────────────────────────────────

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start true — we check auth on mount
  isInitialized: false,
  lastActivity: undefined,
  errors: {},
};

export const useAuthStore = create<AuthStore>()((set, get) => ({
  ...initialState,

  actions: {
    setUser: (user: User | null) => {
      set({ user });
    },

    setIsAuthenticated: (isAuthenticated: boolean) => {
      set({
        isAuthenticated,
        lastActivity: isAuthenticated ? Date.now() : undefined,
      });
    },

    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },

    setInitialized: (initialized: boolean) => {
      set({ isInitialized: initialized });
    },

    updateLastActivity: () => {
      set({ lastActivity: Date.now() });
    },

    clearAuth: () => {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        lastActivity: undefined,
        errors: {},
      });
    },

    updateUser: (updates: Partial<User>) => {
      const current = get().user;
      if (current) {
        set({ user: { ...current, ...updates } });
      }
    },
  },

  errorActions: {
    clearErrors: () => {
      set({ errors: {} });
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
}));

// ─── Session Timeout Management ─────────────────────────────────────

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SESSION_WARNING = 25 * 60 * 1000; // 25 minutes — warn 5 min before

let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
let warningTimer: ReturnType<typeof setTimeout> | null = null;
let sessionWarningCallback: (() => void) | null = null;
let sessionExpiredCallback: (() => void) | null = null;

// Store event listener references for proper cleanup
const activityListenerRefs: Array<{
  event: string;
  handler: () => void;
}> = [];

export const setSessionWarningCallback = (cb: () => void) => {
  sessionWarningCallback = cb;
};

export const setSessionExpiredCallback = (cb: () => void) => {
  sessionExpiredCallback = cb;
};

const resetInactivityTimer = () => {
  if (inactivityTimer) clearTimeout(inactivityTimer);
  if (warningTimer) clearTimeout(warningTimer);

  // Warning at 25 minutes
  warningTimer = setTimeout(() => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated && sessionWarningCallback) {
      sessionWarningCallback();
    }
  }, SESSION_WARNING);

  // Expire at 30 minutes
  inactivityTimer = setTimeout(() => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      if (sessionExpiredCallback) {
        sessionExpiredCallback();
      } else {
        // Fallback: just clear auth state
        useAuthStore.getState().actions.clearAuth();
      }
    }
  }, SESSION_TIMEOUT);
};

export const initActivityTracking = () => {
  const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];

  events.forEach(eventName => {
    const handler = () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        useAuthStore.getState().actions.updateLastActivity();
        resetInactivityTimer();
      }
    };

    // Store reference for cleanup
    activityListenerRefs.push({ event: eventName, handler });
    document.addEventListener(eventName, handler, { passive: true });
  });

  resetInactivityTimer();
};

export const cleanupActivityTracking = () => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  if (warningTimer) {
    clearTimeout(warningTimer);
    warningTimer = null;
  }

  // Remove all event listeners using stored references
  activityListenerRefs.forEach(({ event, handler }) => {
    document.removeEventListener(event, handler);
  });
  activityListenerRefs.length = 0;
};

// ─── Selector Hooks ─────────────────────────────────────────────────

export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () =>
  useAuthStore(state => state.isAuthenticated);
export const useIsLoading = () => useAuthStore(state => state.isLoading);
export const useAuthActions = () => useAuthStore(state => state.actions);
export const useAuthErrors = () => useAuthStore(state => state.errors);
export const useAuthErrorActions = () =>
  useAuthStore(state => state.errorActions);
