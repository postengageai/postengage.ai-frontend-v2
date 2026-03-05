// === Response Quality Metrics ===
export interface ResponseQualityMetrics {
  total_responses: number;
  avg_confidence: number;
  confidence_distribution: {
    high: number;
    medium: number;
    low: number;
    very_low: number;
  };
  grounded_percentage: number;
  hallucination_rate: number;
  safe_template_usage: number;
  avg_generation_time_ms: number;
  retry_rate: number;
}

// === Diversity Metrics ===
export interface DiversityMetrics {
  unique_reply_percentage: number;
  diversity_score: number;
  most_repeated_phrases: { phrase: string; count: number }[];
  diversity_trend: { date: string; score: number }[];
}

// === Intent Analytics ===
export interface IntentAnalytics {
  intent_distribution: {
    intent: string;
    count: number;
    percentage: number;
    avg_confidence: number;
  }[];
  intent_trend: {
    date: string;
    intents: Record<string, number>;
  }[];
}

// === Combined Analytics Response ===
export interface IntelligenceQualityAnalytics {
  period: {
    start: string;
    end: string;
    type: 'daily' | 'weekly' | 'monthly';
  };
  quality: ResponseQualityMetrics;
  diversity: DiversityMetrics;
  intents: IntentAnalytics;
  response_actions: {
    auto_replied: number;
    held_for_approval: number;
    escalated: number;
    skipped: number;
    safe_template_used: number;
  };
}

// === Bot Health (Phase 4) ===
export type BotHealthLevel = 'good' | 'fair' | 'poor';

export interface BotHealthScore {
  level: BotHealthLevel;
  score: number;
  factors: {
    label: string;
    status: 'good' | 'warning' | 'issue';
  }[];
  last_updated_at: string;
}

// === Flagged Reply (Phase 4) ===
export interface FlaggedReply {
  _id: string;
  bot_id: string;
  original_message: string;
  generated_reply: string;
  confidence_score: number;
  flag_reason: string;
  action_taken: 'held_for_approval' | 'safe_template_used';
  reviewed: boolean;
  reviewed_at?: string;
  created_at: string;
}

export interface FlaggedRepliesParams {
  page?: number;
  limit?: number;
  reviewed?: boolean;
}

// === Query Params ===
export interface QualityAnalyticsParams {
  period?: 'daily' | 'weekly' | 'monthly';
  bot_id?: string;
  from?: string;
  to?: string;
  include_quality?: boolean;
  include_diversity?: boolean;
  include_intents?: boolean;
}
