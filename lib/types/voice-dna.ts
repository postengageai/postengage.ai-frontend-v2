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
  // Style metrics
  avg_sentence_length: number;
  vocabulary_complexity: 'simple' | 'moderate' | 'advanced';
  emoji_patterns: string[];
  emoji_frequency: number;
  punctuation_style: {
    uses_exclamation: boolean;
    uses_ellipsis: boolean;
    uses_caps_for_emphasis: boolean;
  };

  // Language patterns
  primary_language: string;
  code_switching_frequency: number;
  slang_patterns: string[];
  filler_words: string[];

  // Tone markers
  humor_level: number;
  directness: number;
  warmth: number;
  assertiveness: number;

  // Structural patterns
  starts_with_patterns: string[];
  ends_with_patterns: string[];
  question_response_style:
    | 'direct_answer'
    | 'question_then_answer'
    | 'story_then_answer';
}

// === Few-Shot Example ===
export interface FewShotExample {
  context: string;
  reply: string;
  tags: string[];
}

// === Negative Example ===
// Backend uses the same DTO (AddFewShotExampleDto) for negative examples.
// 'context' holds the reason why this reply style should be avoided.
export interface NegativeExample {
  context: string;
  reply: string;
  tags: string[];
}

// === Main Voice DNA Document ===
export interface VoiceDna {
  _id: string;
  user_id: string;
  brand_voice_id: string;
  status: VoiceDnaStatus;
  source: VoiceDnaSource;
  fingerprint: VoiceDnaFingerprint | null;
  raw_samples: {
    text: string;
    source: string;
    timestamp?: string;
    _id?: string;
  }[];
  few_shot_examples: FewShotExample[];
  negative_examples: NegativeExample[];
  samples_analyzed: number;
  analysis_model?: string;
  last_analyzed_at?: string;
  analysis_error?: string;
  confidence_score?: number;
  confidence_level?: 'high' | 'medium' | 'low';
  feedback_signals_processed: number;
  auto_refinement_count: number;
  last_feedback_at?: string;
  /**
   * Learning mode toggle. Default: true.
   * When false, no new data is ingested, fingerprint is frozen.
   */
  learning_mode_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

// === API DTOs ===
export interface CreateVoiceDnaDto {
  brand_voice_id: string;
  raw_samples: { text: string; source: string }[];
  source?: string; // 'user_configured' | 'hybrid' — backend accepts this
}

// Used for adding few-shot examples
export interface AddFewShotDto {
  context: string;
  reply: string;
  tags?: string[];
}

// Negative examples use the same backend DTO as few-shot (AddFewShotExampleDto).
// 'context' = why this reply should be avoided, 'reply' = the bad reply text.
export interface AddNegativeExampleDto {
  context: string;
  reply: string;
  tags?: string[];
}

// === Auto-Inference ===
// Backend TriggerAutoInferDto only accepts bot_id and optional brand_voice_id.
export interface TriggerAutoInferDto {
  bot_id: string;
  brand_voice_id?: string;
}

// Matches backend AutoInferResult from auto-voice-inference.service.ts exactly.
// status 'queued'               → analysis job queued, voice_dna_id is set
// status 'insufficient_samples' → not enough samples found, voice_dna_id is undefined
// status 'already_exists'       → ready Voice DNA already exists, voice_dna_id is set
// status 'error'                → unexpected error
export interface AutoInferResult {
  success: boolean;
  voice_dna_id?: string; // only set when status='queued' or 'already_exists'
  samples_collected: number; // total samples found (captions + replies)
  caption_samples: number; // samples from Instagram post captions
  reply_samples: number; // samples from manual replies in intelligence logs
  status: 'queued' | 'insufficient_samples' | 'already_exists' | 'error';
  message: string;
}

// === Voice Review ===
export interface VoiceReview {
  // Legacy nested structure (deprecated)
  voice_dna?: VoiceDna;
  summary?: {
    language_description: string;
    tone_description: string;
    style_description: string;
    emoji_description: string;
    overall: string;
  };
  sample_generated_reply?: {
    context: string;
    reply: string;
  };
  confidence_level?: 'high' | 'medium' | 'low';
  recommended_adjustments?: string[];

  // New flattened structure (active)
  voice_dna_id?: string;
  status?: VoiceDnaStatus;
  source?: VoiceDnaSource;
  fingerprint?: VoiceDnaFingerprint;
  voice_summary?: {
    language: string;
    tone: string;
    style: string;
    emoji_usage: string;
  };
}

// === Voice Feedback ===
// Matches backend VoiceFeedbackDto exactly.
export interface VoiceFeedbackDto {
  voice_dna_id: string;
  log_id: string;
  feedback_status: 'approved' | 'edited' | 'rejected';
  original_text: string;
  context_text: string;
  edited_text?: string;
}

// === Voice Adjustment ===
// Matches backend AdjustVoiceDto exactly.
// Few-shot and negative examples are serialized as JSON strings.
// Note: tone adjustment is not supported by the backend.
export interface AdjustVoiceDto {
  add_few_shot_examples?: string[];
  remove_few_shot_indices?: string[];
  add_negative_examples?: string[];
  trigger_reanalysis?: boolean;
}

// === V2: Metrics (Feature 9) ===
// Matches backend VoiceDnaMetrics exactly.
// Returned by GET /voice-dna/:id/metrics
export interface VoiceDnaMetrics {
  voice_quality_score: number; // 0–100
  voice_consistency_score: number; // decimal, e.g. 0.85
  confidence_level: 'low' | 'medium' | 'high';
  total_training_samples: number;
  total_feedback_signals: number;
  high_quality_examples: number;
  examples_in_pool: number;
  last_analyzed_at: string | null; // ISO string from backend
  daily_refresh_count: number;
  drift_status: string; // 'healthy' | 'significant_drift'
  primary_language: string;
  /** Whether the learning loop is currently active */
  learning_mode_enabled: boolean;
}

// === V2: Timeline (Feature 10) ===
// One entry per day in the Voice Learning Graph.
export interface TimelineSnapshot {
  date: string; // YYYY-MM-DD
  voice_quality_score: number;
  voice_consistency_score: number;
  examples_in_pool: number;
  high_quality_examples: number;
  feedback_signals_today: number;
  events: string[]; // humanized event strings
}

// A marked milestone on the timeline chart (e.g. first analysis, drift alert).
export interface ChartMilestone {
  date: string; // YYYY-MM-DD
  label: string | undefined;
  type: string | undefined;
}

// Full response from GET /voice-dna/:id/timeline
export interface VoiceDnaTimelineResponse {
  voice_dna_id: string;
  period_days: number;
  current: VoiceDnaMetrics;
  timeline: TimelineSnapshot[];
  milestones: ChartMilestone[];
  insight: string;
}

// === V2: Manual Settings Update (Feature 8) ===
// Matches backend UpdateVoiceDnaDto.
// Sent via PATCH /voice-dna/:id/settings
export interface VoiceDnaCustomExampleDto {
  context: string; // min 10, max 500 chars
  reply: string; // min 5, max 500 chars
}

export interface UpdateVoiceDnaDto {
  // Tone sliders — 1–5 scale (backend maps to 0–10 internally)
  humor_level?: number;
  warmth?: number;
  directness?: number;
  assertiveness?: number;
  emoji_intensity?: number;
  // Language & vocabulary
  vocabulary_complexity?: 'simple' | 'moderate' | 'advanced';
  primary_language?: string;
  // Sample injection
  new_sample?: string;
  custom_examples?: VoiceDnaCustomExampleDto[];
  custom_negatives?: string[];
  // Learning mode
  learning_mode_enabled?: boolean;
}
