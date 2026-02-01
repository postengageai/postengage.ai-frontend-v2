export enum InboxConversationStatus {
  ALL = 'all',
  OPEN = 'open',
  CLOSED = 'closed',
}

export enum SocialPlatform {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  // Add others as needed
}

export interface InboxLead {
  _id: string;
  user_id: string;
  platform: SocialPlatform;
  platform_user_id: string;
  username: string;
  full_name: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
  last_engaged_at?: string;
  notes?: string;
  tags?: string[];
}

export interface InboxMessage {
  _id: string;
  conversation_id: string;
  sender_id: string; // Could be platform_user_id or social_account_id
  content: {
    text?: string;
    attachments?: Array<{
      type: 'image' | 'video' | 'audio' | 'file';
      url: string;
    }>;
  };
  timestamp: string;
  is_from_user: boolean; // True if from the customer (Lead)
  is_read: boolean;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface InboxConversation {
  _id: string;
  social_account_id: string;
  platform: SocialPlatform;
  participants: Array<{
    id: string;
    username: string;
    name?: string;
  }>;
  last_message?: InboxMessage;
  unread_count: number;
  status: InboxConversationStatus;
  lead?: InboxLead; // Enriched field
  updated_at: string;
  created_at: string;
}

export interface InboxConversationFilters {
  status?: InboxConversationStatus;
  platform?: SocialPlatform;
  social_account_id?: string;
  search?: string;
}
