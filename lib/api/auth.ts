import { httpClient, SuccessResponse } from '../http/client';
import { ApiError } from '../http/errors';
import { User } from '../types/settings';
import {
  AuthResponse,
  LoginResponse,
  LogoutResponse,
  PasswordResetConfirmDto,
  PasswordResetRequestDto,
  PasswordResetResponse,
  RefreshResponse,
  ResendVerificationDto,
  ResendVerificationResponse,
  SignupResponse,
  VerifyEmailDto,
  VerifyEmailResponse,
} from '../types/auth';

const AUTH_BASE_URL = '/api/v1/auth';

export interface RegisterDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export class AuthApi {
  // User registration
  static async register(
    request: RegisterDto
  ): Promise<SuccessResponse<SignupResponse>> {
    const response = await httpClient.post<SignupResponse>(
      `${AUTH_BASE_URL}/signup`,
      request
    );

    return response.data!;
  }

  // User login
  static async login(
    request: LoginDto
  ): Promise<SuccessResponse<LoginResponse>> {
    const response = await httpClient.post<LoginResponse>(
      `${AUTH_BASE_URL}/login`,
      request
    );

    return response.data!;
  }

  // Logout
  static async logout(): Promise<SuccessResponse<LogoutResponse>> {
    const response = await httpClient.post<LogoutResponse>(
      `${AUTH_BASE_URL}/logout`
    );
    return response.data!;
  }

  // Refresh access token
  static async refresh(): Promise<SuccessResponse<RefreshResponse>> {
    const response = await httpClient.post<RefreshResponse>(
      `${AUTH_BASE_URL}/refresh`
    );

    return response.data!;
  }

  // Verify email
  static async verifyEmail(
    request: VerifyEmailDto
  ): Promise<SuccessResponse<VerifyEmailResponse>> {
    const response = await httpClient.post<VerifyEmailResponse>(
      `${AUTH_BASE_URL}/verify-email`,
      request
    );
    return response.data!;
  }

  // Resend verification email
  static async resendVerification(
    request: ResendVerificationDto
  ): Promise<SuccessResponse<ResendVerificationResponse>> {
    const response = await httpClient.post<ResendVerificationResponse>(
      `${AUTH_BASE_URL}/resend-verification`,
      request
    );
    return response.data!;
  }

  // Request password reset (forgot password)
  static async forgotPassword(
    request: PasswordResetRequestDto
  ): Promise<SuccessResponse<PasswordResetResponse>> {
    const response = await httpClient.post<PasswordResetResponse>(
      `${AUTH_BASE_URL}/forgot-password`,
      request
    );
    return response.data!;
  }

  // Confirm password reset
  static async resetPassword(
    request: PasswordResetConfirmDto
  ): Promise<SuccessResponse<PasswordResetResponse>> {
    const response = await httpClient.post<PasswordResetResponse>(
      `${AUTH_BASE_URL}/reset-password`,
      request
    );
    return response.data!;
  }

  // Get current user
  static async me(): Promise<SuccessResponse<User>> {
    const response = await httpClient.get<User>(`/api/v1/users/profile`);
    return response.data!;
  }

  // Check if user is authenticated by fetching current user
  static async checkAuth(): Promise<User | null> {
    try {
      const response = await this.me();
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
  register: AuthApi.register,
  login: AuthApi.login,
  logout: AuthApi.logout,
  refresh: AuthApi.refresh,
  verifyEmail: AuthApi.verifyEmail,
  resendVerification: AuthApi.resendVerification,
  forgotPassword: AuthApi.forgotPassword,
  resetPassword: AuthApi.resetPassword,
  me: AuthApi.me,
  checkAuth: AuthApi.checkAuth,
};
