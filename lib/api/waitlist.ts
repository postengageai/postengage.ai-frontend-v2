import { httpClient, SuccessResponse } from '../http/client';

export interface WaitlistStatus {
  joined: boolean;
  total: number;
}

export class WaitlistApi {
  static async getStatus(
    platform: string
  ): Promise<SuccessResponse<WaitlistStatus>> {
    const response = await httpClient.get<WaitlistStatus>(
      `/api/v1/waitlist/${platform}`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async join(
    platform: string
  ): Promise<SuccessResponse<WaitlistStatus>> {
    const response = await httpClient.post<WaitlistStatus>(
      `/api/v1/waitlist/${platform}/join`,
      {}
    );
    if (response.error) throw response.error;
    return response.data;
  }
}
