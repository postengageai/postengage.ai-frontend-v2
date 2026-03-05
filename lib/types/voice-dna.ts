// === Enums ===
export type VoiceDnaStatus =
  | 'pending'
  | 'analyzing'
  | 'ready'
  | 'failed'
  | 'stale';
export type VoiceDnaSource = 'user_configured' | 'auto_inferred' | 'hybrid';

// === Core Fingerprint ===
export interface VoiceDnaFingerprint {
  style_metrics: {
    avg_sentence_length: number;
    vocabulary_complexity: 'simple' | 'moderate' | 'advanced';
    emoji_patterns: string[];
    emoji_frequency: number;
    punctuation_style: {
      exclamation_frequency: number;
      ellipsis_usage: boolean;
      caps_emphasis: boolean;
    };
  };
  language_patterns: {
    primary_language: string;
    code_switching_frequency: number;
    slang_patterns: string[];
    filler_words: string[];
  };
  tone_markers: {
    humor_level: number;
    directness: number;
    warmth: number;
    assertiveness: number;
  };
  structural_patterns: {
    starts_with_patterns: string[];
    ends_with_patterns: string[];
    question_response_style:
      | 'direct_answer'
      | 'answer_then_elaborate'
      | 'story_then_answer';
  };
}

// === Few-Shot Example ===
export interface FewShotExample {
  context: string;
  reply: string;
  tags: string[];
  source: 'creator_manual' | 'creator_edited' | 'ai_approved' | 'curated';
  added_at: string;
}

// === Negative Example ===
export interface NegativeExample {
  reply: string;
  reason: string;
  tags: string[];
  added_at: string;
}

// === Main Voice DNA Document ===
export interface VoiceDna {
  _id: string;
  user_id: string;
  brand_voice_id: string;
  status: VoiceDnaStatus;
  source: VoiceDnaSource;
  fingerprint: VoiceDnaFingerprint | null;
  raw_samples: { text: string; source: string; timestamp?: string }[];
  few_shot_examples: FewShotExample[];
  negative_examples: NegativeExample[];
  feedback_signals_processed: number;
  auto_refinement_count: number;
  analysis_error?: string;
  created_at: string;
  updated_at: string;
}

// === API DTOs ===
export interface CreateVoiceDnaDto {
  brand_voice_id: string;
  raw_samples: { text: string; source: string }[];
}

export interface AddFewShotDto {
  context: string;
  reply: string;
  tags?: string[];
}

export interface AddNegativeExampleDto {
  reply: string;
  reason: string;
  tags?: string[];
}

// === Auto-Inference (Phase 5) ===
export interface TriggerAutoInferDto {
  bot_id: string;
  social_account_id: string;
  brand_voice_id?: string;
  source?: 'onboarding' | 'manual_trigger' | 'settings';
}

export interface AutoInferResult {
  voice_dna_id: string;
  status: 'queued' | 'analyzing' | 'ready' | 'failed';
  estimated_time_seconds?: number;
  samples_found: {
    instagram_posts: number;
    manual_replies: number;
    total: number;
  };
}

// === Voice Review ===
export interface VoiceReview {
  voice_dna: VoiceDna;
  summary: {
    language_description: string;
    tone_description: string;
    style_description: string;
    emoji_description: string;
    overall: string;
  };
  sample_generated_reply: {
    context: string;
    reply: string;
  };
  confidence_level: 'high' | 'medium' | 'low';
  recommended_adjustments?: string[];
}

// === Voice Feedback ===
export interface VoiceFeedbackDto {
  voice_dna_id: string;
  bot_id: string;
  feedback_type: 'approve' | 'edit' | 'reject';
  original_reply?: string;
  edited_reply?: string;
  context?: string;
  reason?: string;
}

// === Voice Adjustment ===
export interface AdjustVoiceDto {
  add_few_shot?: { context: string; reply: string; tags?: string[] }[];
  remove_few_shot_indices?: number[];
  add_negative?: { reply: string; reason: string }[];
  remove_negative_indices?: number[];
  adjust_tone?: Partial<{
    humor_level: number;
    directness: number;
    warmth: number;
    assertiveness: number;
  }>;
  trigger_reanalysis?: boolean;
}

// === Continuous Learning Stats ===
export interface ContinuousLearningStats {
  voice_dna_id: string;
  total_feedback_processed: number;
  feedback_breakdown: {
    approved: number;
    edited: number;
    rejected: number;
  };
  few_shot_examples_count: number;
  negative_examples_count: number;
  auto_refinement_count: number;
  last_refinement_at?: string;
  next_refinement_at_signals: number;
  learning_velocity: 'fast' | 'moderate' | 'slow';
}

// === Sample Reply Generation ===
export interface GenerateSampleReplyDto {
  voice_dna_id: string;
  user_message: string;
}

export interface SampleReplyResult {
  user_message: string;
  generated_reply: string;
  confidence: number;
}
