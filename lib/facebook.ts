import { FacebookAuthResponse, FacebookStatusResponse } from '@/types/facebook';

export const FacebookAuth = {
  login: (
    scope: string = 'public_profile,email,instagram_basic,pages_show_list,pages_read_engagement,instagram_manage_comments,instagram_manage_messages,instagram_content_publish'
  ): Promise<FacebookAuthResponse> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.FB) {
        reject(new Error('Facebook SDK not loaded'));
        return;
      }

      window.FB.login(
        (response: FacebookStatusResponse) => {
          if (response.authResponse) {
            resolve(response.authResponse);
          } else {
            reject(
              new Error('User cancelled login or did not fully authorize.')
            );
          }
        },
        { scope }
      );
    });
  },

  getLoginStatus: (): Promise<FacebookStatusResponse> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.FB) {
        reject(new Error('Facebook SDK not loaded'));
        return;
      }

      window.FB.getLoginStatus((response: FacebookStatusResponse) => {
        resolve(response);
      });
    });
  },
};
