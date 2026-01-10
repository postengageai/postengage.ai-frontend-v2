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
  User,
} from '../schemas/auth';
import { httpClient } from '../http/client';
import { ApiError } from '../http/errors';

const AUTH_BASE_URL = '/api/v1/auth';

export class AuthApi {
  // User registration
  static async signup(request: SignupRequest): Promise<SignupResponse> {
    const response = await httpClient.post<SignupResponse>(
      `${AUTH_BASE_URL}/signup`,
      request
    );

    return response.data!;
  }

  // User login
  static async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>(
      `${AUTH_BASE_URL}/login`,
      request
    );

    return response.data!;
  }

  // Verify email
  static async verifyEmail(
    request: VerifyEmailRequest
  ): Promise<VerifyEmailResponse> {
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
  static async refreshSession(): Promise<User> {
    const response = await httpClient.post<{ user: User }>(
      `${AUTH_BASE_URL}/refresh`
    );

    return response.data!.user;
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      await httpClient.post(`${AUTH_BASE_URL}/logout`);
    } catch (error) {
      // Even if logout API fails, we should clear local auth state
      console.warn(
        'Logout API call failed, but clearing local auth state:',
        error
      );
      throw error;
    }
  }

  // Forgot password
  static async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    await httpClient.post(`${AUTH_BASE_URL}/forgot-password`, request);
  }

  // Reset password
  static async resetPassword(request: ResetPasswordRequest): Promise<void> {
    await httpClient.post(`${AUTH_BASE_URL}/reset-password`, request);
  }

  // Get current user profile (if needed from separate endpoint)
  static async getCurrentUser(): Promise<User> {
    // This endpoint might not exist yet, but could be added
    const response = await httpClient.get<{ user: User }>(
      `${AUTH_BASE_URL}/me`
    );

    return response.data!.user;
  }

  // Check if user is authenticated by attempting a refresh
  static async checkAuth(): Promise<User | null> {
    try {
      return await this.refreshSession();
    } catch (error) {
      // Check if error is a 401 or 403 status code
      if (error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 403)) {
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
