export interface DashboardUser {
  id: string;
  email: string;
  first_name: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'deactivated';
}

export interface DashboardMetrics {
  total_accounts: number;
  total_bots: number;
  total_automations: number;
  total_leads: number;
  unread_notifications: number;
}

export interface DashboardCredits {
  balance: number;
  monthly_allocation: number;
  usage_percentage: number;
  status: 'active' | 'low' | 'exhausted';
}

export interface DashboardRecentActivity {
  last_interaction: string;
  today_interactions: number;
  today_leads: number;
}

export interface DashboardSocialAccount {
  id: string;
  platform: string;
  username: string;
  followers?: number;
  is_primary: boolean;
  status: string;
}

export interface DashboardAlert {
  type: 'info' | 'warning' | 'error';
  message: string;
}

export interface DashboardStats {
  user: DashboardUser;
  metrics: DashboardMetrics;
  credits: DashboardCredits;
  recent_activity: DashboardRecentActivity;
  social_accounts: DashboardSocialAccount[];
  active_automations: number;
  scheduled_tasks: number;
  alerts: DashboardAlert[];
}
