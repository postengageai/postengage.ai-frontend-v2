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
      '/api/v1/notifications',
      { params }
    );
    return response.data!;
  }

  static async getUnreadCount(): Promise<SuccessResponse<{ count: number }>> {
    const response = await httpClient.get<{
      count: number;
    }>('/api/v1/notifications/unread-count');
    return response.data!;
  }

  static async markAsRead(
    id: string
  ): Promise<SuccessResponse<{ id: string; status: string; read_at: string }>> {
    const response = await httpClient.patch<{
      id: string;
      status: string;
      read_at: string;
    }>(`/api/v1/notifications/${id}/read`);
    return response.data!;
  }

  static async markAllAsRead(): Promise<
    SuccessResponse<{ message: string; queued: boolean }>
  > {
    const response = await httpClient.patch<{
      message: string;
      queued: boolean;
    }>('/api/v1/notifications/read-all');
    return response.data!;
  }
}

export const notificationsApi = NotificationsApi;
