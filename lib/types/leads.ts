export interface Lead {
  id: string;
  user_id: string;
  platform: string;
  platform_user_id: string;
  username: string;
  full_name?: string | null;
  profile_picture?: string | null;
  tags: string[];
  captured_from: string;
  captured_at: string;
  last_engaged?: string | null;
  metadata?: Record<string, unknown>;
  social_account?: unknown; // Expanded
  created_at: string;
  updated_at: string;
  _links?: Record<string, { href: string; method?: string }>;
}

export interface CreateLeadPayload {
  platform: string;
  platform_user_id: string;
  username: string;
  full_name?: string;
  captured_from?: string;
}

export interface LeadExportPayload {
  format: 'csv' | 'json';
  filters?: {
    platform?: string;
    tags?: string[];
    search?: string;
    start_date?: string;
    end_date?: string;
  };
  include_tags?: boolean;
  include_metadata?: boolean;
}

export interface LeadExportResult {
  format: 'csv' | 'json';
  data: Lead[];
  count: number;
}

export interface AddLeadTagsPayload {
  tags: string[];
  operation?: 'set' | 'add' | 'remove';
}
