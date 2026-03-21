import { httpClient, type SuccessResponse } from '../http/client';

// ── Response types (mirror backend libs/common/src/user-value/types/) ──────────

export interface ImpactSummaryResponse {
  readonly baseline_date: string;
  readonly follower_growth: {
    readonly value: number;
    readonly percent: number;
  };
  readonly engagement_rate_growth: {
    readonly before: number;
    readonly after: number;
    readonly delta_percent: number;
  };
  readonly total_leads_captured: number;
  readonly total_hours_saved: number;
  readonly dollar_value_saved: number;
  readonly automation_handle_rate: number;
}

export interface GrowthChartPoint {
  readonly date: string;
  readonly value: number;
  readonly is_postengage_active: boolean;
}

export type GrowthChartMetric = 'followers' | 'engagement_rate' | 'reach';

export interface WinsFeedItem {
  readonly id: string;
  readonly occurred_at: string;
  readonly category:
    | 'lead'
    | 'follower'
    | 'automation'
    | 'time_saved'
    | 'engagement';
  readonly headline: string;
  readonly detail?: string;
  readonly icon_type: string;
  readonly related_automation_id?: string;
  readonly related_media_id?: string;
}

export interface WinsFeedResponse {
  readonly items: WinsFeedItem[];
  readonly next_cursor: string | null;
}

export interface RoiSummaryResponse {
  readonly weekly_stats: {
    readonly comment_replies_automated: number;
    readonly dms_automated: number;
    readonly story_replies_automated: number;
  };
  readonly user_hourly_rate: number;
  readonly total_minutes_saved: number;
  readonly total_hours_saved: number;
  readonly dollar_value_saved: number;
  readonly weekly_plan_cost: number;
  readonly roi_multiple: number;
}

export type AttributionConfidence = 'high' | 'medium' | 'low';

export interface ValueDelta {
  readonly metric: string;
  readonly baseline_value: number;
  readonly current_value: number;
  readonly delta: number;
  readonly delta_percent: number;
  readonly attribution_confidence: AttributionConfidence;
  readonly attribution_reason: string;
}

export interface BaselineComparisonResponse {
  readonly deltas: ValueDelta[];
  readonly baseline_captured_at: string;
  readonly latest_captured_at: string;
}

export interface MilestoneAchievementResponse {
  readonly milestone_id: string;
  readonly achieved_at: string;
  readonly celebrated: boolean;
  readonly title: string;
  readonly description: string;
  readonly celebration: 'toast' | 'confetti' | 'badge';
}

export interface AutomationCardResponse {
  readonly automation_id: string;
  readonly automation_name: string;
  readonly replies_sent: number;
  readonly leads_captured: number;
  readonly dms_sent: number;
  readonly dms_opened: number;
}

// ── API client ─────────────────────────────────────────────────────────────────

export class ValueAnalyticsApi {
  static async getImpactSummary(): Promise<
    SuccessResponse<ImpactSummaryResponse>
  > {
    const res = await httpClient.get<ImpactSummaryResponse>(
      'api/v1/value/impact-summary'
    );
    return res.data!;
  }

  static async getGrowthChart(
    metric: GrowthChartMetric,
    from: string,
    to: string
  ): Promise<SuccessResponse<GrowthChartPoint[]>> {
    const res = await httpClient.get<GrowthChartPoint[]>(
      `api/v1/value/growth-chart?metric=${metric}&from=${from}&to=${to}`
    );
    return res.data!;
  }

  static async getWinsFeed(
    limit = 20,
    cursor?: string
  ): Promise<SuccessResponse<WinsFeedResponse>> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set('cursor', cursor);
    const res = await httpClient.get<WinsFeedResponse>(
      `api/v1/value/wins-feed?${params}`
    );
    return res.data!;
  }

  static async getRoiSummary(): Promise<SuccessResponse<RoiSummaryResponse>> {
    const res = await httpClient.get<RoiSummaryResponse>(
      'api/v1/value/roi-summary'
    );
    return res.data!;
  }

  static async getBaselineComparison(): Promise<
    SuccessResponse<BaselineComparisonResponse>
  > {
    const res = await httpClient.get<BaselineComparisonResponse>(
      'api/v1/value/baseline-comparison'
    );
    return res.data!;
  }

  static async getMilestones(): Promise<
    SuccessResponse<MilestoneAchievementResponse[]>
  > {
    const res = await httpClient.get<MilestoneAchievementResponse[]>(
      'api/v1/value/milestones'
    );
    return res.data!;
  }

  static async getAutomationCards(): Promise<
    SuccessResponse<AutomationCardResponse[]>
  > {
    const res = await httpClient.get<AutomationCardResponse[]>(
      'api/v1/value/automation-cards'
    );
    return res.data!;
  }

  static async updateHourlyRate(hourlyRate: number): Promise<void> {
    await httpClient.patch('api/v1/users/settings', {
      hourly_rate: hourlyRate,
    });
  }
}

export const valueAnalyticsApi = ValueAnalyticsApi;
