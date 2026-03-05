// Types for the PostEngageAI Dashboard

import { Notification } from './notifications';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'starter' | 'pro' | 'business';
}

export interface ConnectedAccount {
  id: string;
  platform: 'instagram';
  username: string;
  profilePicture?: string;
  isConnected: boolean;
  lastSync?: Date;
}

export interface Automation {
  id: string;
  name: string;
  trigger: 'comment' | 'keyword' | 'dm' | 'mention';
  action: 'reply' | 'dm' | 'like';
  triggers?: string[];
  actions?: string[];
  status: 'running' | 'paused';
  creditCost: number;
  handledCount: number;
  lastRun?: Date;
  createdAt: Date;
}

export interface DashboardState {
  user: User;
  connectedAccount: ConnectedAccount | null;
  credits: {
    remaining: number;
    total: number;
    estimatedReplies: number;
  };
  automations: Automation[];
  notifications: Notification[];
  isLoading: boolean;
}

export interface Suggestion {
  id: string;
  type:
    | 'action'
    | 'info'
    | 'warning'
    | 'connect'
    | 'create'
    | 'upgrade'
    | 'optimize';
  title: string;
  description: string;
  action_label?: string;
  action_url?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface PerformanceMetrics {
  engagement_rate: number;
  reply_rate: number;
  conversion_rate: number;
  average_response_time: number;
}

export interface Activity {
  id: string;
  type: string;
  description?: string;
  timestamp: Date;
  automationName?: string;
  creditCost: number;
}
