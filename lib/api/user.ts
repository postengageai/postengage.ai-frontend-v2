import { httpClient } from '../http/client';
import { User } from '../schemas/auth';

const USERS_BASE_URL = '/api/v1/users';

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  timezone?: string | null;
  language?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UserProfileResponse {
  user: User;
}

export class UserApi {
  // Get current user profile
  static async getProfile(): Promise<User> {
    const response = await httpClient.get<User>(`${USERS_BASE_URL}/profile`);
    return response.data!;
  }

  // Update user profile
  static async updateProfile(request: UpdateUserRequest): Promise<User> {
    const response = await httpClient.put<User>(
      `${USERS_BASE_URL}/profile`,
      request
    );
    return response.data!;
  }

  // Change password
  static async changePassword(request: ChangePasswordRequest): Promise<void> {
    await httpClient.put<void>(`${USERS_BASE_URL}/change-password`, request);
  }

  // Upload avatar (implementation depends on backend)
  static async uploadAvatar(file: File): Promise<{
    message: string;
    media: {
      id: string;
      name: string;
      url: string;
      mime_type: string;
      size: number;
      tags: string[];
      status: string;
      created_at: string;
      updated_at: string;
    };
  }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await httpClient.put<{
      message: string;
      media: {
        id: string;
        name: string;
        url: string;
        mime_type: string;
        size: number;
        tags: string[];
        status: string;
        created_at: string;
        updated_at: string;
      };
    }>(`${USERS_BASE_URL}/upload-avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data!;
  }
}

// Hook-friendly API functions
export const userApi = {
  getProfile: UserApi.getProfile,
  updateProfile: UserApi.updateProfile,
  changePassword: UserApi.changePassword,
  uploadAvatar: UserApi.uploadAvatar,
};
