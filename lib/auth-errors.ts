// Maps backend error codes to human-friendly messages
// Never expose raw error codes to users

type ErrorCode = string;

interface ErrorMapping {
  title: string;
  message: string;
}

const errorMappings: Record<ErrorCode, ErrorMapping> = {
  // Login errors
  AUTH_LOGIN_FAILED_000005: {
    title: 'Invalid credentials',
    message:
      'The email or password you entered is incorrect. Please try again.',
  },
  AUTH_EMAIL_NOT_VERIFIED_000008: {
    title: 'Email not verified',
    message:
      'Please verify your email before logging in. Check your inbox for the verification link.',
  },
  RES_USER_NOT_FOUND_000402: {
    title: 'Account not found',
    message:
      "We couldn't find an account with that email. Would you like to create one?",
  },

  // Signup errors
  AUTH_ACCOUNT_ALREADY_EXISTS_000014: {
    title: 'Account exists',
    message:
      'An account with this email already exists. Try logging in instead.',
  },

  // Verification errors
  AUTH_EMAIL_ALREADY_VERIFIED_000017: {
    title: 'Already verified',
    message: 'Your email is already verified. You can log in to your account.',
  },
  AUTH_VERIFICATION_TOKEN_ACTIVE_000018: {
    title: 'Email already sent',
    message:
      'A verification email was recently sent. Please check your inbox or wait a few minutes before requesting another.',
  },

  // Rate limiting
  RATE_LIMIT_EXCEEDED: {
    title: 'Too many attempts',
    message: 'Please wait a moment before trying again.',
  },

  // Generic errors
  VALIDATION_ERROR: {
    title: 'Invalid input',
    message: 'Please check your information and try again.',
  },
  NETWORK_ERROR: {
    title: 'Connection issue',
    message:
      "We're having trouble connecting. Please check your internet and try again.",
  },
  TOKEN_INVALID: {
    title: 'Invalid link',
    message: 'This link is invalid or has already been used.',
  },
  TOKEN_EXPIRED: {
    title: 'Link expired',
    message: 'This link has expired. Please request a new one.',
  },
};

export function getErrorMessage(code: ErrorCode | undefined): ErrorMapping {
  if (!code) {
    return {
      title: 'Something went wrong',
      message: 'An unexpected error occurred. Please try again.',
    };
  }

  return (
    errorMappings[code] || {
      title: 'Something went wrong',
      message: 'An unexpected error occurred. Please try again.',
    }
  );
}

export function mapHttpError(status: number): ErrorMapping {
  switch (status) {
    case 429:
      return errorMappings.RATE_LIMIT_EXCEEDED;
    case 404:
      return errorMappings.RES_USER_NOT_FOUND_000402;
    default:
      return getErrorMessage(undefined);
  }
}
