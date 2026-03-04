import { httpClient, SuccessResponse } from '../http/client';
import { ApiError } from '../http/errors';
import { User } from '../types/settings';

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
  static async register(request: RegisterDto): Promise<SuccessResponse<User>> {
    const response = await httpClient.post<User>(
      `${AUTH_BASE_URL}/signup`,
      request
    );

    return response.data!;
  }

  // User login
  static async login(request: LoginDto): Promise<SuccessResponse<User>> {
    const response = await httpClient.post<User>(
      `${AUTH_BASE_URL}/login`,
      request
    );

    return response.data!;
  }

  // Logout
  static async logout(): Promise<void> {
    await httpClient.post(`${AUTH_BASE_URL}/logout`);
  }

  // Refresh access token
  static async refresh(): Promise<SuccessResponse<User>> {
    const response = await httpClient.post<User>(`${AUTH_BASE_URL}/refresh`);

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
  me: AuthApi.me,
  checkAuth: AuthApi.checkAuth,
};
