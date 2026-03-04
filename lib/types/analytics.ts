export enum AnalyticsPeriod {
  TODAY = 'today',
  YESTERDAY = 'yesterday',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  CUSTOM = 'custom',
}

export interface AnalyticsDateRange {
  start: string;
  end: string;
  type?: AnalyticsPeriod;
}

export interface AnalyticsMetrics {
  totalLeads: number;
  totalExecutions: number;
  totalCreditsUsed: number;
  successRate: number;
}

export interface AnalyticsOverviewResponse {
  period: AnalyticsDateRange;
  metrics: AnalyticsMetrics;
}

export interface DailyActivity {
  date: string;
  executions: number;
  failures: number;
}

export interface AnalyticsActivityResponse {
  period: AnalyticsDateRange;
  activity: {
    data: DailyActivity[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
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
  llm_failures: number;
  escalations: number;
  total_decisions: number;
  // Extended analytics fields
  total_processed?: number;
  replied_count?: number;
  avg_latency_ms?: number;
  actions_taken?: number;
}

export interface IntelligenceAnalyticsResponse {
  period: AnalyticsDateRange;
  items: IntelligenceAnalyticsItem[];
}

// Analytics API Response types
export interface IntelligenceAnalyticsParams {
  period: AnalyticsPeriod;
  bot_id?: string;
}

export interface QualityAnalyticsParams {
  period?: 'daily' | 'weekly' | 'monthly';
  bot_id?: string;
  include_quality?: boolean;
  include_diversity?: boolean;
  include_intents?: boolean;
}
