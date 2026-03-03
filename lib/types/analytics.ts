export enum AnalyticsPeriod {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

/**
 * High-level analytics overview for a given period
 */
export interface AnalyticsOverview {
  period: string;
  total_interactions: number;
  total_leads_captured: number;
  total_messages_sent: number;
  total_messages_received: number;
  response_rate: number;
  avg_response_time_ms: number;
  active_automations: number;
  credits_used: number;
  comparison: {
    interactions_change: number;
    leads_change: number;
    messages_change: number;
    response_rate_change: number;
  };
}

/**
 * Individual activity record
 */
export interface Activity {
  id: string;
  type:
    | 'comment_reply'
    | 'dm_sent'
    | 'lead_captured'
    | 'automation_triggered'
    | 'bot_response';
  description: string;
  platform: string;
  automation_id?: string;
  automation_name?: string;
  lead_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

/**
 * Intelligence and bot performance metrics
 */
export interface IntelligenceMetrics {
  period: string;
  total_bot_interactions: number;
  avg_quality_score: number;
  sentiment_breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  top_topics: Array<{ topic: string; count: number }>;
  voice_dna_accuracy: number;
  credits_used_intelligence: number;
}
