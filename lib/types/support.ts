export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: 'billing' | 'technical' | 'feature_request' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'pending_user' | 'resolved' | 'closed';
  ticket_number: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateTicketDto {
  subject: string;
  description: string;
  category: 'billing' | 'technical' | 'feature_request' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  attachments?: string[];
}
