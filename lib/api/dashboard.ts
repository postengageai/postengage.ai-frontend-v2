import { httpClient, SuccessResponse } from '../http/client';
import type { DashboardStats } from '../types/dashboard';

export class DashboardApi {
  static async getStats(): Promise<SuccessResponse<DashboardStats>> {
    const response = await httpClient.get<DashboardStats>(
      '/api/v1/dashboard/stats'
    );
    return response.data!;
  }
}

export const dashboardApi = DashboardApi;
