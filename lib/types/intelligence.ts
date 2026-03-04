export const BotStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  ARCHIVED: 'archived',
} as const;

export type BotStatus = (typeof BotStatus)[keyof typeof BotStatus];

export const CtaAggressiveness = {
  NONE: 'none',
  SOFT: 'soft',
  MODERATE: 'moderate',
  AGGRESSIVE: 'aggressive',
} as const;

export type CtaAggressiveness =
  (typeof CtaAggressiveness)[keyof typeof CtaAggressiveness];

export interface BotBehavior {
  auto_reply_enabled: boolean;
  max_replies_per_hour?: number;
  max_replies_per_day?: number;
  reply_delay_min_seconds?: number;
  reply_delay_max_seconds?: number;
  escalation_threshold?: number;
  cta_aggressiveness?: CtaAggressiveness;
  should_reply_to_spam?: boolean;
  stop_after_escalation?: boolean;
}

// Alias for DTO compatibility if needed, but prefer BotBehavior
export type BotBehaviorDto = BotBehavior;

export interface BrandVoice {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  tone_primary: string;
  tone_intensity: number;
  formality: string;
  language: string;
  keywords_to_include: string[];
  keywords_to_avoid: string[];
  preferred_greetings: string[];
  preferred_closings?: string[];
  response_length: string;
  use_emojis: boolean;
  emoji_intensity: number;
  use_hashtags?: boolean;
  company_name?: string | null;
  company_description?: string | null;
  website?: string | null;
  contact_email?: string | null;
  operating_hours?: string | null;
  custom_instructions?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateBrandVoiceDto {
  name: string;
  description?: string;
  tone_primary?: string;
  tone_intensity?: number;
  formality?: string;
  language?: string;
  keywords_to_include?: string[];
  keywords_to_avoid?: string[];
  preferred_greetings?: string[];
  preferred_closings?: string[];
  response_length?: 'short' | 'medium' | 'long';
  use_emojis?: boolean;
  emoji_intensity?: number;
  use_hashtags?: boolean;
  company_name?: string;
  company_description?: string;
  website?: string;
  contact_email?: string;
  operating_hours?: string;
  custom_instructions?: string;
}

export const KnowledgeSourceType = {
  PDF: 'pdf',
  TEXT: 'text',
  DOCX: 'docx',
  URL: 'url',
  FAQ: 'faq',
} as const;

export type KnowledgeSourceType =
  (typeof KnowledgeSourceType)[keyof typeof KnowledgeSourceType];

export const KnowledgeSourceStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  READY: 'ready',
  ERROR: 'error',
} as const;

export type KnowledgeSourceStatus =
  (typeof KnowledgeSourceStatus)[keyof typeof KnowledgeSourceStatus];

export interface KnowledgeSource {
  id: string;
  source_type: KnowledgeSourceType;
  content?: string;
  title?: string;
  status: KnowledgeSourceStatus;
  file_url?: string;
  website_url?: string;
  icon?: string;
  token_count?: number;
  last_synced_at?: string;
  created_at: string;
}

export interface Bot {
  id: string;
  user_id: string;
  social_account_id: string;
  brand_voice_id?: string | null;
  name: string;
  description: string;
  status: BotStatus;
  is_active: boolean;
  behavior: BotBehavior;
  stats: {
    total_replies: number;
    total_escalations: number;
    total_skipped: number;
    avg_confidence: number;
    last_active_at?: string;
  };
  social_account?: unknown; // Expanded
  brand_voice?: BrandVoice; // Expanded
  knowledge_sources?: {
    source_id: string;
    weight: number;
  }[];
  created_at: string;
  updated_at: string;
}

export interface CreateBotDto {
  name: string;
  description?: string;
  social_account_id: string;
  brand_voice_id?: string;
  behavior?: Partial<BotBehavior>;
}

