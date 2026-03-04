import { httpClient, SuccessResponse } from '../http/client';
import {
  AnalyticsOverviewResponse,
  AnalyticsActivityResponse,
  IntelligenceAnalyticsResponse,
  AnalyticsPeriod,
} from '../types/analytics';

const ANALYTICS_BASE_URL = '/api/v1/analytics';

export interface OverviewParams {
  period?: AnalyticsPeriod;
  social_account_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface ActivityParams {
  period?: AnalyticsPeriod;
  social_account_id?: string;
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
}

export interface IntelligenceParams {
  period?: AnalyticsPeriod;
  social_account_id?: string;
  start_date?: string;
  end_date?: string;
}

export class AnalyticsApi {
  /**
   * Get high-level analytics overview for a specific period
   */
  static async getOverview(
    params?: OverviewParams
  ): Promise<SuccessResponse<AnalyticsOverviewResponse>> {
    const response = await httpClient.get<AnalyticsOverviewResponse>(
      `${ANALYTICS_BASE_URL}/overview`,
      { params }
    );
    return response.data!;
  }

  /**
   * Get detailed activity timeline with pagination
   */
  static async getActivity(
    params?: ActivityParams
  ): Promise<SuccessResponse<AnalyticsActivityResponse>> {
    const response = await httpClient.get<AnalyticsActivityResponse>(
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
  ): Promise<SuccessResponse<IntelligenceAnalyticsResponse>> {
    const response = await httpClient.get<IntelligenceAnalyticsResponse>(
      `${ANALYTICS_BASE_URL}/intelligence`,
      { params }
    );
    return response.data!;
  }
}

export const analyticsApi = AnalyticsApi;
