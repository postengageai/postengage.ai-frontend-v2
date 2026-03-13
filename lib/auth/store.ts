import { create } from 'zustand';
import { AuthSession } from '../schemas/auth';
import { ApiError } from '../http/errors';
import { useUserStore } from '../user/store';

export interface AuthStore extends Omit<AuthSession, 'user'> {
  actions: {
    setLoading: (isLoading: boolean) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
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
      type: keyof Omit<AuthStore['errors'], 'clearErrors' | 'setError'>,
      error: ApiError | undefined
    ) => void;
  };
}

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  lastActivity: undefined,
};

export const useAuthStore = create<AuthStore>()((set, get) => ({
  ...initialState,

  actions: {
    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },

    setIsAuthenticated: (isAuthenticated: boolean) => {
      set({ isAuthenticated });
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
}));

// Session timeout management (30 minutes inactivity)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

let inactivityTimer: NodeJS.Timeout | null = null;

const resetInactivityTimer = () => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  inactivityTimer = setTimeout(() => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      // console.log('Session expired due to inactivity');
      useAuthStore.getState().actions.clearAuth();
      // Note: We don't call logout API here since cookies will be cleared naturally
    }
  }, SESSION_TIMEOUT);
};

// M-9 FIX: store the cleanup fn at module scope so repeated calls to
// initActivityTracking() (React strict-mode double-mount, re-auth) always
// remove old listeners before adding new ones — prevents N-fold accumulation
// of listeners and cascading inactivity timer resets.
let activityTrackingCleanup: (() => void) | null = null;

// Initialize activity tracking
export const initActivityTracking = () => {
  // Tear down any existing listeners first
  if (activityTrackingCleanup) {
    activityTrackingCleanup();
    activityTrackingCleanup = null;
  }

  const events = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const;

  const handler = () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      useAuthStore.getState().actions.updateLastActivity();
      resetInactivityTimer();
    }
  };

  // { passive: true } — none of these call preventDefault; marking passive
  // lets the browser optimise scroll perf.
  events.forEach(event =>
    document.addEventListener(event, handler, { passive: true })
  );

  resetInactivityTimer();

  activityTrackingCleanup = () => {
    events.forEach(event => document.removeEventListener(event, handler));
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
  };

  return activityTrackingCleanup;
};

// Cleanup function — call on logout / component unmount
export const cleanupActivityTracking = () => {
  if (activityTrackingCleanup) {
    activityTrackingCleanup();
    activityTrackingCleanup = null;
  }
};

// Helper hooks
export const useUser = () => useUserStore(state => state.user);
export const useIsAuthenticated = () =>
  useAuthStore(state => state.isAuthenticated);
export const useIsLoading = () => useAuthStore(state => state.isLoading);
export const useAuthActions = () => useAuthStore(state => state.actions);
export const useAuthErrors = () => useAuthStore(state => state.errors);
