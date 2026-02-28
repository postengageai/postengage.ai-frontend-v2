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
