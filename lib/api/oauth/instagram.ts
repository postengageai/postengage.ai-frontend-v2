import { httpClient, SuccessResponse } from '@/lib/http/client';

export interface OAuthInitResponse {
  url: string;
  message: string;
}

export interface OAuthRevokeResponse {
  message: string;
}

export class InstagramOAuthApi {
  private static readonly BASE_URL = 'api/v1/instagram/oauth';

  static async init(): Promise<SuccessResponse<OAuthInitResponse>> {
    const response = await httpClient.get<OAuthInitResponse>(
      `${this.BASE_URL}/`
    );
    return response.data!;
  }

  static async revoke(
    accountId: string
  ): Promise<SuccessResponse<OAuthRevokeResponse>> {
    const response = await httpClient.post<OAuthRevokeResponse>(
      `${this.BASE_URL}/${accountId}/revoke`
    );
    return response.data!;
  }

  static async openAuthorization(): Promise<void> {
    try {
      const response = await this.init();
      const { url } = response.data;
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');

      if (!newWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      newWindow.focus();
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to initiate Instagram authorization'
      );
    }
  }

  static isCallbackUrl(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('code') && urlParams.has('state');
  }

  static getCallbackParams(): { code: string; state: string } | null {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      return { code, state };
    }

    return null;
  }
}
