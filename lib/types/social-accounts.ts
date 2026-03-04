export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'tiktok'
  | 'linkedin'
  | 'youtube'
  | 'pinterest';

export type SocialAccountStatus =
  | 'connected'
  | 'disconnected'
  | 'expired'
  | 'pending'
  | 'error';

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  username: string;
  platform_user_id: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string | null;
  followers_count?: number;
  following_count?: number;
  is_primary: boolean;
  is_active: boolean;
  is_verified?: boolean;
  connection_status: SocialAccountStatus;
  connected_at: string | null;
  last_synced_at?: string | null;
  auth_token_expires_at?: string;
  created_at: string;
  updated_at: string;
}
