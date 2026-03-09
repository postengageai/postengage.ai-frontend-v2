// Maps backend PE-* error codes to human-friendly messages.
// Updated to match the new @app/errors system (PE-DOMAIN-SEQ format).
// Source of truth: postengage.ai-backend/libs/errors/src/codes/constants.ts

type ErrorCode = string;

interface ErrorMapping {
  title: string;
  message: string;
}

const errorMappings: Record<ErrorCode, ErrorMapping> = {
  // ─── Auth errors (PE-AUTH-*) ──────────────────────────────────────────────
  'PE-AUTH-001': {
    title: 'Invalid credentials',
    message:
      'The email or password you entered is incorrect. Please try again.',
  },
  'PE-AUTH-002': {
    title: 'Session expired',
    message: 'Your session has expired. Please log in again.',
  },
  'PE-AUTH-003': {
    title: 'Not authenticated',
    message: 'Please log in to continue.',
  },
  'PE-AUTH-004': {
    title: 'Session revoked',
    message: 'Your session has been revoked. Please log in again.',
  },
  'PE-AUTH-005': {
    title: 'Account locked',
    message: 'Your account has been locked. Please contact support.',
  },
  'PE-AUTH-006': {
    title: 'Account suspended',
    message: 'Your account has been suspended. Please contact support.',
  },
  'PE-AUTH-007': {
    title: 'Email not verified',
    message:
      'Please verify your email before logging in. Check your inbox for the verification link.',
  },
  'PE-AUTH-008': {
    title: 'Password reset required',
    message: 'You need to reset your password before logging in.',
  },
  'PE-AUTH-009': {
    title: 'Social login failed',
    message: 'We could not complete your social login. Please try again.',
  },
  'PE-AUTH-010': {
    title: 'Account conflict',
    message: 'This social account is already connected to another account.',
  },
  'PE-AUTH-011': {
    title: 'Too many attempts',
    message: 'Too many login attempts. Please wait before trying again.',
  },
  'PE-AUTH-012': {
    title: 'Security violation',
    message: 'A security violation was detected. Please contact support.',
  },
  'PE-AUTH-013': {
    title: 'Account already exists',
    message:
      'An account with this email already exists. Try logging in instead.',
  },
  'PE-AUTH-014': {
    title: 'Invalid or expired link',
    message: 'This link is invalid or has expired. Please request a new one.',
  },
  'PE-AUTH-015': {
    title: 'Verification link expired',
    message: 'This verification link has expired. Please request a new one.',
  },
  'PE-AUTH-016': {
    title: 'Already verified',
    message: 'Your email is already verified. You can log in to your account.',
  },
  'PE-AUTH-017': {
    title: 'Verification email recently sent',
    message:
      'A verification email was recently sent. Please check your inbox or wait a few minutes before requesting another.',
  },
  'PE-AUTH-018': {
    title: 'Access denied',
    message: "You don't have permission to perform this action.",
  },
  'PE-AUTH-019': {
    title: 'Plan limit reached',
    message: 'Your current plan does not support this feature. Please upgrade.',
  },
  'PE-AUTH-020': {
    title: 'Session expired',
    message: 'Your session has expired. Please log in again.',
  },

  // ─── User errors (PE-USR-*) ───────────────────────────────────────────────
  'PE-USR-001': {
    title: 'Account not found',
    message:
      "We couldn't find an account with that email. Would you like to create one?",
  },
  'PE-USR-002': {
    title: 'Email already in use',
    message: 'An account with this email already exists.',
  },
  'PE-USR-003': {
    title: 'Username taken',
    message: 'This username is already taken. Please choose a different one.',
  },
  'PE-USR-004': {
    title: 'Invalid profile',
    message: 'Your profile information is invalid. Please update it.',
  },
  'PE-USR-005': {
    title: 'Account deactivated',
    message: 'Your account has been deactivated. Please contact support.',
  },
  'PE-USR-006': {
    title: 'Weak password',
    message: 'Your password is too weak. Please choose a stronger password.',
  },

  // ─── Validation errors (PE-VAL-*) ─────────────────────────────────────────
  'PE-VAL-001': {
    title: 'Invalid input',
    message: 'Please check your information and try again.',
  },
  'PE-VAL-002': {
    title: 'Required field missing',
    message: 'Please fill in all required fields.',
  },
  'PE-VAL-003': {
    title: 'Invalid format',
    message: 'One or more fields have an invalid format.',
  },

  // ─── Rate limit errors (PE-RATE-*) ────────────────────────────────────────
  'PE-RATE-001': {
    title: 'Too many attempts',
    message: 'Please wait a moment before trying again.',
  },
  'PE-RATE-003': {
    title: 'Too many login attempts',
    message: 'Too many login attempts. Please wait before trying again.',
  },
  'PE-RATE-004': {
    title: 'Too many signups',
    message: 'Too many signup attempts. Please wait before trying again.',
  },

  // ─── Social errors (PE-SOC-*) ─────────────────────────────────────────────
  'PE-SOC-001': {
    title: 'Social account disconnected',
    message: 'Your social account connection has expired. Please reconnect.',
  },
  'PE-SOC-002': {
    title: 'Rate limit',
    message:
      'You have hit the rate limit for this social platform. Please try again later.',
  },

  // ─── Payment errors (PE-PAY-*) ────────────────────────────────────────────
  'PE-PAY-001': {
    title: 'Payment failed',
    message: 'Your payment could not be processed. Please try again.',
  },
  'PE-PAY-003': {
    title: 'Subscription expired',
    message: 'Your subscription has expired. Please renew to continue.',
  },
  'PE-PAY-004': {
    title: 'Plan limit reached',
    message: 'You have reached the limit of your current plan. Please upgrade.',
  },

  // ─── Internal errors (PE-INT-*) ───────────────────────────────────────────
  'PE-INT-001': {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
  },
  'PE-INT-002': {
    title: 'Request timed out',
    message: 'The request took too long. Please try again.',
  },
  'PE-INT-003': {
    title: 'Service unavailable',
    message: 'The service is temporarily unavailable. Please try again later.',
  },

  // ─── Generic fallbacks ────────────────────────────────────────────────────
  NETWORK_ERROR: {
    title: 'Connection issue',
    message:
      "We're having trouble connecting. Please check your internet and try again.",
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
    errorMappings[code] ?? {
      title: 'Something went wrong',
      message: 'An unexpected error occurred. Please try again.',
    }
  );
}

export function mapHttpError(status: number): ErrorMapping {
  switch (status) {
    case 401:
      return errorMappings['PE-AUTH-003'];
    case 403:
      return errorMappings['PE-AUTH-018'];
    case 429:
      return errorMappings['PE-RATE-001'];
    case 404:
      return errorMappings['PE-USR-001'];
    default:
      return getErrorMessage(undefined);
  }
}
