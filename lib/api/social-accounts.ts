import { httpClient, SuccessResponse } from '../http/client';
import type {
  SocialAccount as SocialAccountType,
  SocialPlatform,
  SocialAccountConnectionStatus,
} from '../types/settings';

export interface SocialAccount extends SocialAccountType {}

export interface ListSocialAccountsParams {
  platform?: SocialPlatform;
  status?: SocialAccountConnectionStatus;
  search?: string;
}

const SOCIAL_ACCOUNTS_BASE_URL = '/api/v1/social-accounts';

export class SocialAccountsApi {
  // List all connected social accounts
  static async list(
    params?: ListSocialAccountsParams
  ): Promise<SuccessResponse<SocialAccount[]>> {
    const response = await httpClient.get<SocialAccount[]>(
      SOCIAL_ACCOUNTS_BASE_URL,
      {
        params,
      }
    );
    return response.data!;
  }

  // Get specific social account details
  static async get(id: string): Promise<SuccessResponse<SocialAccount>> {
    const response = await httpClient.get<SocialAccount>(
      `${SOCIAL_ACCOUNTS_BASE_URL}/${id}`
    );
    return response.data!;
  }

  // Disconnect social account
  static async disconnect(id: string): Promise<void> {
    await httpClient.delete<void>(`${SOCIAL_ACCOUNTS_BASE_URL}/${id}`);
  }

  // Set account as primary
  static async setPrimary(id: string): Promise<SuccessResponse<SocialAccount>> {
    const response = await httpClient.patch<SocialAccount>(
      `${SOCIAL_ACCOUNTS_BASE_URL}/${id}/primary`,
      { is_primary: true }
    );
    return response.data!;
  }

  // Refresh account data
  static async refresh(id: string): Promise<SuccessResponse<SocialAccount>> {
    const response = await httpClient.post<SocialAccount>(
      `${SOCIAL_ACCOUNTS_BASE_URL}/${id}/refresh`
    );
    return response.data!;
  }
}

// Hook-friendly API functions
export const socialAccountsApi = {
  list: SocialAccountsApi.list,
  get: SocialAccountsApi.get,
  disconnect: SocialAccountsApi.disconnect,
  setPrimary: SocialAccountsApi.setPrimary,
  refresh: SocialAccountsApi.refresh,
};
