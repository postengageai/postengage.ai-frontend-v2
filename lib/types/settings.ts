// User types based on API contract
export interface MediaObject {
  id: string;
  url: string;
  type?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar: MediaObject | null;
  is_verified: boolean;
  status: 'active' | 'inactive';
  timezone: string | null;
  language: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  avatar_id?: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
  confirm_password: string;
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
  avatar: MediaObject | null;
  connection_status: SocialAccountConnectionStatus;
  connected_at: string;
  last_synced_at: string;
  is_active: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}
