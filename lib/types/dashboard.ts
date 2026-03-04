export interface DashboardConnectedAccount {
  username: string;
  platform: string;
  status: string;
  last_sync: string;
  avatar_url?: string;
}

export type ConnectedAccount = {
  username: string;
  lastSync?: Date;
};

export interface DashboardOverview {
  total_leads: number;
  total_automations: number;
  active_automations: number;
  credits_remaining: number;
  credits_used_today: number;
  credits_used_this_month: number;
  weekly_growth: number;
}

export interface DashboardAutomation {
  id: string;
  name: string;
  description: string;
  status: string;
  handled_count: number;
  credit_cost: number;
  last_active: string;
  trigger: string;
  action: string;
  triggers: string[];
  actions: string[];
  created_at: string;
}

export interface DashboardSuggestion {
  id: string;
  title: string;
  description: string;
  type:
    | 'info'
    | 'warning'
    | 'action'
    | 'connect'
    | 'create'
    | 'upgrade'
    | 'optimize';
  action_label?: string;
  action_url?: string;
  priority?: 'low' | 'medium' | 'high';
}

export type Suggestion = DashboardSuggestion;

export interface DashboardPerformance {
  engagement_rate: number;
  reply_rate: number;
  conversion_rate: number;
  average_response_time: number;
}

export interface DashboardActivity {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  action_label?: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
  tags: string[];
  dismissible: boolean;
  click_count: number;
  is_broadcast: boolean;
  target_channels: string[];

  // Added fields based on usage
  description?: string;
  automationName?: string;
  creditCost?: number;
  timestamp?: string;
}

export type Activity = DashboardActivity;

export interface DashboardStats {
  connected_account?: DashboardConnectedAccount;
  overview: DashboardOverview;
  automations: DashboardAutomation[];
  suggestions: DashboardSuggestion[];
  recent_activity: DashboardActivity[];
  performance: DashboardPerformance;
}

export interface User {
  name: string;
  email?: string;
  plan?: string;
}

export type PerformanceMetrics = DashboardPerformance;
