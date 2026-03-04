export interface ConversationParticipant {
  id: string;
  username?: string;
  name?: string;
  avatar_url?: string;
}

export interface MessageAttachment {
  type: string;
  url: string;
  name?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  platform_message_id: string;
  sender_id: string;
  recipient_id: string;
  text?: string | null;
  attachments: MessageAttachment[];
  timestamp: string;
  is_echo: boolean;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  _links?: Record<string, { href: string; method?: string }>;
}

export interface Conversation {
  id: string;
  social_account_id: string;
  platform: string;
  platform_conversation_id: string;
  participants: string[]; // IDs of participants
  last_message_at: string;
  unread_count: number;
  tags: string[];
  detected_intent?: string | null;
  language?: string | null;
  sentiment: string;
  total_interactions: number;
  social_account?: unknown; // Expanded
  messages?: Message[]; // Expanded
  created_at: string;
  updated_at: string;
  _links?: Record<string, { href: string; method?: string }>;
}

export interface ConversationListParams {
  page?: number;
  limit?: number;
  status?: string;
  platform?: string;
  search?: string;
  unread_only?: boolean;
  sort_by?: 'recent' | 'oldest' | 'unread';
}

export interface SendMessageRequest {
  text?: string;
  attachments?: Array<{
    type: string;
    url: string; // or payload
  }>;
  use_ai_reply?: boolean;
}
