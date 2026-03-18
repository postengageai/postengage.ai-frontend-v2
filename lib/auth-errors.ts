/**
 * Maps PE-* error codes to short display titles.
 *
 * IMPORTANT — messages are intentionally NOT stored here.
 * The backend already sends a `message` field with every error response.
 * `parseApiError` uses that backend message directly so there is no
 * duplication or drift risk.  Only `title` (a brief toast/banner header)
 * is maintained here because the API response does not include one.
 *
 * If you need to add a new code, add the constant to `lib/error-codes.ts`
 * first, then optionally add a title entry below.
 */

const CODE_TITLES: Record<string, string> = {
  // ── Auth ─────────────────────────────────────────────────────────────────
  'PE-AUTH-001': 'Invalid credentials',
  'PE-AUTH-002': 'Session expired',
  'PE-AUTH-003': 'Not authenticated',
  'PE-AUTH-004': 'Session revoked',
  'PE-AUTH-005': 'Account locked',
  'PE-AUTH-006': 'Account suspended',
  'PE-AUTH-007': 'Email not verified',
  'PE-AUTH-008': 'Password reset required',
  'PE-AUTH-009': 'Social login failed',
  'PE-AUTH-010': 'Account conflict',
  'PE-AUTH-011': 'Too many attempts',
  'PE-AUTH-012': 'Security violation',
  'PE-AUTH-013': 'Account already exists',
  'PE-AUTH-014': 'Invalid or expired link',
  'PE-AUTH-015': 'Verification link expired',
  'PE-AUTH-016': 'Already verified',
  'PE-AUTH-017': 'Email recently sent',
  'PE-AUTH-018': 'Access denied',
  'PE-AUTH-019': 'Plan limit reached',
  'PE-AUTH-020': 'Session expired',
  'PE-AUTH-021': 'Invalid code',
  'PE-AUTH-022': '2FA required',
  'PE-AUTH-023': '2FA already enabled',
  'PE-AUTH-024': '2FA not configured',

  // ── User ─────────────────────────────────────────────────────────────────
  'PE-USR-001': 'Account not found',
  'PE-USR-002': 'Email already in use',
  'PE-USR-003': 'Username taken',
  'PE-USR-004': 'Invalid profile',
  'PE-USR-005': 'Account deactivated',
  'PE-USR-006': 'Weak password',

  // ── Validation ───────────────────────────────────────────────────────────
  'PE-VAL-001': 'Invalid input',
  'PE-VAL-002': 'Required field missing',
  'PE-VAL-003': 'Invalid format',

  // ── Rate limit ───────────────────────────────────────────────────────────
  'PE-RATE-001': 'Too many requests',
  'PE-RATE-003': 'Too many login attempts',
  'PE-RATE-004': 'Too many signup attempts',

  // ── Social ───────────────────────────────────────────────────────────────
  'PE-SOC-001': 'Social account disconnected',
  'PE-SOC-002': 'Rate limit',

  // ── Payment ──────────────────────────────────────────────────────────────
  'PE-PAY-001': 'Payment failed',
  'PE-PAY-003': 'Subscription expired',
  'PE-PAY-004': 'Plan limit reached',

  // ── Affiliate ────────────────────────────────────────────────────────────
  'PE-AFF-001': 'Affiliate not found',
  'PE-AFF-002': 'Already joined',
  'PE-AFF-003': 'Code not found',
  'PE-AFF-004': 'Affiliate suspended',

  // ── Internal ─────────────────────────────────────────────────────────────
  'PE-INT-001': 'Something went wrong',
  'PE-INT-002': 'Request timed out',
  'PE-INT-003': 'Service unavailable',
};

/** Fallback titles derived from the code domain prefix. */
const PREFIX_TITLES: Record<string, string> = {
  'PE-AUTH': 'Authentication error',
  'PE-USR': 'Account error',
  'PE-VAL': 'Validation error',
  'PE-RATE': 'Too many requests',
  'PE-SOC': 'Social account error',
  'PE-PAY': 'Payment error',
  'PE-AFF': 'Affiliate error',
  'PE-INT': 'Server error',
};

/**
 * Returns a short display title for a PE-* error code.
 * Falls back to a domain-prefix title, then "Something went wrong".
 */
export function getTitleForCode(code: string | undefined): string {
  if (!code) return 'Something went wrong';
  if (CODE_TITLES[code]) return CODE_TITLES[code];
  const prefix = code.split('-').slice(0, 2).join('-');
  return PREFIX_TITLES[prefix] ?? 'Something went wrong';
}

/**
 * @deprecated Use `getTitleForCode` — messages now come directly from the
 * backend `error.message` field via `parseApiError`. This shim keeps callers
 * that haven't migrated yet from breaking; message is always empty string.
 */
export function getErrorMessage(code: string | undefined): {
  title: string;
  message: string;
} {
  return { title: getTitleForCode(code), message: '' };
}
