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

export interface IntelligenceLogItem {
  _id: string;
  platform: string;
  platform_user_id: string;
  platform_username: string | null;
  message_text: string;
  message_type: string;
  intent_label: string;
  intent_confidence: number;
  intent_reasoning: string;
  decision_action: string;
  response_text: string | null;
  risk_score: number;
  risk_flags: string[];
  created_at: string;
}

export interface IntelligenceLogsByIntentResponse {
  period: { start: string; end: string; type?: AnalyticsPeriod };
  intent: string;
  items: IntelligenceLogItem[];
  total: number;
  page: number;
  limit: number;
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
