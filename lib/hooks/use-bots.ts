import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IntelligenceApi } from '../api/intelligence';
import type { CreateBotDto, UpdateBotDto } from '../types/intelligence';
import { queryKeys } from './query-keys';

// ── List ───────────────────────────────────────────────────────────────────────

export function useBots(params?: { social_account_id?: string }) {
  return useQuery({
    queryKey: queryKeys.bots.lists(),
    queryFn: async () => {
      const res = await IntelligenceApi.getBots(params);
      return res.data;
    },
    staleTime: 60 * 1_000,
  });
}

// ── Single bot ─────────────────────────────────────────────────────────────────

export function useBot(id: string) {
  return useQuery({
    queryKey: queryKeys.bots.detail(id),
    queryFn: async () => {
      const res = await IntelligenceApi.getBot(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────────

export function useCreateBot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBotDto) => IntelligenceApi.createBot(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bots.lists() });
    },
  });
}

export function useUpdateBot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBotDto }) =>
      IntelligenceApi.updateBot(id, data),
    onSuccess: (res, { id }) => {
      qc.setQueryData(queryKeys.bots.detail(id), res.data);
      qc.invalidateQueries({ queryKey: queryKeys.bots.lists() });
    },
  });
}

export function useDeleteBot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => IntelligenceApi.deleteBot(id),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: queryKeys.bots.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.bots.lists() });
    },
  });
}
