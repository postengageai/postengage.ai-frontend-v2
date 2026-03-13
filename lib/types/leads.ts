import type { SocialPlatform } from './settings';

export type CaptureSource =
  | 'comment'
  | 'dm'
  | 'reel'
  | 'story'
  | 'post'
  | 'live';

export interface LeadTag {
  id: string;
  name: string;
  color?: string;
}

/**
 * One social-platform account linked to a lead.
 * A lead can have many profiles — one per platform.
 */
export interface LeadSocialProfile {
  id: string;
  social_account_id: string;
  platform: SocialPlatform;
  platform_user_id: string;
  username: string;
  avatar_url?: string | null;
  is_primary: boolean;
  added_at: string;
}

/**
 * A Lead is a real person / contact.
 * They can be linked to multiple social-platform profiles across platforms.
 */
export interface Lead {
  id: string;
  full_name?: string | null;
  notes?: string | null;
  /** Plain tag strings (normalized by the backend) */
  tags: string[];
  social_profiles: LeadSocialProfile[];
  captured_from: CaptureSource;
  captured_at: string;
  last_engaged?: string | null;
  metadata?: {
    comment_id?: string;
    message_id?: string;
    post_url?: string;
    reel_url?: string;
    story_url?: string;
    keywords?: string[];
    source_id?: string;
    engagement_type?: string;
  };
  created_at: string;
  updated_at: string;
  /** Convenience — derived from primary profile, populated by the transformer */
  platform?: SocialPlatform | null;
  username?: string | null;
  avatar_url?: string | null;
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface GetLeadsParams {
  page?: number;
  per_page?: number;
  limit?: number;
  search?: string;
  platform?: SocialPlatform | 'all';
  tags?: string[];
  capture_source?: CaptureSource;
}

export interface CreateLeadRequest {
  socialAccountId: string;
  platform: SocialPlatform;
  platformUserId: string;
  username: string;
  fullName?: string;
  capturedFrom: CaptureSource;
  tags?: string[];
  metadata?: {
    post_url?: string;
    keywords?: string[];
    comment_id?: string;
    engagement_type?: string;
  };
  notes?: string;
}

export interface AddSocialProfileRequest {
  social_account_id: string;
  platform: SocialPlatform;
  platform_user_id: string;
  username: string;
  profile_picture?: string;
}

export interface UpdateLeadTagsRequest {
  tags: string[];
}

export interface ExportLeadsParams {
  format: 'csv' | 'json';
  platform?: SocialPlatform | 'all';
  tags?: string[];
  search?: string;
  limit?: number;
}
