import {
  LoginRequest,
  SignupRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  LoginResponse,
  SignupResponse,
  VerifyEmailResponse,
  TotpChallengeRequest,
  TotpChallengeResponse,
  TotpSetupResponse,
  User,
} from '../schemas/auth';
import { httpClient, SuccessResponse } from '../http/client';
import { ApiError } from '../http/errors';

const AUTH_BASE_URL = '/api/v1/auth';

export class AuthApi {
  // User registration
  static async signup(
    request: SignupRequest
  ): Promise<SuccessResponse<SignupResponse>> {
    const response = await httpClient.post<SignupResponse>(
      `${AUTH_BASE_URL}/signup`,
      request
    );

    return response.data!;
  }

  // User login
  static async login(
    request: LoginRequest
  ): Promise<SuccessResponse<LoginResponse>> {
    const response = await httpClient.post<LoginResponse>(
      `${AUTH_BASE_URL}/login`,
      request
    );

    return response.data!;
  }

  // Verify email
  static async verifyEmail(
    request: VerifyEmailRequest
  ): Promise<SuccessResponse<VerifyEmailResponse>> {
    const response = await httpClient.post<VerifyEmailResponse>(
      `${AUTH_BASE_URL}/verify-email`,
      request
    );

    return response.data!;
  }

  // Resend verification email
  static async resendVerification(
    request: ResendVerificationRequest
  ): Promise<void> {
    await httpClient.post(`${AUTH_BASE_URL}/resend-verification`, request);
  }

  // Refresh session (token refresh)
  static async refreshSession(): Promise<SuccessResponse<{ user: User }>> {
    const response = await httpClient.post<{ user: User }>(
      `${AUTH_BASE_URL}/refresh`
    );

    return response.data!;
  }

  // Logout
  static async logout(): Promise<void> {
    await httpClient.post(`${AUTH_BASE_URL}/logout`);
  }

  // Forgot password
  static async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    await httpClient.post(`${AUTH_BASE_URL}/forgot-password`, request);
  }

  // Reset password
  static async resetPassword(request: ResetPasswordRequest): Promise<void> {
    await httpClient.post(`${AUTH_BASE_URL}/reset-password`, request);
  }

  // Get current user profile
  static async getCurrentUser(): Promise<SuccessResponse<User>> {
    const response = await httpClient.get<User>('/api/v1/users/profile');
    return response.data!;
  }

  // Check if user is authenticated by fetching profile.
  //
  // IMPORTANT: uses _skipUnauthorizedHandler so the global logout redirect
  // does NOT fire when this probe returns 401. This runs on every page mount
  // (including public pages like /reset-password) and must be a silent check.
  static async checkAuth(): Promise<User | null> {
    try {
      const response = await httpClient.get<User>('/api/v1/users/profile', {
        _skipUnauthorizedHandler: true,
      });
      return response.data?.data ?? null;
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.statusCode === 401 || error.statusCode === 403)
      ) {
        return null;
      }
      throw error;
    }
  }

  // Get account lock/suspend status by email (public endpoint)
  static async getAccountStatus(
    email: string
  ): Promise<{ status: string; unlocksAt?: string }> {
    const response = await httpClient.get<{
      status: string;
      unlocksAt?: string;
    }>(`${AUTH_BASE_URL}/account-status?email=${encodeURIComponent(email)}`);
    return response.data?.data ?? { status: 'unknown' };
  }

  // ── 2FA / TOTP ─────────────────────────────────────────────────────────────

  /** Complete the two-step TOTP challenge after login returned requires_2fa: true */
  static async verifyTotpChallenge(
    request: TotpChallengeRequest
  ): Promise<SuccessResponse<TotpChallengeResponse>> {
    const response = await httpClient.post<TotpChallengeResponse>(
      `${AUTH_BASE_URL}/2fa/challenge`,
      request
    );
    return response.data!;
  }

  /** Start 2FA setup — returns otpauth_url for QR code rendering */
  static async setup2FA(): Promise<SuccessResponse<TotpSetupResponse>> {
    const response = await httpClient.post<TotpSetupResponse>(
      `${AUTH_BASE_URL}/2fa/setup`
    );
    return response.data!;
  }

  /** Verify a TOTP token and permanently enable 2FA on the account */
  static async verify2FA(code: string): Promise<void> {
    await httpClient.post(`${AUTH_BASE_URL}/2fa/verify`, { code });
  }

  /** Disable 2FA — requires a valid TOTP token as confirmation */
  static async disable2FA(code: string): Promise<void> {
    await httpClient.post(`${AUTH_BASE_URL}/2fa/disable`, { code });
  }

  // Platform-wide stats for the login page social proof.
  // Returns real data when the marketing API is live, fake baseline otherwise.
  static async getPlatformStats(): Promise<{
    replies_sent: number;
    total_automations: number;
    active_users: number;
  }> {
    const fallback = {
      replies_sent: 1_200_000,
      total_automations: 24_500,
      active_users: 8_200,
    };
    try {
      const response = await httpClient.get<{
        replies_sent: number;
        total_automations: number;
        active_users: number;
      }>('/api/v1/marketing/platform-stats', {
        _skipUnauthorizedHandler: true,
      });
      const data = response.data?.data;
      // Use real data only if it looks populated
      return data && data.active_users > 100 ? data : fallback;
    } catch {
      return fallback;
    }
  }
}

// Hook-friendly API functions
export const authApi = {
  signup: AuthApi.signup,
  login: AuthApi.login,
  verifyEmail: AuthApi.verifyEmail,
  resendVerification: AuthApi.resendVerification,
  refreshSession: AuthApi.refreshSession,
  logout: AuthApi.logout,
  forgotPassword: AuthApi.forgotPassword,
  resetPassword: AuthApi.resetPassword,
  getCurrentUser: AuthApi.getCurrentUser,
  checkAuth: AuthApi.checkAuth,
  verifyTotpChallenge: AuthApi.verifyTotpChallenge,
  setup2FA: AuthApi.setup2FA,
  verify2FA: AuthApi.verify2FA,
  disable2FA: AuthApi.disable2FA,
};
