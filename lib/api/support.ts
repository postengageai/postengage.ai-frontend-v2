import { httpClient } from '../http/client';

const BASE = '/api/v1/support';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_user'
  | 'resolved'
  | 'closed';
export type TicketCategory =
  | 'technical'
  | 'billing'
  | 'account'
  | 'instagram'
  | 'feature'
  | 'other';
export type MessageSenderType = 'user' | 'support' | 'system';

export interface SupportTicket {
  id: string;
  _id: string;
  ticket_number: string;
  user_id: string;
  category: TicketCategory;
  subject: string;
  initial_message: string;
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  discord_thread_id?: string;
  last_message_preview?: string;
  last_message_at?: string;
  first_response_at?: string;
  resolved_at?: string;
  closed_at?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  _id: string;
  ticket_id: string;
  sender_type: MessageSenderType;
  sender_id: string;
  sender_name: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface CreateTicketRequest {
  category: TicketCategory;
  subject: string;
  message: string;
}

export interface PaginatedTickets {
  data: SupportTicket[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface SupportMessagePayload {
  id: string;
  ticket_id: string;
  sender_type: MessageSenderType;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

// ─── API class ────────────────────────────────────────────────────────────────

export class SupportApi {
  /** Create a new support ticket */
  static async createTicket(
    request: CreateTicketRequest
  ): Promise<SupportTicket> {
    const res = await httpClient.post<SupportTicket>(
      `${BASE}/tickets`,
      request
    );
    if (res.error) throw res.error;
    return res.data.data;
  }

  /** List the user's tickets (paginated) */
  static async listTickets(page = 1, limit = 20): Promise<PaginatedTickets> {
    const res = await httpClient.get<PaginatedTickets>(`${BASE}/tickets`, {
      params: { page, limit },
    });
    if (res.error) throw res.error;
    return res.data.data;
  }

  /** Get ticket + message history */
  static async getTicket(
    ticketId: string
  ): Promise<{ ticket: SupportTicket; messages: SupportMessage[] }> {
    const res = await httpClient.get<{
      ticket: SupportTicket;
      messages: SupportMessage[];
    }>(`${BASE}/tickets/${ticketId}`);
    if (res.error) throw res.error;
    return res.data.data;
  }

  /** User sends a message */
  static async sendMessage(
    ticketId: string,
    content: string
  ): Promise<SupportMessage> {
    const res = await httpClient.post<SupportMessage>(
      `${BASE}/tickets/${ticketId}/messages`,
      { content }
    );
    if (res.error) throw res.error;
    return res.data.data;
  }

  /** User closes their own ticket */
  static async closeTicket(ticketId: string): Promise<{ success: boolean }> {
    const res = await httpClient.patch<{ success: boolean }>(
      `${BASE}/tickets/${ticketId}/close`
    );
    if (res.error) throw res.error;
    return res.data.data;
  }
}
