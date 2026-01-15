// Mock data for the PostEngageAI Dashboard

import type { DashboardState, Automation } from '@/lib/types/dashboard';
import { Notification } from '@/lib/types/notifications';

export const mockUser = {
  id: 'user_1',
  name: 'Alex Chen',
  email: 'alex@example.com',
  avatar: '/professional-avatar.png',
  plan: 'starter' as const,
};

export const mockConnectedAccount = {
  id: 'acc_1',
  platform: 'instagram' as const,
  username: 'alexcreates',
  profilePicture: '/generic-social-media-profile.png',
  isConnected: true,
  lastSync: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
};

export const mockAutomations: Automation[] = [
  {
    id: 'auto_1',
    name: 'Welcome New Commenters',
    trigger: 'comment',
    action: 'reply',
    status: 'running',
    creditCost: 1,
    handledCount: 347,
    lastRun: new Date(Date.now() - 2 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'auto_2',
    name: 'Price Question Auto-DM',
    trigger: 'keyword',
    action: 'dm',
    status: 'running',
    creditCost: 2,
    handledCount: 89,
    lastRun: new Date(Date.now() - 15 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'auto_3',
    name: 'Support Request Handler',
    trigger: 'dm',
    action: 'reply',
    status: 'paused',
    creditCost: 1,
    handledCount: 156,
    lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif_1',
    user_id: 'user_1',
    type: 'social',
    title: 'New Instagram Message',
    message: 'Replied to @sarah_designs on "New collection drop"',
    status: 'unread',
    priority: 'medium',
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    tags: [],
    dismissible: true,
    click_count: 0,
    is_broadcast: false,
    target_channels: [],
  },
];

export const mockDashboardState: DashboardState = {
  user: mockUser,
  connectedAccount: mockConnectedAccount,
  credits: {
    remaining: 127,
    total: 500,
    estimatedReplies: 127,
  },
  automations: mockAutomations,
  notifications: mockNotifications,
  isLoading: false,
};

// Empty state version
export const mockEmptyDashboardState: DashboardState = {
  user: mockUser,
  connectedAccount: null,
  credits: {
    remaining: 50,
    total: 50,
    estimatedReplies: 50,
  },
  automations: [],
  notifications: [],
  isLoading: false,
};
