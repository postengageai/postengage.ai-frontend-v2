/**
 * PostEngage error code constants.
 *
 * Single source of truth on the frontend.  Mirrors the backend's
 * `libs/errors/src/codes/constants.ts` — update both together whenever
 * a new code is added to the backend.
 *
 * Usage:
 *   import { ErrorCodes } from '@/lib/error-codes';
 *   if (err.code === ErrorCodes.AUTH.TOTP_INVALID_CODE) { ... }
 */
export const ErrorCodes = {
  AUTH: {
    INVALID_CREDENTIALS: 'PE-AUTH-001',
    SESSION_EXPIRED: 'PE-AUTH-002',
    NOT_AUTHENTICATED: 'PE-AUTH-003',
    SESSION_REVOKED: 'PE-AUTH-004',
    ACCOUNT_LOCKED: 'PE-AUTH-005',
    ACCOUNT_SUSPENDED: 'PE-AUTH-006',
    EMAIL_NOT_VERIFIED: 'PE-AUTH-007',
    PASSWORD_RESET_REQUIRED: 'PE-AUTH-008',
    SOCIAL_LOGIN_FAILED: 'PE-AUTH-009',
    SOCIAL_ACCOUNT_CONFLICT: 'PE-AUTH-010',
    TOO_MANY_ATTEMPTS: 'PE-AUTH-011',
    SECURITY_VIOLATION: 'PE-AUTH-012',
    ACCOUNT_ALREADY_EXISTS: 'PE-AUTH-013',
    INVALID_OR_EXPIRED_LINK: 'PE-AUTH-014',
    VERIFICATION_LINK_EXPIRED: 'PE-AUTH-015',
    ALREADY_VERIFIED: 'PE-AUTH-016',
    VERIFICATION_EMAIL_RECENTLY_SENT: 'PE-AUTH-017',
    ACCESS_DENIED: 'PE-AUTH-018',
    PLAN_LIMIT_REACHED: 'PE-AUTH-019',
    REFRESH_TOKEN_EXPIRED: 'PE-AUTH-020',
    TOTP_INVALID_CODE: 'PE-AUTH-021',
    TOTP_REQUIRED: 'PE-AUTH-022',
    TOTP_ALREADY_ENABLED: 'PE-AUTH-023',
    TOTP_NOT_CONFIGURED: 'PE-AUTH-024',
  },

  USER: {
    NOT_FOUND: 'PE-USR-001',
    EMAIL_ALREADY_IN_USE: 'PE-USR-002',
    USERNAME_TAKEN: 'PE-USR-003',
    INVALID_PROFILE: 'PE-USR-004',
    ACCOUNT_DEACTIVATED: 'PE-USR-005',
    WEAK_PASSWORD: 'PE-USR-006',
  },

  VALIDATION: {
    INVALID_INPUT: 'PE-VAL-001',
    REQUIRED_FIELD: 'PE-VAL-002',
    INVALID_FORMAT: 'PE-VAL-003',
  },

  RATE_LIMIT: {
    GENERIC: 'PE-RATE-001',
    LOGIN: 'PE-RATE-003',
    SIGNUP: 'PE-RATE-004',
  },

  SOCIAL: {
    ACCOUNT_DISCONNECTED: 'PE-SOC-001',
    RATE_LIMIT: 'PE-SOC-002',
  },

  PAYMENT: {
    PAYMENT_FAILED: 'PE-PAY-001',
    SUBSCRIPTION_EXPIRED: 'PE-PAY-003',
    PLAN_LIMIT_REACHED: 'PE-PAY-004',
  },

  INTERNAL: {
    UNEXPECTED: 'PE-INT-001',
    TIMEOUT: 'PE-INT-002',
    SERVICE_UNAVAILABLE: 'PE-INT-003',
  },

  AFFILIATE: {
    NOT_FOUND: 'PE-AFF-001',
    ALREADY_JOINED: 'PE-AFF-002',
    CODE_NOT_FOUND: 'PE-AFF-003',
    SUSPENDED: 'PE-AFF-004',
  },
} as const;

/**
 * 401 codes that are domain-level auth failures and must NOT trigger the
 * global logout handler — the calling component handles them inline.
 *
 * Examples:
 *   PE-AUTH-021 — wrong TOTP code during 2FA setup / disable
 *   PE-AUTH-001 — wrong password on login page (form shows inline error)
 */
export const INLINE_AUTH_ERROR_CODES = new Set<string>([
  ErrorCodes.AUTH.TOTP_INVALID_CODE,
  ErrorCodes.AUTH.INVALID_CREDENTIALS,
]);
