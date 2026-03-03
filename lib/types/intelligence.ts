export type BotStatus = 'active' | 'inactive' | 'training';

export interface BotBehaviorDto {
  response_style: string;
  tone: string;
  language: string;
  max_response_length: number;
  cta_aggressiveness: 'LOW' | 'MODERATE' | 'HIGH';
  custom_instructions?: string;
}

export interface BrandVoice {
  name: string;
  tone: string;
  values: string[];
  guidelines: string;
}

export interface KnowledgeSource {
  id: string;
  source_type: 'url' | 'text' | 'document';
  content: string;
  title?: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  created_at: string;
}

export interface Bot {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  platform: string;
  social_account_id: string;
  status: BotStatus;
  behavior: BotBehaviorDto;
  brand_voice?: BrandVoice;
  knowledge_sources: KnowledgeSource[];
  voice_dna_id?: string;
  quality_score?: number;
  total_interactions: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBotDto {
  name: string;
  description?: string;
  platform: string;
  social_account_id: string;
  behavior?: Partial<BotBehaviorDto>;
  brand_voice?: Partial<BrandVoice>;
}

export interface UpdateBotDto {
  name?: string;
  description?: string;
  status?: BotStatus;
  behavior?: Partial<BotBehaviorDto>;
  brand_voice?: Partial<BrandVoice>;
}

export interface VoiceDNA {
  id: string;
  bot_id: string;
  style_profile: Record<string, unknown>;
  few_shot_examples: Array<{ input: string; output: string }>;
  negative_examples: Array<{
    input: string;
    bad_output: string;
    reason: string;
  }>;
  refinement_count: number;
  last_refined_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MemoryEntry {
  id: string;
  bot_id: string;
  key: string;
  value: string;
  category?: string;
  created_at: string;
  updated_at: string;
}
