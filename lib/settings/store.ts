import { create } from 'zustand';
import { UserApi, UpdateUserRequest, ChangePasswordRequest } from '../api/user';
import {
  SocialAccountsApi,
  SocialAccount,
  ListSocialAccountsParams,
} from '../api/social-accounts';
import { useUserActions } from '../user/store';

interface SettingsState {
  // User profile
  isProfileLoading: boolean;
  profileError: string | null;

  // Social accounts
  socialAccounts: SocialAccount[];
  isSocialAccountsLoading: boolean;
  socialAccountsError: string | null;

  // Password change
  isChangingPassword: boolean;
  passwordChangeError: string | null;

  // Actions
  actions: {
    // User profile actions
    loadUserProfile: () => Promise<void>;
    updateUserProfile: (updates: UpdateUserRequest) => Promise<void>;
    changePassword: (request: ChangePasswordRequest) => Promise<void>;

    // Social accounts actions
    loadSocialAccounts: (params?: ListSocialAccountsParams) => Promise<void>;
    disconnectSocialAccount: (id: string) => Promise<void>;
    setPrimarySocialAccount: (id: string) => Promise<void>;
    refreshSocialAccount: (id: string) => Promise<void>;

    // Utility actions
    clearErrors: () => void;
  };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial state
  isProfileLoading: false,
  profileError: null,

  socialAccounts: [],
  isSocialAccountsLoading: false,
  socialAccountsError: null,

  isChangingPassword: false,
  passwordChangeError: null,

  actions: {
    // Load user profile
    loadUserProfile: async () => {
      set({ isProfileLoading: true, profileError: null });

      try {
        const user = await UserApi.getProfile();
        useUserActions().setUser(user.data);
        set({ isProfileLoading: false });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load profile';
        set({ isProfileLoading: false, profileError: errorMessage });
      }
    },

    // Update user profile
    updateUserProfile: async (updates: UpdateUserRequest) => {
      set({ isProfileLoading: true, profileError: null });

      try {
        const response = await UserApi.updateProfile(updates);
        useUserActions().setUser(response.data);
        set({ isProfileLoading: false });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update profile';
        set({ isProfileLoading: false, profileError: errorMessage });
      }
    },

    // Change password
    changePassword: async (request: ChangePasswordRequest) => {
      set({ isChangingPassword: true, passwordChangeError: null });

      try {
        await UserApi.changePassword(request);
        set({ isChangingPassword: false });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to change password';
        set({ isChangingPassword: false, passwordChangeError: errorMessage });
      }
    },

    // Load social accounts
    loadSocialAccounts: async (params?: ListSocialAccountsParams) => {
      set({ isSocialAccountsLoading: true, socialAccountsError: null });

      try {
        const accounts = await SocialAccountsApi.list(params);
        set({ socialAccounts: accounts.data, isSocialAccountsLoading: false });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to load social accounts';
        set({
          isSocialAccountsLoading: false,
          socialAccountsError: errorMessage,
        });
      }
    },

    // Disconnect social account
    disconnectSocialAccount: async (id: string) => {
      try {
        await SocialAccountsApi.disconnect(id);
        // Reload the list after disconnecting
        await get().actions.loadSocialAccounts();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to disconnect account';
        set({ socialAccountsError: errorMessage });
      }
    },

    // Set primary social account
    setPrimarySocialAccount: async (id: string) => {
      try {
        await SocialAccountsApi.setPrimary(id);
        // Reload the list after setting primary
        await get().actions.loadSocialAccounts();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to set primary account';
        set({ socialAccountsError: errorMessage });
      }
    },

    // Refresh social account
    refreshSocialAccount: async (id: string) => {
      try {
        await SocialAccountsApi.refresh(id);
        // Reload the list after refreshing
        await get().actions.loadSocialAccounts();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to refresh account';
        set({ socialAccountsError: errorMessage });
      }
    },

    // Clear all errors
    clearErrors: () => {
      set({
        profileError: null,
        socialAccountsError: null,
        passwordChangeError: null,
      });
    },
  },
}));

// Hook selectors for easier usage
export const useSettings = () =>
  useSettingsStore(state => ({
    isProfileLoading: state.isProfileLoading,
    profileError: state.profileError,
    socialAccounts: state.socialAccounts,
    isSocialAccountsLoading: state.isSocialAccountsLoading,
    socialAccountsError: state.socialAccountsError,
    isChangingPassword: state.isChangingPassword,
    passwordChangeError: state.passwordChangeError,
  }));

export const useSettingsActions = () =>
  useSettingsStore(state => state.actions);
