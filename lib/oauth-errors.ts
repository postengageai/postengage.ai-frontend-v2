// OAuth Error handling - maps backend error responses to user-friendly messages
// Based on the error contract: EXT_INST_OAUTH_*

export interface OAuthErrorDetails {
  provider: string;
  provider_error?: string;
  provider_reason?: string;
  action?:
    | 'retry_authorization'
    | 'contact_support'
    | 'choose_different_account';
  documentation_url?: string;
  support_reference?: string;
}

export interface OAuthError {
  message: string;
  code: string;
  details: OAuthErrorDetails;
  timestamp: string;
}

export interface OAuthErrorResponse {
  success: false;
  error: OAuthError;
}

export interface OAuthSuccessResponse {
  success: true;
  data: {
    account: {
      id: string;
      platform: string;
      username: string;
      avatar_url?: string;
      connected_at: string;
    };
  };
}

// User-friendly messages for different OAuth failure scenarios
const oauthErrorMessages: Record<string, { heading: string; message: string }> =
  {
    access_denied: {
      heading: 'Connection Not Completed',
      message:
        'You closed the authorization window before completing the connection.',
    },
    user_denied: {
      heading: 'Connection Not Completed',
      message: 'You closed Instagram before completing the connection.',
    },
    permissions_denied: {
      heading: 'Permissions Required',
      message:
        "We didn't receive the required permissions to connect your account.",
    },
    token_expired: {
      heading: 'Session Expired',
      message: 'The authorization session expired. Please try again.',
    },
    invalid_grant: {
      heading: 'Connection Failed',
      message: 'The authorization was not completed successfully.',
    },
    server_error: {
      heading: 'Service Unavailable',
      message:
        'Instagram is temporarily unavailable. Please try again in a few minutes.',
    },
    // Backend Error Codes
    EXT_INST_OAUTH_ACCESS_DENIED_000526: {
      heading: 'Access Denied',
      message: 'You chose not to allow access to your Instagram account.',
    },
    MISSING_DATA: {
      heading: 'Missing Information',
      message:
        'We successfully connected to Instagram, but did not receive all the required account information.',
    },
  };

export function getOAuthErrorMessage(error: OAuthError): {
  heading: string;
  message: string;
} {
  const providerReason = error.details?.provider_reason;
  const providerError = error.details?.provider_error;

  // Try to match specific error reasons first
  if (providerReason && oauthErrorMessages[providerReason]) {
    return oauthErrorMessages[providerReason];
  }

  // Then try provider error codes
  if (providerError && oauthErrorMessages[providerError]) {
    return oauthErrorMessages[providerError];
  }

  // Fallback to the backend message
  return {
    heading: 'Connection Not Completed',
    message:
      error.message || 'Something went wrong while connecting your account.',
  };
}

export function isRetryableError(error: OAuthError): boolean {
  return error.details?.action === 'retry_authorization';
}

export function capitalizeProvider(provider: string): string {
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}
