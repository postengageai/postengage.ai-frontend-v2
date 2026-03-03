import type { User } from '@/lib/types/settings';
import type { SocialAccount } from '@/lib/types/social-accounts';

export const mockUser: User = {
  id: 'usr_123456789',
  email: 'alex@creatorstudio.com',
  first_name: 'Alex',
  last_name: 'Rivera',
  bio: 'Creator and influencer passionate about digital marketing',
  avatar: '/professional-creator-portrait.jpg',
  email_verified: true,
  account_status: 'active',
  plan: 'pro',
  role: 'user',
  created_at: '2024-06-15T10:30:00Z',
  updated_at: '2025-01-08T14:22:00Z',
};

export const mockSocialAccounts: SocialAccount[] = [
  {
    id: 'social_001',
    user_id: 'usr_123456789',
    platform: 'instagram',
    username: '@alexrivera.creates',
    platform_user_id: 'insta_123456',
    avatar: '/instagram-profile-photo.jpg',
    display_name: 'Alex Rivera',
    bio: 'Creator and content strategist',
    followers_count: 15000,
    status: 'active',
    connected_at: '2024-08-20T09:15:00Z',
    last_synced_at: '2025-01-09T08:00:00Z',
    is_primary: true,
    created_at: '2024-08-20T09:15:00Z',
    updated_at: '2025-01-09T08:00:00Z',
  },
  {
    id: 'social_002',
    user_id: 'usr_123456789',
    platform: 'instagram',
    username: '@rivera.lifestyle',
    platform_user_id: 'insta_789012',
    avatar: '/lifestyle-instagram-avatar.jpg',
    display_name: 'Rivera Lifestyle',
    bio: 'Lifestyle and travel inspiration',
    followers_count: 8500,
    status: 'inactive',
    connected_at: '2024-10-05T14:30:00Z',
    last_synced_at: '2024-12-28T16:45:00Z',
    is_primary: false,
    created_at: '2024-10-05T14:30:00Z',
    updated_at: '2024-12-28T16:45:00Z',
  },
];
