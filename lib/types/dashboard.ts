// Types for the PostEngageAI Dashboard

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

export interface Activity {
  id: string;
  type: 'reply_sent' | 'dm_sent' | 'automation_paused' | 'error' | 'skipped';
  automationName: string;
  description: string;
  creditCost: number;
  timestamp: Date;
  metadata?: {
    username?: string;
    postId?: string;
    reason?: string;
  };
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
  activities: Activity[];
  isLoading: boolean;
}

export interface Suggestion {
  id: string;
  type: 'connect' | 'create' | 'upgrade' | 'optimize';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}
