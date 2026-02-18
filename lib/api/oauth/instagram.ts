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
    // Open the popup immediately to avoid browser blocking
    // Note: We cannot use 'noopener' here because we need the window reference to redirect it later
    const newWindow = window.open('', '_blank', 'width=600,height=700');

    if (!newWindow) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }

    // Set loading content
    newWindow.document.write(`
      <html>
        <head>
          <title>Connecting to Instagram...</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f9fafb; color: #111827; }
            .loader { border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin-right: 12px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .container { display: flex; align-items: center; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="loader"></div>
            <span>Connecting to Instagram...</span>
          </div>
        </body>
      </html>
    `);

    try {
      const response = await this.init();
      const { url } = response.data;

      // Navigate the popup to the auth URL
      newWindow.location.href = url;
      newWindow.focus();
    } catch (error) {
      // Close the popup if initialization fails
      newWindow.close();
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
