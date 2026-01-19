import { httpClient, SuccessResponse } from '../http/client';
import {
  Notification,
  NotificationStatusType,
  NotificationTypeType,
} from '@/lib/types/notifications';

export interface NotificationsResponse {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface MarkAllAsReadResponse {
  message: string;
  queued: boolean;
}

export class NotificationsApi {
  static async getNotifications(params?: {
    status?: NotificationStatusType;
    type?: NotificationTypeType;
    limit?: number;
    skip?: number;
  }): Promise<SuccessResponse<Notification[]>> {
    const response = await httpClient.get<Notification[]>(
      'api/v1/notifications',
      { params }
    );
    return response.data!;
  }

  static async markAsRead(id: string): Promise<SuccessResponse<Notification>> {
    const response = await httpClient.patch<Notification>(
      `api/v1/notifications/${id}/read`
    );
    return response.data!;
  }

  static async markAllAsRead(): Promise<
    SuccessResponse<MarkAllAsReadResponse>
  > {
    const response = await httpClient.patch<MarkAllAsReadResponse>(
      'api/v1/notifications/read-all'
    );
    return response.data!;
  }

  static async getUnreadCount(): Promise<SuccessResponse<{ count: number }>> {
    const response = await httpClient.get<{ count: number }>(
      'api/v1/notifications/unread-count'
    );
    return response.data!;
  }
}

export const notificationsApi = NotificationsApi;
