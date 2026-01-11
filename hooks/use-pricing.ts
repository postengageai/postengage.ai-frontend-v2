import { useEffect } from 'react';
import { usePricingStore } from '@/lib/pricing/store';

export function usePricing() {
  const { data, isLoading, error, actions } = usePricingStore();

  useEffect(() => {
    // Only fetch if we don't have data and aren't currently loading or in error state
    // We can add a more sophisticated stale check if needed later
    if (!data && !isLoading && !error) {
      actions.fetchPricing();
    }
  }, [data, isLoading, error, actions]);

  return {
    data,
    isLoading,
    error,
    refetch: actions.fetchPricing,
  };
}
