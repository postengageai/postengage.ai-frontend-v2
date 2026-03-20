import { z } from 'zod';

// User schema matching backend response
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50),
  phone: z.string().nullable(),
  avatar: z
    .object({
      id: z.string(),
      name: z.string(),
      url: z.string().url(),
      mime_type: z.string(),
      size: z.number(),
      tags: z.array(z.string()),
      status: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
    })
    .nullable(),
  is_verified: z.boolean(),
  status: z.string(),
  timezone: z.string().nullable(),
  language: z.string(),
  role: z.string(),
  tour_enabled: z.boolean().optional().default(true),
  tours_seen: z.array(z.string()).optional().default([]),
  tours_skipped: z.array(z.string()).optional().default([]),
  onboarding_completed_at: z.string().nullable().optional().default(null),
  sound_notifications_enabled: z.boolean().optional().default(false),
  totp_enabled: z.boolean().optional().default(false),
  created_at: z.string(),
  updated_at: z.string(),
});

export type User = z.infer<typeof UserSchema>;

// Login request schema
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Signup request schema
export const SignupRequestSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[^A-Za-z0-9]/,
      'Password must contain at least one special character'
    ),
  /** Optional referral code from an affiliate link */
  ref: z.string().max(20).optional(),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

// Signup response schema
export const SignupResponseSchema = z.object({
  user: UserSchema,
  message: z.string(),
  verification_token: z.string().optional(), // Only in dev/test
});

export type SignupResponse = z.infer<typeof SignupResponseSchema>;

// Login response schema — discriminated union for two-step 2FA flow
export const LoginResponseSchema = z.discriminatedUnion('requires_2fa', [
  // Step 1 — 2FA required: frontend redirects to TOTP page
  z.object({
    requires_2fa: z.literal(true),
    challenge_token: z.string(),
    /** Unix timestamp (ms) when the challenge token expires — used for countdown.
     *  Optional for backward compat: older backend builds omit it; in that case
     *  the frontend skips the timer rather than failing. */
    challenge_expires_at: z.number().optional(),
  }),
  // Step 1 — No 2FA: login complete, user returned
  z.object({
    requires_2fa: z.literal(false),
    user: UserSchema,
    message: z.string(),
  }),
]);

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// 2FA TOTP challenge request
export const TotpChallengeRequestSchema = z.object({
  challenge_token: z.string(),
  code: z.string().length(6),
});

export type TotpChallengeRequest = z.infer<typeof TotpChallengeRequestSchema>;

// 2FA TOTP challenge response (same as a successful login)
export const TotpChallengeResponseSchema = z.object({
  user: UserSchema,
  message: z.string(),
});

export type TotpChallengeResponse = z.infer<typeof TotpChallengeResponseSchema>;

// 2FA setup response
export const TotpSetupResponseSchema = z.object({
  otpauth_url: z.string(),
});

export type TotpSetupResponse = z.infer<typeof TotpSetupResponseSchema>;

// Verify email request schema
export const VerifyEmailRequestSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequestSchema>;

// Verify email response schema
export const VerifyEmailResponseSchema = z.object({
  message: z.string(),
  user: UserSchema,
});

export type VerifyEmailResponse = z.infer<typeof VerifyEmailResponseSchema>;

// Resend verification request schema
export const ResendVerificationRequestSchema = z.object({
  email: z.string().email(),
});

export type ResendVerificationRequest = z.infer<
  typeof ResendVerificationRequestSchema
>;

// Forgot password request schema
export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

// Reset password request schema
export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[^A-Za-z0-9]/,
      'Password must contain at least one special character'
    ),
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

// Auth session state
export const AuthSessionSchema = z.object({
  user: UserSchema.nullable(),
  isAuthenticated: z.boolean(),
  isLoading: z.boolean(),
  lastActivity: z.number().optional(), // timestamp
});

export type AuthSession = z.infer<typeof AuthSessionSchema>;

// Auth actions
export const AuthActionsSchema = z.object({
  login: z.function().args(LoginRequestSchema).returns(z.promise(z.void())),
  signup: z.function().args(SignupRequestSchema).returns(z.promise(z.void())),
  logout: z.function().args().returns(z.promise(z.void())),
  verifyEmail: z
    .function()
    .args(VerifyEmailRequestSchema)
    .returns(z.promise(z.void())),
  resendVerification: z
    .function()
    .args(ResendVerificationRequestSchema)
    .returns(z.promise(z.void())),
  forgotPassword: z
    .function()
    .args(ForgotPasswordRequestSchema)
    .returns(z.promise(z.void())),
  resetPassword: z
    .function()
    .args(ResetPasswordRequestSchema)
    .returns(z.promise(z.void())),
  refreshSession: z.function().args().returns(z.promise(z.void())),
});

export type AuthActions = z.infer<typeof AuthActionsSchema>;
