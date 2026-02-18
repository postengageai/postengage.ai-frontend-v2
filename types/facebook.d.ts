export interface FacebookAuthResponse {
  accessToken: string;
  expiresIn: number;
  signedRequest: string;
  userID: string;
  grantedScopes?: string;
  reauthorize_required_in?: number;
}

export interface FacebookStatusResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse: FacebookAuthResponse | null;
}

export interface FacebookLoginOptions {
  scope?: string;
  return_scopes?: boolean;
  enable_profile_selector?: boolean;
  profile_selector_ids?: string;
}

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: {
      init: (params: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: FacebookStatusResponse) => void,
        options?: FacebookLoginOptions
      ) => void;
      getLoginStatus: (
        callback: (response: FacebookStatusResponse) => void
      ) => void;
      AppEvents: {
        logPageView: () => void;
      };
    };
  }
}
