export type LeadStatus = 'new' | 'contacted' | 'converted' | 'lost';
export type LeadCapturedFrom =
  | 'comment'
  | 'dm'
  | 'mention'
  | 'story_reply'
  | 'profile_visit'
  | 'manual';
export type LeadExportFormat = 'csv' | 'json';

export interface Lead {
  id: string;
  platform: string;
  platform_user_id: string;
  username: string;
  full_name?: string;
  avatar?: string;
  email?: string;
  status: LeadStatus;
  tags: string[];
  captured_from?: LeadCapturedFrom;
  captured_at: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateLeadPayload {
  platform: string;
  platform_user_id: string;
  username: string;
  full_name?: string;
  email?: string;
  captured_from?: string;
}

export interface LeadExportPayload {
  format: LeadExportFormat;
  filters?: {
    status?: string;
    platform?: string;
    tags?: string[];
    search?: string;
  };
  include_tags?: boolean;
  include_metadata?: boolean;
}

export interface LeadExportResult {
  format: LeadExportFormat;
  data: Lead[];
  count: number;
}

export interface AddLeadTagsPayload {
  tags: string[];
  operation?: 'set' | 'add' | 'remove';
}
