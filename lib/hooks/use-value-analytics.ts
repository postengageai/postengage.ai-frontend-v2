import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  ValueAnalyticsApi,
  type GrowthChartMetric,
  type WinsFeedItem,
} from '../api/value-analytics';
import { queryKeys } from './query-keys';

// ── Shared date-range helper ──────────────────────────────────────────────────

function buildDateRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

// ── Impact summary ─────────────────────────────────────────────────────────────

export function useImpactSummary() {
  return useQuery({
    queryKey: queryKeys.value.impactSummary(),
    queryFn: async () => {
      const res = await ValueAnalyticsApi.getImpactSummary();
      return res.data;
    },
    staleTime: 60 * 1_000,
  });
}

// ── Growth chart ──────────────────────────────────────────────────────────────

export function useGrowthChart(
  metric: GrowthChartMetric,
  days: 7 | 30 | 90 = 30
) {
  const { from, to } = buildDateRange(days);
  return useQuery({
    queryKey: queryKeys.value.growthChart(metric, from, to),
    queryFn: async () => {
      const res = await ValueAnalyticsApi.getGrowthChart(metric, from, to);
      return res.data;
    },
    staleTime: 5 * 60 * 1_000,
  });
}

// ── Wins feed (infinite / paginated) ─────────────────────────────────────────

export function useWinsFeed() {
  return useInfiniteQuery({
    queryKey: queryKeys.value.winsFeed(),
    queryFn: async ({ pageParam }) => {
      const res = await ValueAnalyticsApi.getWinsFeed(
        20,
        typeof pageParam === 'string' ? pageParam : undefined
      );
      return res.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.next_cursor ?? undefined,
    staleTime: 30 * 1_000,
  });
}

/** Prepend a single live item to the wins feed in the React Query cache. */
export function usePrependWinItem() {
  const qc = useQueryClient();
  return (item: WinsFeedItem) => {
    qc.setQueryData(
      queryKeys.value.winsFeed(),
      (old: Parameters<typeof qc.setQueryData>[1]) => {
        if (!old || typeof old !== 'object' || !('pages' in (old as object)))
          return old;
        const pages = (
          old as {
            pages: { items: WinsFeedItem[]; next_cursor: string | null }[];
          }
        ).pages;
        return {
          ...old,
          pages: [
            { ...pages[0], items: [item, ...pages[0].items] },
            ...pages.slice(1),
          ],
        };
      }
    );
  };
}

// ── ROI summary ───────────────────────────────────────────────────────────────

export function useRoiSummary() {
  return useQuery({
    queryKey: queryKeys.value.roiSummary(),
    queryFn: async () => {
      const res = await ValueAnalyticsApi.getRoiSummary();
      return res.data;
    },
    staleTime: 60 * 1_000,
  });
}

// ── Baseline comparison ───────────────────────────────────────────────────────

export function useBaselineComparison() {
  return useQuery({
    queryKey: queryKeys.value.baselineComparison(),
    queryFn: async () => {
      const res = await ValueAnalyticsApi.getBaselineComparison();
      return res.data;
    },
    staleTime: 5 * 60 * 1_000,
  });
}

// ── Milestones ────────────────────────────────────────────────────────────────

export function useMilestones() {
  return useQuery({
    queryKey: queryKeys.value.milestones(),
    queryFn: async () => {
      const res = await ValueAnalyticsApi.getMilestones();
      return res.data;
    },
    staleTime: 5 * 60 * 1_000,
  });
}

// ── Automation performance cards ──────────────────────────────────────────────

export function useAutomationCards() {
  return useQuery({
    queryKey: queryKeys.value.automationCards(),
    queryFn: async () => {
      const res = await ValueAnalyticsApi.getAutomationCards();
      return res.data;
    },
    staleTime: 5 * 60 * 1_000,
  });
}
