import {
  httpClient,
  type SuccessResponse,
  type PaginationMeta,
} from '../http/client';

// ── Types ─────────────────────────────────────────────────────────────────────

export const ScheduledPostStatus = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHING: 'publishing',
  PUBLISHED: 'published',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;
export type ScheduledPostStatus =
  (typeof ScheduledPostStatus)[keyof typeof ScheduledPostStatus];

export const ScheduledPostMediaType = {
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  REEL: 'REEL',
  STORY: 'STORY',
  CAROUSEL: 'CAROUSEL',
} as const;
export type ScheduledPostMediaType =
  (typeof ScheduledPostMediaType)[keyof typeof ScheduledPostMediaType];

export interface ScheduledPost {
  readonly id: string;
  readonly user_id: string;
  readonly social_account_id: string;
  readonly media_type: ScheduledPostMediaType;
  readonly caption: string;
  readonly media_urls: string[];
  readonly hashtags: string[];
  readonly location_id?: string;
  readonly scheduled_at: string; // ISO
  readonly timezone: string;
  readonly status: ScheduledPostStatus;
  readonly ig_container_id?: string;
  readonly ig_media_id?: string;
  readonly linked_automation_id?: string;
  readonly last_error?: string;
  readonly retry_count: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface PostAnalytics {
  readonly id: string;
  readonly scheduled_post_id?: string;
  readonly ig_media_id: string;
  readonly published_at: string;
  readonly fetched_at?: string;
  readonly reach: number;
  readonly impressions: number;
  readonly views: number;
  readonly likes: number;
  readonly comments_count: number;
  readonly saves: number;
  readonly shares: number;
  readonly video_views?: number;
  readonly engagement_rate: number;
  readonly save_rate: number;
  readonly caption: string;
  readonly hashtags: string[];
}

export interface BestTimeRecommendation {
  readonly day_of_week: number; // 0 = Sunday
  readonly hour_utc: number;
  readonly engagement_score_normalized: number;
  readonly confidence_level: 'high' | 'medium' | 'low';
  readonly based_on_post_count: number;
  readonly reasoning: string;
}

export interface PublishingLimit {
  readonly quota_usage: number;
  readonly quota_total: number;
  readonly remaining: number;
}

export interface ScheduledPostsListResponse {
  readonly items: ScheduledPost[];
  readonly pagination: PaginationMeta;
}

// ── Create / Update DTOs ──────────────────────────────────────────────────────

export interface CreateScheduledPostDto {
  readonly media_type: ScheduledPostMediaType;
  readonly caption: string;
  readonly media_urls: string[];
  readonly hashtags?: string[];
  readonly location_id?: string;
  readonly scheduled_at: string; // ISO
  readonly timezone?: string;
  readonly linked_automation_id?: string;
  readonly save_as_draft?: boolean;
}

export interface UpdateScheduledPostDto {
  readonly caption?: string;
  readonly media_urls?: string[];
  readonly hashtags?: string[];
  readonly scheduled_at?: string;
  readonly timezone?: string;
  readonly linked_automation_id?: string;
}

// ── API client ─────────────────────────────────────────────────────────────────

export class SchedulerApi {
  static async createPost(
    dto: CreateScheduledPostDto
  ): Promise<SuccessResponse<ScheduledPost>> {
    const res = await httpClient.post<ScheduledPost>(
      'api/v1/scheduler/posts',
      dto
    );
    return res.data!;
  }

  static async listPosts(params?: {
    status?: ScheduledPostStatus;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<SuccessResponse<ScheduledPostsListResponse>> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.from) query.set('from', params.from);
    if (params?.to) query.set('to', params.to);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const res = await httpClient.get<ScheduledPostsListResponse>(
      `api/v1/scheduler/posts?${query}`
    );
    return res.data!;
  }

  static async getPost(id: string): Promise<SuccessResponse<ScheduledPost>> {
    const res = await httpClient.get<ScheduledPost>(
      `api/v1/scheduler/posts/${id}`
    );
    return res.data!;
  }

  static async updatePost(
    id: string,
    dto: UpdateScheduledPostDto
  ): Promise<SuccessResponse<ScheduledPost>> {
    const res = await httpClient.patch<ScheduledPost>(
      `api/v1/scheduler/posts/${id}`,
      dto
    );
    return res.data!;
  }

  static async cancelPost(id: string): Promise<SuccessResponse<void>> {
    const res = await httpClient.delete<void>(`api/v1/scheduler/posts/${id}`);
    return res.data!;
  }

  static async getCalendar(
    from: string,
    to: string
  ): Promise<SuccessResponse<ScheduledPost[]>> {
    const res = await httpClient.get<ScheduledPost[]>(
      `api/v1/scheduler/calendar?from=${from}&to=${to}`
    );
    return res.data!;
  }

  static async getPostAnalytics(
    id: string
  ): Promise<SuccessResponse<PostAnalytics>> {
    const res = await httpClient.get<PostAnalytics>(
      `api/v1/scheduler/posts/${id}/analytics`
    );
    return res.data!;
  }

  static async getBestTimes(): Promise<
    SuccessResponse<BestTimeRecommendation[]>
  > {
    const res = await httpClient.get<BestTimeRecommendation[]>(
      'api/v1/scheduler/best-times'
    );
    return res.data!;
  }

  static async getPublishingLimit(): Promise<SuccessResponse<PublishingLimit>> {
    const res = await httpClient.get<PublishingLimit>(
      'api/v1/scheduler/publishing-limit'
    );
    return res.data!;
  }

  static async bulkSchedule(
    posts: CreateScheduledPostDto[]
  ): Promise<SuccessResponse<{ created: number; failed: number }>> {
    const res = await httpClient.post<{ created: number; failed: number }>(
      'api/v1/scheduler/posts/bulk',
      { posts }
    );
    return res.data!;
  }
}

export const schedulerApi = SchedulerApi;
