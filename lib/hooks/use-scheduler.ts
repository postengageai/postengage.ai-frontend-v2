'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import {
  SchedulerApi,
  type ScheduledPost,
  type ScheduledPostStatus,
  type PostAnalytics,
  type BestTimeRecommendation,
  type PublishingLimit,
  type ScheduledPostsListResponse,
  type CreateScheduledPostDto,
  type UpdateScheduledPostDto,
} from '@/lib/api/scheduler';

// ── Calendar ───────────────────────────────────────────────────────────────────

export function useCalendar(
  from: string,
  to: string
): UseQueryResult<ScheduledPost[]> {
  return useQuery({
    queryKey: queryKeys.scheduler.calendar(from, to),
    queryFn: async () => {
      const res = await SchedulerApi.getCalendar(from, to);
      return res.data;
    },
    staleTime: 60_000,
    enabled: !!from && !!to,
  });
}

// ── Scheduled posts list ───────────────────────────────────────────────────────

export function useScheduledPosts(params?: {
  status?: ScheduledPostStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}): UseQueryResult<ScheduledPostsListResponse> {
  return useQuery({
    queryKey: queryKeys.scheduler.posts(params ?? {}),
    queryFn: async () => {
      const res = await SchedulerApi.listPosts(params);
      return res.data;
    },
    staleTime: 30_000,
  });
}

// ── Single post ────────────────────────────────────────────────────────────────

export function useScheduledPost(id: string): UseQueryResult<ScheduledPost> {
  return useQuery({
    queryKey: queryKeys.scheduler.post(id),
    queryFn: async () => {
      const res = await SchedulerApi.getPost(id);
      return res.data;
    },
    staleTime: 30_000,
    enabled: !!id,
  });
}

// ── Best times ─────────────────────────────────────────────────────────────────

export function useBestTimes(): UseQueryResult<BestTimeRecommendation[]> {
  return useQuery({
    queryKey: queryKeys.scheduler.bestTimes(),
    queryFn: async () => {
      const res = await SchedulerApi.getBestTimes();
      return res.data;
    },
    staleTime: 5 * 60_000, // 5 min
  });
}

// ── Publishing limit ───────────────────────────────────────────────────────────

export function usePublishingLimit(): UseQueryResult<PublishingLimit> {
  return useQuery({
    queryKey: queryKeys.scheduler.publishingLimit(),
    queryFn: async () => {
      const res = await SchedulerApi.getPublishingLimit();
      return res.data;
    },
    staleTime: 60_000,
  });
}

// ── Post analytics ─────────────────────────────────────────────────────────────

export function usePostAnalytics(id: string): UseQueryResult<PostAnalytics> {
  return useQuery({
    queryKey: queryKeys.scheduler.postAnalytics(id),
    queryFn: async () => {
      const res = await SchedulerApi.getPostAnalytics(id);
      return res.data;
    },
    staleTime: 5 * 60_000,
    enabled: !!id,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────────

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateScheduledPostDto) => SchedulerApi.createPost(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduler.all });
    },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateScheduledPostDto }) =>
      SchedulerApi.updatePost(id, dto),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduler.post(id) });
      qc.invalidateQueries({ queryKey: queryKeys.scheduler.all });
    },
  });
}

export function useCancelPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SchedulerApi.cancelPost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduler.all });
    },
  });
}

export function useBulkSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (posts: Parameters<typeof SchedulerApi.bulkSchedule>[0]) =>
      SchedulerApi.bulkSchedule(posts),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scheduler.all });
    },
  });
}
