import { useQuery } from '@tanstack/react-query';
import { DashboardApi } from '../api/dashboard';
import { CreditsApi } from '../api/credits';
import { queryKeys } from './query-keys';

// ── Dashboard stats ────────────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async () => {
      const res = await DashboardApi.getStats();
      return res.data;
    },
    // Dashboard stats can be slightly stale — refresh every 2 minutes
    staleTime: 2 * 60 * 1_000,
  });
}

export function useConversationChart(days: 7 | 30 = 7) {
  return useQuery({
    queryKey: queryKeys.dashboard.conversationChart(days),
    queryFn: async () => {
      const res = await DashboardApi.getConversationChart(days);
      return res.data;
    },
    staleTime: 5 * 60 * 1_000,
  });
}

// ── Credits balance ────────────────────────────────────────────────────────────

export function useCreditsBalance() {
  return useQuery({
    queryKey: queryKeys.credits.balance(),
    queryFn: async () => {
      const res = await CreditsApi.getBalance();
      return res.data;
    },
    staleTime: 60 * 1_000,
  });
}
