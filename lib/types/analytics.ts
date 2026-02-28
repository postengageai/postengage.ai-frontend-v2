export enum AnalyticsPeriod {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  CUSTOM = 'custom',
}

export interface IntelligenceAnalyticsItem {
  date: string;
  social_account_id: string;
  ai_calls: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  fallback_rate: number;
  escalation_rate: number;
  // Added fields for UI compatibility
  total_processed: number;
  replied_count: number;
  avg_latency_ms: number;
  actions_taken: number;
  confidence_score: number;
}
