import { httpClient, SuccessResponse } from '../http/client';
import {
  AnalyticsOverviewResponse,
  AnalyticsActivityResponse,
  IntelligenceAnalyticsResponse,
  GetAnalyticsDto,
} from '../types/analytics';

const ANALYTICS_BASE_URL = '/api/v1/analytics';

export class AnalyticsApi {
  /**
   * Get high-level analytics overview for a specific period
   */
  static async getOverview(
    params?: GetAnalyticsDto
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
    params?: GetAnalyticsDto
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
    params?: GetAnalyticsDto
  ): Promise<SuccessResponse<IntelligenceAnalyticsResponse>> {
    const response = await httpClient.get<IntelligenceAnalyticsResponse>(
      `${ANALYTICS_BASE_URL}/intelligence`,
      { params }
    );
    return response.data!;
  }
}

export const analyticsApi = AnalyticsApi;
