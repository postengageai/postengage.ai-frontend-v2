import { httpClient } from '../http/client';

export interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  avatar: string | null;
  connection_status: string;
  connected_at: string;
  last_synced_at: string | null;
  is_active: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListSocialAccountsParams {
  platform?: string;
  status?: string;
  search?: string;
}

const SOCIAL_ACCOUNTS_BASE_URL = '/api/v1/social-accounts';

export class SocialAccountsApi {
  // List all connected social accounts
  static async list(
    params?: ListSocialAccountsParams
  ): Promise<SocialAccount[]> {
    const response = await httpClient.get<SocialAccount[]>(
      SOCIAL_ACCOUNTS_BASE_URL,
      {
        params,
      }
    );
    return response.data!;
  }

  // Get specific social account details
  static async get(id: string): Promise<SocialAccount> {
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
  static async setPrimary(id: string): Promise<SocialAccount> {
    const response = await httpClient.patch<SocialAccount>(
      `${SOCIAL_ACCOUNTS_BASE_URL}/${id}/primary`,
      { is_primary: true }
    );
    return response.data!;
  }

  // Refresh account data
  static async refresh(id: string): Promise<SocialAccount> {
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
