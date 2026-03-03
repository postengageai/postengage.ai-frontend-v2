import { httpClient, SuccessResponse } from '../http/client';
import { Plan } from '../types/pricing';

export class PricingApi {
  /**
   * Get available pricing plans
   * GET /api/payments/plans
   */
  static async getPlans(): Promise<SuccessResponse<Plan[]>> {
    const response = await httpClient.get<Plan[]>('/api/payments/plans');
    return response.data!;
  }
}

// Create a singleton instance for convenience
export const pricingApi = new PricingApi();
