import { httpClient, SuccessResponse } from '../../http/client';
import { InstagramInsight } from '@/lib/types/instagram';

const INSIGHTS_BASE_URL = '/api/instagram/insights';

export interface GetInsightsParams {
  period?: string;
  metric?: string;
  limit?: number;
  after?: string;
  before?: string;
}

export class InstagramInsightsApi {
  static async getMediaInsights(
    params?: GetInsightsParams
  ): Promise<SuccessResponse<InstagramInsight[]>> {
    const response = await httpClient.get<InstagramInsight[]>(
      `${INSIGHTS_BASE_URL}/media`,
      {
        params,
      }
    );
    return response.data!;
  }

  static async getAccountInsights(
    params?: GetInsightsParams
  ): Promise<SuccessResponse<InstagramInsight[]>> {
    const response = await httpClient.get<InstagramInsight[]>(
      `${INSIGHTS_BASE_URL}/account`,
      {
        params,
      }
    );
    return response.data!;
  }
}

export const instagramInsightsApi = {
  getMediaInsights: InstagramInsightsApi.getMediaInsights,
  getAccountInsights: InstagramInsightsApi.getAccountInsights,
};
