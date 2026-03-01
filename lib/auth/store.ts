import { create } from 'zustand';
import { User } from '../schemas/auth';
import { ApiError } from '../http/errors';

// ─── Constants ──────────────────────────────────────────────────────

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SESSION_WARNING = 25 * 60 * 1000; // 25 minutes — warn 5 min before
const ACTIVITY_EVENTS = [
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
] as const;

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

  // Session management (internal — not for component consumption)
  _session: {
    inactivityTimer: ReturnType<typeof setTimeout> | null;
    warningTimer: ReturnType<typeof setTimeout> | null;
    warningCallback: (() => void) | null;
    expiredCallback: (() => void) | null;
    activityListeners: Array<{ event: string; handler: () => void }>;
    isTracking: boolean;
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

  // Session actions
  sessionActions: {
    setWarningCallback: (cb: (() => void) | null) => void;
    setExpiredCallback: (cb: (() => void) | null) => void;
    resetInactivityTimer: () => void;
    initActivityTracking: () => void;
    cleanupActivityTracking: () => void;
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
  _session: {
    inactivityTimer: null,
    warningTimer: null,
    warningCallback: null,
    expiredCallback: null,
    activityListeners: [],
    isTracking: false,
  },
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
      // Cleanup session tracking when auth is cleared
      get().sessionActions.cleanupActivityTracking();
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

  sessionActions: {
    setWarningCallback: (cb: (() => void) | null) => {
      set(state => ({
        _session: { ...state._session, warningCallback: cb },
      }));
    },

    setExpiredCallback: (cb: (() => void) | null) => {
      set(state => ({
        _session: { ...state._session, expiredCallback: cb },
      }));
    },

    resetInactivityTimer: () => {
      const { _session } = get();

      // Clear existing timers
      if (_session.inactivityTimer) clearTimeout(_session.inactivityTimer);
      if (_session.warningTimer) clearTimeout(_session.warningTimer);

      // Warning at 25 minutes
      const newWarningTimer = setTimeout(() => {
        const { isAuthenticated, _session: session } = get();
        if (isAuthenticated && session.warningCallback) {
          session.warningCallback();
        }
      }, SESSION_WARNING);

      // Expire at 30 minutes
      const newInactivityTimer = setTimeout(() => {
        const { isAuthenticated, _session: session, actions } = get();
        if (isAuthenticated) {
          if (session.expiredCallback) {
            session.expiredCallback();
          } else {
            // Fallback: just clear auth state
            actions.clearAuth();
          }
        }
      }, SESSION_TIMEOUT);

      set(state => ({
        _session: {
          ...state._session,
          warningTimer: newWarningTimer,
          inactivityTimer: newInactivityTimer,
        },
      }));
    },

    initActivityTracking: () => {
      const { _session } = get();

      // Prevent double-init
      if (_session.isTracking) return;

      const listeners: Array<{ event: string; handler: () => void }> = [];

      ACTIVITY_EVENTS.forEach(eventName => {
        const handler = () => {
          const { isAuthenticated, actions, sessionActions } = get();
          if (isAuthenticated) {
            actions.updateLastActivity();
            sessionActions.resetInactivityTimer();
          }
        };

        listeners.push({ event: eventName, handler });
        document.addEventListener(eventName, handler, { passive: true });
      });

      set(state => ({
        _session: {
          ...state._session,
          activityListeners: listeners,
          isTracking: true,
        },
      }));

      // Start the initial timer
      get().sessionActions.resetInactivityTimer();
    },

    cleanupActivityTracking: () => {
      const { _session } = get();

      // Clear timers
      if (_session.inactivityTimer) clearTimeout(_session.inactivityTimer);
      if (_session.warningTimer) clearTimeout(_session.warningTimer);

      // Remove all event listeners
      _session.activityListeners.forEach(({ event, handler }) => {
        document.removeEventListener(event, handler);
      });

      set(state => ({
        _session: {
          ...state._session,
          inactivityTimer: null,
          warningTimer: null,
          activityListeners: [],
          isTracking: false,
        },
      }));
    },
  },
}));

// ─── Selector Hooks ─────────────────────────────────────────────────

export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () =>
  useAuthStore(state => state.isAuthenticated);
export const useIsLoading = () => useAuthStore(state => state.isLoading);
export const useAuthActions = () => useAuthStore(state => state.actions);
export const useAuthErrors = () => useAuthStore(state => state.errors);
export const useAuthErrorActions = () =>
  useAuthStore(state => state.errorActions);
export const useSessionActions = () =>
  useAuthStore(state => state.sessionActions);
