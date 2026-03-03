import { httpClient, SuccessResponse } from '../http/client';
import {
  Conversation,
  ConversationWithMessages,
  Message,
  ConversationListParams,
  SendMessageRequest,
} from '../types/conversations';

const CONVERSATIONS_BASE_URL = '/api/conversations';

export class ConversationsApi {
  static async list(
    params?: ConversationListParams
  ): Promise<SuccessResponse<Conversation[]>> {
    const response = await httpClient.get<Conversation[]>(
      CONVERSATIONS_BASE_URL,
      {
        params,
      }
    );
    return response.data!;
  }

  static async get(
    id: string
  ): Promise<SuccessResponse<ConversationWithMessages>> {
    const response = await httpClient.get<ConversationWithMessages>(
      `${CONVERSATIONS_BASE_URL}/${id}`
    );
    return response.data!;
  }

  static async getMessages(
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<SuccessResponse<Message[]>> {
    const response = await httpClient.get<Message[]>(
      `${CONVERSATIONS_BASE_URL}/${conversationId}/messages`,
      {
        params: { page, limit },
      }
    );
    return response.data!;
  }

  static async sendMessage(
    conversationId: string,
    request: SendMessageRequest
  ): Promise<SuccessResponse<Message>> {
    const response = await httpClient.post<Message>(
      `${CONVERSATIONS_BASE_URL}/${conversationId}/messages`,
      request
    );
    return response.data!;
  }

  static async markAsRead(conversationId: string): Promise<void> {
    await httpClient.patch(
      `${CONVERSATIONS_BASE_URL}/${conversationId}/read`,
      {}
    );
  }

  static async markMessageAsRead(messageId: string): Promise<void> {
    await httpClient.patch(
      `${CONVERSATIONS_BASE_URL}/messages/${messageId}/read`,
      {}
    );
  }

  static async archive(conversationId: string): Promise<void> {
    await httpClient.patch(
      `${CONVERSATIONS_BASE_URL}/${conversationId}/archive`,
      {}
    );
  }

  static async unarchive(conversationId: string): Promise<void> {
    await httpClient.patch(
      `${CONVERSATIONS_BASE_URL}/${conversationId}/unarchive`,
      {}
    );
  }

  static async close(conversationId: string): Promise<void> {
    await httpClient.patch(
      `${CONVERSATIONS_BASE_URL}/${conversationId}/close`,
      {}
    );
  }

  static async search(query: string): Promise<SuccessResponse<Conversation[]>> {
    const response = await httpClient.get<Conversation[]>(
      `${CONVERSATIONS_BASE_URL}/search`,
      {
        params: { q: query },
      }
    );
    return response.data!;
  }
}

export const conversationsApi = {
  list: ConversationsApi.list,
  get: ConversationsApi.get,
  getMessages: ConversationsApi.getMessages,
  sendMessage: ConversationsApi.sendMessage,
  markAsRead: ConversationsApi.markAsRead,
  markMessageAsRead: ConversationsApi.markMessageAsRead,
  archive: ConversationsApi.archive,
  unarchive: ConversationsApi.unarchive,
  close: ConversationsApi.close,
  search: ConversationsApi.search,
};
