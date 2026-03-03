import { httpClient, SuccessResponse } from '../../http/client';
import {
  Conversation,
  Message,
  SendMessageRequest,
} from '@/lib/types/conversations';

const MESSAGING_BASE_URL = '/api/instagram/messaging';

export interface GetConversationsParams {
  status?: string;
  platform?: string;
  search?: string;
  unread_only?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'recent' | 'oldest' | 'unread';
}

export interface GetMessagesParams {
  limit?: number;
  page?: number;
  after?: string;
  before?: string;
  fields?: string;
}

export interface MarkMessageAsReadPayload {
  read_at: string;
}

export class InstagramMessagingApi {
  static async sendMessage(
    conversationId: string,
    payload: SendMessageRequest
  ): Promise<SuccessResponse<Message>> {
    const response = await httpClient.post<Message>(
      `${MESSAGING_BASE_URL}/conversations/${conversationId}/messages`,
      payload
    );
    return response.data!;
  }

  static async getConversations(
    params?: GetConversationsParams
  ): Promise<SuccessResponse<Conversation[]>> {
    const response = await httpClient.get<Conversation[]>(
      `${MESSAGING_BASE_URL}/conversations`,
      {
        params,
      }
    );
    return response.data!;
  }

  static async getMessages(
    conversationId: string,
    params?: GetMessagesParams
  ): Promise<SuccessResponse<Message[]>> {
    const response = await httpClient.get<Message[]>(
      `${MESSAGING_BASE_URL}/conversations/${conversationId}/messages`,
      {
        params,
      }
    );
    return response.data!;
  }

  static async markMessageAsRead(
    messageId: string,
    payload: MarkMessageAsReadPayload
  ): Promise<SuccessResponse<Message>> {
    const response = await httpClient.post<Message>(
      `${MESSAGING_BASE_URL}/messages/${messageId}/read`,
      payload
    );
    return response.data!;
  }
}

export const instagramMessagingApi = {
  sendMessage: InstagramMessagingApi.sendMessage,
  getConversations: InstagramMessagingApi.getConversations,
  getMessages: InstagramMessagingApi.getMessages,
  markMessageAsRead: InstagramMessagingApi.markMessageAsRead,
};
