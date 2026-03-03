import { httpClient, SuccessResponse, PaginationMeta } from '../http/client';
import {
  AnalyticsOverview,
  Activity,
  IntelligenceMetrics,
} from '../types/analytics';

const ANALYTICS_BASE_URL = '/api/analytics';

export interface OverviewParams {
  period?: 'today' | 'week' | 'month' | 'year';
  social_account_id?: string;
}

export interface ActivityParams {
  period?: 'today' | 'week' | 'month' | 'year';
  type?: string;
  social_account_id?: string;
  limit?: number;
  cursor?: string;
}

export interface IntelligenceParams {
  period?: 'today' | 'week' | 'month' | 'year';
  bot_id?: string;
}

export interface ActivityResponse {
  data: Activity[];
  pagination?: PaginationMeta;
}

export class AnalyticsApi {
  /**
   * Get high-level analytics overview for a specific period
   */
  static async getOverview(
    params?: OverviewParams
  ): Promise<SuccessResponse<AnalyticsOverview>> {
    const response = await httpClient.get<AnalyticsOverview>(
      `${ANALYTICS_BASE_URL}/overview`,
      { params }
    );
    return response.data!;
  }

  /**
   * Get detailed activity timeline with cursor-based pagination
   */
  static async getActivity(
    params?: ActivityParams
  ): Promise<SuccessResponse<Activity[]>> {
    const response = await httpClient.get<Activity[]>(
      `${ANALYTICS_BASE_URL}/activity`,
      { params }
    );
    return response.data!;
  }

  /**
   * Get intelligence and bot performance metrics
   */
  static async getIntelligence(
    params?: IntelligenceParams
  ): Promise<SuccessResponse<IntelligenceMetrics>> {
    const response = await httpClient.get<IntelligenceMetrics>(
      `${ANALYTICS_BASE_URL}/intelligence`,
      { params }
    );
    return response.data!;
  }
}

export const analyticsApi = AnalyticsApi;
