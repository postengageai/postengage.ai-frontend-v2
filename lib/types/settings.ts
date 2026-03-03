// User types based on API contract
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin';
  account_status: 'active' | 'suspended' | 'deactivated';
  email_verified: boolean;
  plan: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  bio?: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

// Social Account types based on API contract
export type SocialPlatform =
  | 'twitter'
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'youtube'
  | 'tiktok'
  | 'pinterest';
export type SocialAccountConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'expired'
  | 'pending'
  | 'error';

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  username: string;
  avatar?: string;
  connection_status: SocialAccountConnectionStatus;
  connected_at: string;
  last_synced_at: string;
  is_active: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}
