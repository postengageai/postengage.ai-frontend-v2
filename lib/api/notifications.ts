import { httpClient, SuccessResponse } from '../http/client';
import {
  Notification,
  NotificationStatusType,
} from '@/lib/types/notifications';

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

export interface MarkAsReadRequest {
  notification_ids: string[];
}

export interface MarkAllAsReadResponse {
  marked_count: number;
}

export class NotificationsApi {
  static async getNotifications(params?: {
    status?: NotificationStatusType;
    limit?: number;
    offset?: number;
  }): Promise<SuccessResponse<NotificationsResponse>> {
    const response = await httpClient.get<NotificationsResponse>(
      'api/v1/notifications',
      { params }
    );
    return response.data!;
  }

  static async markAsRead(
    request: MarkAsReadRequest
  ): Promise<SuccessResponse<{ marked_count: number }>> {
    const response = await httpClient.patch<{ marked_count: number }>(
      'api/v1/notifications/mark-read',
      request
    );
    return response.data!;
  }

  static async markAllAsRead(): Promise<
    SuccessResponse<MarkAllAsReadResponse>
  > {
    const response = await httpClient.patch<MarkAllAsReadResponse>(
      'api/v1/notifications/mark-all-read'
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
