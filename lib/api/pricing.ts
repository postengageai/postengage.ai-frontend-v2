import { httpClient, SuccessResponse } from '../http/client';
import { PricingResponse } from '../types/pricing';

export class PricingApi {
  /**
   * Get available pricing plans
   * GET /api/v1/payments/packages
   */
  static async getPlans(): Promise<SuccessResponse<PricingResponse>> {
    const response = await httpClient.get<PricingResponse>(
      '/api/v1/payments/packages'
    );
    return response.data!;
  }
}

// Create a singleton instance for convenience
export const pricingApi = new PricingApi();
