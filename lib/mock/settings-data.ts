import type { User, SocialAccount } from '@/lib/types/settings';

export const mockUser: User = {
  id: 'usr_123456789',
  email: 'alex@creatorstudio.com',
  first_name: 'Alex',
  last_name: 'Rivera',
  is_verified: true,
  status: 'active',
  avatar: {
    id: 'avatar_001',
    url: '/professional-creator-portrait.jpg',
    thumbnail_url: '/professional-creator-portrait-thumb.jpg',
  },
  role: 'user',
  language: 'en',
  created_at: '2024-06-15T10:30:00Z',
  updated_at: '2025-01-08T14:22:00Z',
};

export const mockSocialAccounts: SocialAccount[] = [
  {
    id: 'social_001',
    platform: 'instagram',
    username: '@alexrivera.creates',
    platform_user_id: 'insta_123456',
    status: 'connected',
    access_token: 'token_xxx',
    created_at: '2024-08-20T09:15:00Z',
    updated_at: '2025-01-09T08:00:00Z',
  },
  {
    id: 'social_002',
    platform: 'instagram',
    username: '@rivera.lifestyle',
    platform_user_id: 'insta_789012',
    status: 'disconnected',
    access_token: 'token_yyy',
    created_at: '2024-10-05T14:30:00Z',
    updated_at: '2024-12-28T16:45:00Z',
  },
];
