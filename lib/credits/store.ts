import { create } from 'zustand';
import {
  CreditBalance,
  CreditTransaction,
  CreditTransactionsResponse,
  UsageBreakdown,
} from '../types/credits';
import { CreditsApi } from '../api/credits';

interface CreditsState {
  balance: CreditBalance | null;
  transactions: CreditTransaction[];
  transactionsTotal: number;
  usage: UsageBreakdown | null;
  isLoading: boolean;
  isTransactionsLoading: boolean;
  isUsageLoading: boolean;
  error: string | null;
  actions: {
    setBalance: (balance: CreditBalance | null) => void;
    setTransactions: (transactions: CreditTransaction[], total: number) => void;
    setUsage: (usage: UsageBreakdown | null) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    fetchBalance: () => Promise<void>;
    fetchTransactions: (limit?: number, page?: number) => Promise<void>;
    fetchUsage: (period?: string) => Promise<void>;
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

    fetchTransactions: async (limit = 20, page = 1) => {
      set({ isTransactionsLoading: true, error: null });
      try {
        const response = await CreditsApi.getTransactions({
          limit,
          page,
        });
        set({
          transactions: response.data.data,
          transactionsTotal: response.data.meta.total,
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

    fetchUsage: async (period = 'month') => {
      set({ isUsageLoading: true, error: null });
      try {
        let days = 30;
        if (period === 'today') days = 1;
        if (period === 'week' || period === '7d') days = 7;

        const response = await CreditsApi.getUsage({ days });
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
