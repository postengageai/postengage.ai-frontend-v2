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
  // Time-window scheduling
  schedule_enabled?: boolean;
  schedule_start_hour?: number; // 0–23
  schedule_end_hour?: number; // 0–23 (exclusive); if < start, wraps overnight
  schedule_timezone?: string; // IANA e.g. 'Asia/Kolkata'
  schedule_days?: number[]; // 0=Sun … 6=Sat, empty = every day
}

export enum BotStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

export interface Bot {
  _id: string;
  user_id: string;
  social_account_id: string;
  name: string;
  description: string;
  brand_voice_id?: string;
  knowledge_sources?: { source_id: string; weight: number }[];
  behavior: BotBehavior;
  status: BotStatus;
  is_active: boolean;
  stats: {
    total_replies: number;
    total_escalations: number;
    total_skipped: number;
    avg_confidence: number;
    last_active_at?: string;
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
  source_type: 'pdf' | 'text' | 'docx' | 'url' | 'faq';
  content_preview?: string; // Optional as it might not be in the response
  raw_content?: string;
  original_filename?: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  processed_chunks: ProcessedChunk[];
  processing_error?: string;
  file_size_bytes?: number;
  last_synced_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface AddKnowledgeSourceDto {
  title: string;
  content: string;
}

export enum LlmConfigMode {
  PLATFORM = 'platform',
  BYOM = 'byom',
}

export enum ByomProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
}

export type OperationType =
  | 'intent_classification'
  | 'response_generation'
  | 'voice_dna_analysis'
  | 'memory_consolidation'
  | 'entity_extraction'
  | 'knowledge_retrieval';

export const ALL_OPERATION_TYPES: OperationType[] = [
  'intent_classification',
  'response_generation',
  'voice_dna_analysis',
  'memory_consolidation',
  'entity_extraction',
  'knowledge_retrieval',
];

export const OPERATION_LABELS: Record<OperationType, string> = {
  intent_classification: 'Intent Classification',
  response_generation: 'Response Generation',
  voice_dna_analysis: 'Voice DNA Analysis',
  memory_consolidation: 'Memory Consolidation',
  entity_extraction: 'Entity Extraction',
  knowledge_retrieval: 'Knowledge Retrieval',
};

export const OPERATION_DESCRIPTIONS: Record<OperationType, string> = {
  intent_classification:
    'Classifies user intent — use a cheaper/faster model here',
  response_generation:
    'Generates bot replies — use the best quality model here',
  voice_dna_analysis: 'Analyzes writing style to build brand voice profiles',
  memory_consolidation:
    'Summarises conversation history into long-term memories',
  entity_extraction:
    'Extracts structured entities (names, products, dates) from messages',
  knowledge_retrieval: 'Retrieves relevant knowledge base chunks for a query',
};

export interface ByomOperationConfig {
  provider?: ByomProvider;
  model?: string;
}

export enum ResponseLengthPreference {
  SHORT = 'short',
  MEDIUM = 'medium',
  LONG = 'long',
}

export interface ByomConfig {
  provider: ByomProvider;
  api_key?: string;
  api_key_last_four?: string;
  preferred_model?: string;
  fallback_model?: string;
  max_tokens_per_request?: number;
  monthly_token_budget?: number;
  tokens_used_this_month?: number;
  last_validated_at?: string;
  is_valid?: boolean;
  validation_error?: string;
  last_error_at?: string;
  consecutive_errors?: number;
  /** Per-operation model overrides (Tier 1 of the resolution hierarchy). */
  operation_configs?: Partial<Record<OperationType, ByomOperationConfig>>;
}

export interface BrandVoice {
  _id: string;
  user_id: string;
  name: string;
  description?: string;
  tone_primary: string;
  tone_intensity: number;
  formality: string;
  language: string;
  keywords_to_include: string[];
  keywords_to_avoid: string[];
  preferred_greetings: string[];
  preferred_closings: string[];
  response_length: ResponseLengthPreference;
  use_emojis: boolean;
  emoji_intensity: number;
  use_hashtags: boolean;
  company_name?: string;
  company_description?: string;
  website?: string;
  contact_email?: string;
  operating_hours?: string;
  custom_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBrandVoiceDto {
  name: string;
  description?: string;
  tone_primary: string;
  tone_intensity?: number;
  formality: string;
  language?: string;
  keywords_to_include?: string[];
  keywords_to_avoid?: string[];
  preferred_greetings?: string[];
  preferred_closings?: string[];
  response_length?: ResponseLengthPreference;
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

export interface UpdateBrandVoiceDto extends Partial<CreateBrandVoiceDto> {}

export interface LlmSettings {
  temperature: number;
  max_response_length: ResponseLengthPreference;
  language: string;
}

export interface UserLlmConfig {
  _id: string;
  user_id: string;
  mode: LlmConfigMode;
  byom_config?: ByomConfig;
  settings: LlmSettings;
  updated_at: string;
}

export interface UpdateUserLlmConfigDto {
  mode?: LlmConfigMode;
  byom_config?: Partial<ByomConfig>;
  settings?: Partial<LlmSettings>;
}

export interface LlmDefaults {
  provider: string;
  model: string;
  max_tokens: number;
}

// ─── Hot Leads ──────────────────────────────────────────────────────────────

export enum IntentLabel {
  PURCHASE_INTENT = 'purchase_intent',
  PRICING_INQUIRY = 'pricing_inquiry',
  HIGH_VALUE_LEAD = 'high_value_lead',
  TRUST_CONCERN = 'trust_concern',
  FEATURE_CURIOSITY = 'feature_curiosity',
  SUPPORT_QUESTION = 'support_question',
  CASUAL_ENGAGEMENT = 'casual_engagement',
  SPAM_OR_LOW_QUALITY = 'spam_or_low_quality',
  COMPLAINT = 'complaint',
  GRATITUDE = 'gratitude',
  ABUSIVE_OR_HARMFUL = 'abusive_or_harmful',
  OFF_TOPIC = 'off_topic',
}

export interface HotLead {
  id: string;
  platform_user_id: string;
  platform_username: string | null;
  message_text: string;
  message_type: string;
  bot_reply: string | null;
  intent: {
    label: IntentLabel;
    confidence: number;
  };
  social_account_id: string;
  automation_id: string;
  created_at: string;
  // Deduplication extras
  message_count?: number;
  all_intents?: string[];
}

export interface HotLeadsResponse {
  data: HotLead[];
  total: number;
  page: number;
  limit: number;
}

export interface GetHotLeadsParams {
  intent?: string;
  limit?: number;
  page?: number;
}

// ─── Inbox / Thread ──────────────────────────────────────────────────────────

export interface ThreadMessage {
  id: string;
  platform_user_id: string;
  platform_username: string | null;
  message_text: string;
  message_type: string;
  bot_reply: string | null;
  decision_action: string;
  intent: {
    label: string;
    confidence: number;
  };
  social_account_id: string;
  automation_id: string;
  created_at: string;
}

export interface ThreadResponse {
  platform_user_id: string;
  messages: ThreadMessage[];
  total: number;
}
