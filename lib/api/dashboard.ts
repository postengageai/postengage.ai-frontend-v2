import { httpClient, SuccessResponse } from '../http/client';

export interface DashboardConnectedAccount {
  username: string;
  platform: string;
  status: string;
  last_sync: string;
  avatar_url?: string;
}

export interface DashboardOverview {
  total_leads: number;
  total_automations: number;
  active_automations: number;
  credits_remaining: number;
  credits_used_today: number;
  credits_used_this_month: number;
  weekly_growth: number;
  auto_reply_rate: number;
  unique_people_engaged: number;
  fallback_rate: number;
  time_saved_week_hours: number;
  top_intent_today: string | null;
}

export interface ConversationChartPoint {
  date: string;
  conversations: number;
  auto_reply_rate: number;
}

export interface DashboardHealth {
  status: 'healthy' | 'warning' | 'error';
  status_message: string;
  is_connected: boolean;
  active_automations: number;
  last_activity_at: string | null;
  credits_remaining: number;
  burn_rate_daily: number;
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
  triggers?: string[];
  actions?: string[];
  created_at: string;
}

export interface DashboardSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'action';
  action_label?: string;
  action_url?: string;
}

export interface DashboardActivity {
  id: string;
  user_id: string;
  type: 'social' | 'system' | 'billing' | 'automation';
  title: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
  action_label?: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  dismissible?: boolean;
  click_count?: number;
  is_broadcast?: boolean;
  target_channels?: string[];
}

export interface DashboardPerformance {
  engagement_rate: number;
  reply_rate: number;
  conversion_rate: number;
  average_response_time: number;
}

export interface DashboardImpact {
  replies_handled_today: number;
  hours_saved_today: number;
  hot_leads_today: number;
  weekly_replies: number;
  weekly_replies_growth_pct: number;
}

export interface DashboardStatsResponse {
  connected_account?: DashboardConnectedAccount;
  overview: DashboardOverview;
  automations: DashboardAutomation[];
  suggestions: DashboardSuggestion[];
  recent_activity: DashboardActivity[];
  performance: DashboardPerformance;
  impact: DashboardImpact;
}

export class DashboardApi {
  static async getStats(): Promise<SuccessResponse<DashboardStatsResponse>> {
    const response = await httpClient.get<DashboardStatsResponse>(
      'api/v1/dashboard/stats'
    );
    return response.data!;
  }

  static async getConversationChart(
    days: 7 | 30 = 7
  ): Promise<SuccessResponse<ConversationChartPoint[]>> {
    const response = await httpClient.get<ConversationChartPoint[]>(
      `api/v1/dashboard/conversation-chart?days=${days}`
    );
    return response.data!;
  }

  static async getHealth(): Promise<SuccessResponse<DashboardHealth>> {
    const response = await httpClient.get<DashboardHealth>(
      'api/v1/dashboard/health'
    );
    return response.data!;
  }
}

export const dashboardApi = DashboardApi;
