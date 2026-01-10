import type { User, SocialAccount } from '@/lib/types/settings';

export const mockUser: User = {
  id: 'usr_123456789',
  email: 'alex@creatorstudio.com',
  first_name: 'Alex',
  last_name: 'Rivera',
  phone: '+1 (555) 123-4567',
  avatar: {
    id: 'media_001',
    url: '/professional-creator-portrait.jpg',
  },
  is_verified: true,
  status: 'active',
  timezone: 'America/Los_Angeles',
  language: 'en',
  role: 'user',
  created_at: '2024-06-15T10:30:00Z',
  updated_at: '2025-01-08T14:22:00Z',
};

export const mockSocialAccounts: SocialAccount[] = [
  {
    id: 'social_001',
    platform: 'instagram',
    username: '@alexrivera.creates',
    avatar: {
      id: 'media_002',
      url: '/instagram-profile-photo.jpg',
    },
    connection_status: 'connected',
    connected_at: '2024-08-20T09:15:00Z',
    last_synced_at: '2025-01-09T08:00:00Z',
    is_active: true,
    is_primary: true,
    created_at: '2024-08-20T09:15:00Z',
    updated_at: '2025-01-09T08:00:00Z',
  },
  {
    id: 'social_002',
    platform: 'instagram',
    username: '@rivera.lifestyle',
    avatar: {
      id: 'media_003',
      url: '/lifestyle-instagram-avatar.jpg',
    },
    connection_status: 'expired',
    connected_at: '2024-10-05T14:30:00Z',
    last_synced_at: '2024-12-28T16:45:00Z',
    is_active: false,
    is_primary: false,
    created_at: '2024-10-05T14:30:00Z',
    updated_at: '2024-12-28T16:45:00Z',
  },
];
