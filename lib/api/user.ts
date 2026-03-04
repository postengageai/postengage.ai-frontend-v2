import { httpClient, SuccessResponse } from '../http/client';
import { User, UpdateUserDto, ChangePasswordDto } from '../types/settings';

const USERS_BASE_URL = '/api/v1/users';

export class UserApi {
  // Get current user profile
  static async getProfile(): Promise<SuccessResponse<User>> {
    const response = await httpClient.get<User>(`${USERS_BASE_URL}/profile`);
    return response.data!;
  }

  // Update user profile
  static async updateProfile(
    request: UpdateUserDto
  ): Promise<SuccessResponse<User>> {
    const response = await httpClient.put<User>(
      `${USERS_BASE_URL}/profile`,
      request
    );
    return response.data!;
  }

  // Upload avatar
  static async uploadAvatar(file: File): Promise<SuccessResponse<User>> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await httpClient.put<User>(
      `${USERS_BASE_URL}/upload-avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data!;
  }

  // Change password
  static async changePassword(
    request: ChangePasswordDto
  ): Promise<SuccessResponse<User>> {
    const response = await httpClient.put<User>(
      `${USERS_BASE_URL}/change-password`,
      request
    );
    return response.data!;
  }

  // Delete account
  static async deleteAccount(): Promise<void> {
    await httpClient.delete(`${USERS_BASE_URL}/account`);
  }
}

// Hook-friendly API functions
export const userApi = {
  getProfile: UserApi.getProfile,
  updateProfile: UserApi.updateProfile,
  uploadAvatar: UserApi.uploadAvatar,
  changePassword: UserApi.changePassword,
  deleteAccount: UserApi.deleteAccount,
};
