export type SocialPlatform = 'instagram' | 'facebook' | 'twitter' | 'tiktok';

export type SocialAccountStatus = 'active' | 'inactive' | 'disconnected';

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  platform_user_id: string;
  display_name?: string;
  bio?: string;
  avatar?: string;
  followers_count?: number;
  following_count?: number;
  is_primary: boolean;
  is_verified?: boolean;
  status: SocialAccountStatus;
  connected_at: string;
  last_synced_at?: string;
  auth_token_expires_at?: string;
  created_at: string;
  updated_at: string;
}
