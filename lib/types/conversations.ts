export interface ConversationParticipant {
  id: string;
  username: string;
  name: string;
  avatar_url?: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'whatsapp';
  is_verified: boolean;
  is_business: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender: ConversationParticipant;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'file' | 'carousel';
  attachments?: Array<{
    id: string;
    url: string;
    type: 'image' | 'video' | 'file';
    mime_type?: string;
  }>;
  sent_at: string;
  read_at?: string;
  is_from_bot: boolean;
  is_ai_generated: boolean;
}

export interface Conversation {
  id: string;
  participant_id: string;
  participant: ConversationParticipant;
  social_account_id: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'whatsapp';
  last_message?: Message;
  last_message_at: string;
  unread_count: number;
  is_archived: boolean;
  status: 'active' | 'archived' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
  message_count: number;
}

export interface ConversationListParams {
  status?: string;
  platform?: string;
  search?: string;
  unread_only?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'recent' | 'oldest' | 'unread';
}

export interface SendMessageRequest {
  content: string;
  message_type?: 'text' | 'image' | 'video' | 'file';
  attachments?: Array<{
    url: string;
    type: 'image' | 'video' | 'file';
  }>;
  use_ai_reply?: boolean;
}
