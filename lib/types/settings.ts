import type { SocialAccountStatus, SocialPlatform } from './social-accounts';

export interface UserAvatar {
  id: string;
  url: string;
  thumbnail_url?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  is_verified: boolean;
  status:
    | 'active'
    | 'suspended'
    | 'banned'
    | 'pending_verification'
    | 'inactive';
  avatar?: UserAvatar | null;
  avatar_url?: string | null; // kept for backward compatibility with existing consumers
  timezone?: string | null;
  language: string;
  role: 'user' | 'admin';
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
  _links?: Record<string, { href: string; method?: string }>;
}

export interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  timezone?: string;
  language?: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Re-export types from social-accounts.ts for backward compatibility
export type { SocialAccountStatus, SocialPlatform };

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  platform_user_id: string;
  username: string;
  full_name?: string;
  profile_picture_url?: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  status: SocialAccountStatus;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ConnectedAccount extends SocialAccount {}
