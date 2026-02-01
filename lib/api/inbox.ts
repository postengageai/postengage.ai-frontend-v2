import { httpClient, SuccessResponse } from '../http/client';
import {
  InboxConversation,
  InboxConversationFilters,
  InboxMessage,
} from '../types/inbox';

const INBOX_BASE_URL = '/api/v1/inbox';

export class InboxApi {
  // Get conversations with filters and pagination
  static async getConversations(
    filters: InboxConversationFilters,
    page: number = 1,
    perPage: number = 20
  ): Promise<SuccessResponse<InboxConversation[]>> {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all')
      params.append('status', filters.status);
    if (filters.platform) params.append('platform', filters.platform);
    if (filters.social_account_id)
      params.append('social_account_id', filters.social_account_id);
    if (filters.search) params.append('search', filters.search);

    params.append('page', page.toString());
    params.append('per_page', perPage.toString());

    const response = await httpClient.get<InboxConversation[]>(
      `${INBOX_BASE_URL}/conversations?${params.toString()}`
    );
    return response.data!;
  }

  // Get messages for a conversation
  static async getMessages(
    conversationId: string,
    page: number = 1,
    perPage: number = 50
  ): Promise<SuccessResponse<InboxMessage[]>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('per_page', perPage.toString());

    const response = await httpClient.get<InboxMessage[]>(
      `${INBOX_BASE_URL}/conversations/${conversationId}/messages?${params.toString()}`
    );
    return response.data!;
  }

  // Send a message
  static async sendMessage(
    conversationId: string,
    content: { text?: string; attachments?: string[] },
    tag?: string
  ): Promise<SuccessResponse<InboxMessage>> {
    const payload: { text?: string; attachments?: string[]; tag?: string } = {
      ...content,
    };
    if (tag) {
      payload.tag = tag;
    }
    const response = await httpClient.post<InboxMessage>(
      `${INBOX_BASE_URL}/conversations/${conversationId}/messages`,
      payload
    );
    return response.data!;
  }

  // Mark conversation as read
  static async markRead(conversationId: string): Promise<void> {
    await httpClient.post<void>(
      `${INBOX_BASE_URL}/conversations/${conversationId}/read`
    );
  }

  // Update lead details
  static async updateLead(
    leadId: string,
    data: { tags?: string[]; notes?: string }
  ): Promise<void> {
    await httpClient.patch<void>(`${INBOX_BASE_URL}/leads/${leadId}`, data);
  }
}

export const inboxApi = {
  getConversations: InboxApi.getConversations,
  getMessages: InboxApi.getMessages,
  sendMessage: InboxApi.sendMessage,
  markRead: InboxApi.markRead,
  updateLead: InboxApi.updateLead,
};