export interface UpdateBotDto {
  name?: string;
  description?: string;
  status?: BotStatus;
  brand_voice_id?: string;
  behavior?: Partial<BotBehavior>;
}

// Voice DNA Types
export interface CreateVoiceDnaDto {
  brand_voice_id: string;
  samples: string[];
  source?: string;
}

export interface AddFewShotExampleDto {
  context: string;
  reply: string;
  tags?: string[];
}

export interface ReanalyzVoiceDnaDto {
  additional_samples?: string[];
}

export interface TriggerAutoInferDto {
  bot_id: string;
  brand_voice_id?: string;
}

export interface VoiceFeedbackDto {
  voice_dna_id: string;
  log_id: string;
  feedback_status: 'approved' | 'edited' | 'rejected';
  original_text: string;
  context_text: string;
  edited_text?: string;
}

export interface AdjustVoiceDto {
  add_few_shot_examples?: string[];
  remove_few_shot_indices?: string[];
  add_negative_examples?: string[];
  trigger_reanalysis?: boolean;
}

export interface VoiceDNA {
  id: string;
  brand_voice_id: string;
  user_id: string;
  status: 'pending' | 'analyzing' | 'ready' | 'failed';
  source: 'user_configured' | 'auto_inferred' | 'hybrid';
  samples_analyzed: number;
  analysis_model?: string | null;
  last_analyzed_at?: string | null;
  few_shot_count: number;
  negative_example_count: number;
  brand_voice?: BrandVoice; // Expanded
  created_at: string;
  updated_at: string;
}

// Memory Types
export interface MemoryStats {
  total_users: number;
  total_entities: number;
  active_last_24h: number;
}

export const RelationshipStage = {
  NEW: 'new',
  ENGAGED: 'engaged',
  LOYAL: 'loyal',
  AT_RISK: 'at_risk',
  CHURNED: 'churned',
} as const;

export type RelationshipStage =
  (typeof RelationshipStage)[keyof typeof RelationshipStage];

export interface TrackedUser {
  id: string;
  external_id: string;
  platform: string;
  username?: string;
  full_name?: string;
  relationship_stage: RelationshipStage;
  last_interaction_at: string;
  interaction_count: number;
  entity_count: number;
}

export interface MemoryEntity {
  id: string;
  name: string;
  type: string;
  value: string;
  confidence: number;
  last_updated: string;
}

export interface MemoryUsersParamsDto {
  page?: number;
  limit?: number;
  stage?: string;
  search?: string;
  sort_by?: 'last_interaction' | 'total_interactions' | 'entity_count';
  sort_order?: 'asc' | 'desc';
}

// Response Length Preference enum
export const ResponseLengthPreference = {
  SHORT: 'short',
  MEDIUM: 'medium',
  LONG: 'long',
} as const;

export type ResponseLengthPreference =
  (typeof ResponseLengthPreference)[keyof typeof ResponseLengthPreference];

// LLM Config Types
export const LlmConfigMode = {
  PLATFORM: 'platform',
  BYOM: 'byom',
} as const;

export type LlmConfigMode = (typeof LlmConfigMode)[keyof typeof LlmConfigMode];

export const ByomProvider = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  TOGETHER: 'together',
  GROQ: 'groq',
} as const;

export type ByomProvider = (typeof ByomProvider)[keyof typeof ByomProvider];

export interface UserLlmConfig {
  id: string;
  user_id: string;
  mode: LlmConfigMode;
  byom_config?: {
    provider: ByomProvider;
    api_key?: string;
    api_key_last_four?: string;
    preferred_model?: string;
    fallback_model?: string;
    max_tokens_per_request?: number;
    monthly_token_budget?: number;
  };
  settings?: {
    temperature?: number;
    max_response_length?: string;
    language?: string;
    preferred_model?: string;
    fallback_model?: string;
    max_tokens_per_request?: number;
    monthly_token_budget?: number;
  };
  created_at: string;
  updated_at: string;
}
