import { httpClient, SuccessResponse } from '../http/client';
import { Notification, NotificationTypeType } from '@/lib/types/notifications';

export class NotificationsApi {
  static async getNotifications(params?: {
    unread_only?: boolean;
    type?: NotificationTypeType;
    cursor?: string;
    limit?: number;
    direction?: 'forward' | 'backward';
  }): Promise<SuccessResponse<Notification[]>> {
    const response = await httpClient.get<Notification[]>(
      '/api/notifications',
      { params }
    );
    return response.data!;
  }

  static async getUnreadCount(): Promise<
    SuccessResponse<{ unread_count: number; total_count: number }>
  > {
    const response = await httpClient.get<{
      unread_count: number;
      total_count: number;
    }>('/api/notifications/unread-count');
    return response.data!;
  }

  static async markAsRead(
    id: string
  ): Promise<
    SuccessResponse<{ id: string; is_read: boolean; read_at: string }>
  > {
    const response = await httpClient.patch<{
      id: string;
      is_read: boolean;
      read_at: string;
    }>(`/api/notifications/${id}/read`);
    return response.data!;
  }

  static async markAllAsRead(): Promise<
    SuccessResponse<{ marked_count: number; message: string }>
  > {
    const response = await httpClient.patch<{
      marked_count: number;
      message: string;
    }>('/api/notifications/read-all');
    return response.data!;
  }
}

export const notificationsApi = NotificationsApi;
