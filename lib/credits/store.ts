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
  invoices: CreditTransaction[];
  invoicesTotal: number;
  isLoading: boolean;
  isTransactionsLoading: boolean;
  error: string | null;
  actions: {
    setBalance: (balance: CreditBalance | null) => void;
    setTransactions: (transactions: CreditTransaction[], total: number) => void;
    setUsage: (usage: CreditUsage | null) => void;
    setInvoices: (invoices: CreditTransaction[], total: number) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    fetchBalance: () => Promise<void>;
    fetchTransactions: (limit?: number, skip?: number) => Promise<void>;
    fetchUsage: (days?: number, from?: string, to?: string) => Promise<void>;
    fetchInvoices: (limit?: number, skip?: number) => Promise<void>;
    reset: () => void;
  };
}

export const useCreditsStore = create<CreditsState>(set => ({
  balance: null,
  transactions: [],
  transactionsTotal: 0,
  usage: null,
  invoices: [],
  invoicesTotal: 0,
  isLoading: false,
  isTransactionsLoading: false,
  error: null,

  actions: {
    setBalance: balance => set({ balance }),
    setTransactions: (transactions, total) =>
      set({ transactions, transactionsTotal: total }),
    setUsage: usage => set({ usage }),
    setInvoices: (invoices, total) => set({ invoices, invoicesTotal: total }),
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
        const response = await CreditsApi.getTransactions({ limit, skip });
        set({
          transactions: response.data.transactions,
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

    fetchUsage: async (days, from, to) => {
      set({ isLoading: true, error: null });
      try {
        const response = await CreditsApi.getUsage({ days, from, to });
        set({ usage: response.data, isLoading: false });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch usage data';
        set({
          error: errorMessage,
          isLoading: false,
        });
      }
    },

    fetchInvoices: async (limit = 20, skip = 0) => {
      set({ isLoading: true, error: null });
      try {
        const response = await CreditsApi.getInvoices({ limit, skip });
        set({
          invoices: response.data.transactions,
          invoicesTotal: response.data.meta.total,
          isLoading: false,
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch invoices';
        set({
          error: errorMessage,
          isLoading: false,
        });
      }
    },

    reset: () =>
      set({
        balance: null,
        transactions: [],
        transactionsTotal: 0,
        usage: null,
        invoices: [],
        invoicesTotal: 0,
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
export const useCreditsInvoices = () =>
  useCreditsStore(state => state.invoices);
export const useCreditsTransactionsTotal = () =>
  useCreditsStore(state => state.transactionsTotal);
export const useCreditsInvoicesTotal = () =>
  useCreditsStore(state => state.invoicesTotal);
export const useCreditsLoading = () =>
  useCreditsStore(state => state.isLoading);
export const useCreditsTransactionsLoading = () =>
  useCreditsStore(state => state.isTransactionsLoading);
export const useCreditsError = () => useCreditsStore(state => state.error);
export const useCreditsActions = () => useCreditsStore(state => state.actions);
