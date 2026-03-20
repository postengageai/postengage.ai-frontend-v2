import { create } from 'zustand';
import {
  CreditBalance,
  CreditTransaction,
  CreditUsage,
} from '../types/credits';
import { CreditsApi } from '../api/credits';

interface CreditsState {
  balance: CreditBalance | null;
  transactions: CreditTransaction[];
  transactionsTotal: number;
  usage: CreditUsage | null;
  isLoading: boolean;
  isTransactionsLoading: boolean;
  isUsageLoading: boolean;
  error: string | null;
  actions: {
    setBalance: (balance: CreditBalance | null) => void;
    setTransactions: (transactions: CreditTransaction[], total: number) => void;
    setUsage: (usage: CreditUsage | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    fetchBalance: () => Promise<void>;
    fetchTransactions: (limit?: number, page?: number) => Promise<void>;
    fetchUsage: (days?: number, from?: string, to?: string) => Promise<void>;
    reset: () => void;
  };
}

export const useCreditsStore = create<CreditsState>(set => ({
  balance: null,
  transactions: [],
  transactionsTotal: 0,
  usage: null,
  isLoading: false,
  isTransactionsLoading: false,
  isUsageLoading: false,
  error: null,

  actions: {
    setBalance: balance => set({ balance }),
    setTransactions: (transactions, total) =>
      set({ transactions, transactionsTotal: total }),
    setUsage: usage => set({ usage }),
    setLoading: isLoading => set({ isLoading }),
    setError: error => set({ error }),

    fetchBalance: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await CreditsApi.getBalance();
        set({ balance: response.data, isLoading: false });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch balance';
        set({
          error: errorMessage,
          isLoading: false,
        });
      }
    },

    fetchTransactions: async (limit = 20, skip = 0) => {
      set({ isTransactionsLoading: true, error: null });
      try {
        const page = Math.floor(skip / limit) + 1;
        const response = await CreditsApi.getTransactions({ limit, page });
        set({
          transactions: response.data,
          transactionsTotal: response.pagination?.total ?? 0,
          isTransactionsLoading: false,
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to fetch transactions';
        set({
          error: errorMessage,
          isTransactionsLoading: false,
        });
      }
    },

    fetchUsage: async (days, from, to) => {
      set({ isUsageLoading: true, error: null });
      try {
        const response = await CreditsApi.getUsage({ days, from, to });
        set({ usage: response.data, isUsageLoading: false });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch usage data';
        set({
          error: errorMessage,
          isUsageLoading: false,
        });
      }
    },

    reset: () =>
      set({
        balance: null,
        transactions: [],
        transactionsTotal: 0,
        usage: null,
        isLoading: false,
        isTransactionsLoading: false,
        error: null,
      }),
  },
}));

export const useCreditsBalance = () => useCreditsStore(state => state.balance);
export const useCreditsTransactions = () =>
  useCreditsStore(state => state.transactions);
export const useCreditsUsage = () => useCreditsStore(state => state.usage);
export const useCreditsTransactionsTotal = () =>
  useCreditsStore(state => state.transactionsTotal);
export const useCreditsTransactionsLoading = () =>
  useCreditsStore(state => state.isTransactionsLoading);
export const useCreditsUsageLoading = () =>
  useCreditsStore(state => state.isUsageLoading);
export const useCreditsLoading = () =>
  useCreditsStore(state => state.isLoading);
export const useCreditsError = () => useCreditsStore(state => state.error);
export const useCreditsActions = () => useCreditsStore(state => state.actions);
