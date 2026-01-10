// Mock data for the PostEngageAI Dashboard

import type {
  DashboardState,
  Activity,
  Automation,
  Suggestion,
} from '@/lib/types/dashboard';

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

export const mockActivities: Activity[] = [
  {
    id: 'act_1',
    type: 'reply_sent',
    automationName: 'Welcome New Commenters',
    description: 'Replied to @sarah_designs on "New collection drop"',
    creditCost: 1,
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    metadata: { username: 'sarah_designs' },
  },
  {
    id: 'act_2',
    type: 'dm_sent',
    automationName: 'Price Question Auto-DM',
    description: 'Sent pricing info to @mark_buyer',
    creditCost: 2,
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    metadata: { username: 'mark_buyer' },
  },
  {
    id: 'act_3',
    type: 'reply_sent',
    automationName: 'Welcome New Commenters',
    description: 'Replied to @creative.jane on "Behind the scenes"',
    creditCost: 1,
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    metadata: { username: 'creative.jane' },
  },
  {
    id: 'act_4',
    type: 'skipped',
    automationName: 'Welcome New Commenters',
    description: 'Skipped spam comment from @bot_account',
    creditCost: 0,
    timestamp: new Date(Date.now() - 22 * 60 * 1000),
    metadata: { username: 'bot_account', reason: 'spam_detected' },
  },
  {
    id: 'act_5',
    type: 'reply_sent',
    automationName: 'Welcome New Commenters',
    description: 'Replied to @photography.mike on "Studio setup"',
    creditCost: 1,
    timestamp: new Date(Date.now() - 35 * 60 * 1000),
    metadata: { username: 'photography.mike' },
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
  activities: mockActivities,
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
  activities: [],
  isLoading: false,
};

export const mockSuggestions: Suggestion[] = [
  {
    id: 'sug_1',
    type: 'optimize',
    title: 'Engagement spike detected',
    description: 'Your last post is getting 3x more comments than usual.',
    action: 'Create automation for this post',
    priority: 'high',
  },
  {
    id: 'sug_2',
    type: 'create',
    title: 'DMs are piling up',
    description: '12 unread DMs contain product questions.',
    action: 'Set up DM auto-responder',
    priority: 'medium',
  },
  {
    id: 'sug_3',
    type: 'upgrade',
    title: 'Running low on credits',
    description: 'At current pace, credits will last ~3 days.',
    action: 'View plans',
    priority: 'low',
  },
];

export const mockEmptySuggestions: Suggestion[] = [
  {
    id: 'sug_empty_1',
    type: 'connect',
    title: 'Connect your Instagram',
    description: 'Link your account to start automating replies.',
    action: 'Connect Instagram',
    priority: 'high',
  },
];
