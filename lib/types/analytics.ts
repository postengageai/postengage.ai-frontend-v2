export enum AnalyticsPeriod {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  CUSTOM = 'custom',
}

export interface IntelligenceQualityAnalytics {
  period: { start: string; end: string; type?: AnalyticsPeriod };
  intents: { label: string; count: number; avg_confidence: number }[];
  decisions: { action: string; count: number }[];
  message_types: { type: string; count: number }[];
  quality: {
    total: number;
    passed_validation: number;
    avg_confidence: number;
    avg_risk_score: number;
    avg_regeneration_count: number;
    flagged_count: number;
  };
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
  // Aggregated UI fields — returned by the analytics aggregation pipeline
  total_processed: number;
  replied_count: number;
  avg_latency_ms: number;
  actions_taken: number;
  avg_confidence: number;
}
