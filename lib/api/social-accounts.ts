import { httpClient, SuccessResponse } from '../http/client';
import type { SocialAccount } from '../types/social-accounts';

export interface ListSocialAccountsParams {
  platform?: string;
  cursor?: string;
  limit?: number;
  direction?: 'forward' | 'backward';
}

export class SocialAccountsApi {
  // List all connected social accounts with cursor pagination
  static async list(
    params?: ListSocialAccountsParams
  ): Promise<SuccessResponse<SocialAccount[]>> {
    const response = await httpClient.get<SocialAccount[]>(
      '/api/social-accounts',
      {
        params,
      }
    );
    return response.data!;
  }

  // Get specific social account details
  static async get(id: string): Promise<SuccessResponse<SocialAccount>> {
    const response = await httpClient.get<SocialAccount>(
      `/api/social-accounts/${id}`
    );
    return response.data!;
  }

  // Set account as primary
  static async setPrimary(
    id: string
  ): Promise<SuccessResponse<Partial<SocialAccount>>> {
    const response = await httpClient.patch<Partial<SocialAccount>>(
      `/api/social-accounts/${id}/primary`
    );
    return response.data!;
  }
}

// Hook-friendly API functions
export const socialAccountsApi = {
  list: SocialAccountsApi.list,
  get: SocialAccountsApi.get,
  setPrimary: SocialAccountsApi.setPrimary,
};
