import { httpClient, SuccessResponse } from '../http/client';
import { PricingResponse } from '../types/pricing';

export class PricingApi {
  static async getPackages(): Promise<SuccessResponse<PricingResponse>> {
    const response = await httpClient.get<PricingResponse>(
      'api/v1/payments/packages'
    );
    return response.data!;
  }
}
