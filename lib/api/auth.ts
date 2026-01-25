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
  VerifyMfaLoginRequest,
  GenerateMfaResponse,
  EnableMfaRequest,
  EnableMfaResponse,
  DisableMfaResponse,
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

  // Verify MFA Login
  static async verifyMfaLogin(
    request: VerifyMfaLoginRequest
  ): Promise<SuccessResponse<LoginResponse>> {
    const response = await httpClient.post<LoginResponse>(
      `${AUTH_BASE_URL}/mfa/verify-login`,
      request
    );

    return response.data!;
  }

  // Generate MFA Secret
  static async generateMfaSecret(): Promise<
    SuccessResponse<GenerateMfaResponse>
  > {
    const response = await httpClient.post<GenerateMfaResponse>(
      `${AUTH_BASE_URL}/mfa/generate`
    );

    return response.data!;
  }

  // Enable MFA
  static async enableMfa(
    request: EnableMfaRequest
  ): Promise<SuccessResponse<EnableMfaResponse>> {
    const response = await httpClient.post<EnableMfaResponse>(
      `${AUTH_BASE_URL}/mfa/enable`,
      request
    );

    return response.data!;
  }

  // Disable MFA
  static async disableMfa(): Promise<SuccessResponse<DisableMfaResponse>> {
    const response = await httpClient.post<DisableMfaResponse>(
      `${AUTH_BASE_URL}/mfa/disable`
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

  // Check if user is authenticated by fetching profile
  static async checkAuth(): Promise<User | null> {
    try {
      const response = await this.getCurrentUser();
      return response.data;
    } catch (error) {
      // Check if error is a 401 or 403 status code
      if (
        error instanceof ApiError &&
        (error.statusCode === 401 || error.statusCode === 403)
      ) {
        return null;
      }
      throw error;
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
};
