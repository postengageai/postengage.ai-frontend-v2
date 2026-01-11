import { create } from 'zustand';
import { PricingResponse } from '../types/pricing';
import { PricingApi } from '../api/pricing';

interface PricingState {
  data: PricingResponse | null;
  isLoading: boolean;
  error: string | null;
  actions: {
    fetchPricing: () => Promise<void>;
  };
}

export const usePricingStore = create<PricingState>(set => ({
  data: null,
  isLoading: false,
  error: null,
  actions: {
    fetchPricing: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await PricingApi.getPackages();
        set({ data: response.data, isLoading: false });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch pricing';
        set({
          error: errorMessage,
          isLoading: false,
        });
      }
    },
  },
}));
