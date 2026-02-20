export interface BotBehavior {
  auto_reply_enabled: boolean;
  max_replies_per_hour: number;
  max_replies_per_day: number;
  reply_delay_min_seconds: number;
  reply_delay_max_seconds: number;
  escalation_threshold: number;
  cta_aggressiveness: 'none' | 'soft' | 'moderate' | 'aggressive';
  should_reply_to_spam: boolean;
  stop_after_escalation: boolean;
}

export enum BotStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ERROR = 'error',
}

export interface Bot {
  _id: string;
  user_id: string;
  social_account_id: string;
  name: string;
  description: string;
  brand_voice_id?: string;
  behavior: BotBehavior;
  status: BotStatus;
  is_active: boolean;
  stats: {
    total_replies: number;
    avg_confidence: number;
    last_reply_at?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateBotDto {
  social_account_id: string;
  name: string;
  description?: string;
  brand_voice_id?: string;
  behavior?: Partial<BotBehavior>;
}

export interface UpdateBotDto {
  name?: string;
  description?: string;
  brand_voice_id?: string;
  status?: BotStatus;
  is_active?: boolean;
  behavior?: Partial<BotBehavior>;
}

export interface ProcessedChunk {
  chunk_index: number;
  text: string;
  token_count: number;
}

export interface KnowledgeSource {
  _id: string;
  bot_id: string;
  title: string;
  source_type: 'text' | 'url' | 'file';
  content_preview?: string; // Optional as it might not be in the response
  raw_content?: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  processed_chunks: ProcessedChunk[];
  last_synced_at?: string;
  created_at: string;
}

export interface AddKnowledgeSourceDto {
  title: string;
  content: string;
}

export enum LlmConfigMode {
  MANAGED = 'managed',
  BYOM = 'byom',
}

export enum ByomProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
}

export enum ResponseLengthPreference {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
}

export interface ByomConfig {
  provider: ByomProvider;
  api_key: string;
  preferred_model?: string;
  fallback_model?: string;
  max_tokens_per_request?: number;
  monthly_token_budget?: number;
}

export interface LlmSettings {
  temperature?: number;
  max_response_length?: ResponseLengthPreference;
  language?: string;
}

export interface UserLlmConfig {
  _id: string;
  user_id: string;
  mode: LlmConfigMode;
  byom_config?: ByomConfig;
  settings?: LlmSettings;
  usage_stats: {
    total_tokens_used: number;
    current_month_tokens: number;
    last_reset_date: string;
  };
  updated_at: string;
}

export interface UpdateUserLlmConfigDto {
  mode?: LlmConfigMode;
  byom_config?: Partial<ByomConfig>;
  settings?: Partial<LlmSettings>;
}
