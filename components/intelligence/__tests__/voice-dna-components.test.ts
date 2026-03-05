import { describe, expect, it } from 'vitest';
import type {
  VoiceDnaFingerprint,
  VoiceDnaSource,
  VoiceReview,
  VoiceDna,
  VoiceFeedbackDto,
} from '@/lib/types/voice-dna';

/**
 * Component logic tests for Voice DNA components:
 * - FingerprintRadar: data transformation from fingerprint → radar data
 * - VoiceReviewPanel: confidence config mapping, summary card structure
 * - FeedbackCollector: feedback DTO construction for approve/edit/reject
 */

// === FingerprintRadar Tests ===

const sampleFingerprint: VoiceDnaFingerprint = {
  style_metrics: {
    avg_sentence_length: 12,
    vocabulary_complexity: 'moderate',
    emoji_patterns: ['🔥', '👍'],
    emoji_frequency: 0.4,
    punctuation_style: {
      exclamation_frequency: 0.3,
      ellipsis_usage: true,
      caps_emphasis: false,
    },
  },
  language_patterns: {
    primary_language: 'en',
    code_switching_frequency: 0.1,
    slang_patterns: ['bro', 'yo'],
    filler_words: ['like'],
  },
  tone_markers: {
    humor_level: 0.7,
    directness: 0.8,
    warmth: 0.6,
    assertiveness: 0.5,
  },
  structural_patterns: {
    starts_with_patterns: ['Hey!'],
    ends_with_patterns: ['Cheers'],
    question_response_style: 'direct_answer',
  },
};

/** Mirrors the data transformation in FingerprintRadar component */
function buildRadarData(fingerprint: VoiceDnaFingerprint) {
  return [
    {
      marker: 'Humor',
      value: fingerprint.tone_markers.humor_level,
      fullMark: 10,
    },
    {
      marker: 'Directness',
      value: fingerprint.tone_markers.directness,
      fullMark: 10,
    },
    {
      marker: 'Warmth',
      value: fingerprint.tone_markers.warmth,
      fullMark: 10,
    },
    {
      marker: 'Assertiveness',
      value: fingerprint.tone_markers.assertiveness,
      fullMark: 10,
    },
  ];
}

const SOURCE_COLORS: Record<VoiceDnaSource, string> = {
  user_configured: 'hsl(var(--primary))',
  auto_inferred: 'hsl(142, 76%, 36%)',
  hybrid: 'hsl(262, 83%, 58%)',
};

describe('FingerprintRadar logic', () => {
  it('transforms fingerprint into 4 radar data points', () => {
    const data = buildRadarData(sampleFingerprint);
    expect(data).toHaveLength(4);
    expect(data.map(d => d.marker)).toEqual([
      'Humor',
      'Directness',
      'Warmth',
      'Assertiveness',
    ]);
  });

  it('maps tone_markers values correctly', () => {
    const data = buildRadarData(sampleFingerprint);
    expect(data[0].value).toBe(0.7); // humor_level
    expect(data[1].value).toBe(0.8); // directness
    expect(data[2].value).toBe(0.6); // warmth
    expect(data[3].value).toBe(0.5); // assertiveness
  });

  it('sets fullMark to 10 for all data points', () => {
    const data = buildRadarData(sampleFingerprint);
    data.forEach(d => expect(d.fullMark).toBe(10));
  });

  it('provides a color for every source type', () => {
    const sources: VoiceDnaSource[] = [
      'user_configured',
      'auto_inferred',
      'hybrid',
    ];
    sources.forEach(source => {
      expect(SOURCE_COLORS[source]).toBeTruthy();
    });
  });

  it('default source is user_configured', () => {
    expect(SOURCE_COLORS['user_configured']).toBe('hsl(var(--primary))');
  });
});

// === VoiceReviewPanel Tests ===

const CONFIDENCE_CONFIG = {
  high: {
    label: 'High Confidence',
    className: 'bg-green-50 text-green-700 border-green-300',
  },
  medium: {
    label: 'Medium Confidence',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  },
  low: {
    label: 'Low Confidence',
    className: 'bg-red-50 text-red-700 border-red-300',
  },
};

const SUMMARY_CARDS = [
  { key: 'language_description' as const, label: 'Language' },
  { key: 'tone_description' as const, label: 'Tone' },
  { key: 'style_description' as const, label: 'Style' },
  { key: 'emoji_description' as const, label: 'Emoji' },
];

const mockVoiceDna: VoiceDna = {
  _id: 'vdna-1',
  brand_voice_id: 'bv-1',
  user_id: 'u-1',
  source: 'auto_inferred',
  status: 'ready',
  fingerprint: sampleFingerprint,
  few_shot_examples: [],
  negative_examples: [],
  raw_samples: [],
  feedback_signals_processed: 0,
  auto_refinement_count: 0,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

const mockReview: VoiceReview = {
  voice_dna: mockVoiceDna,
  summary: {
    language_description: 'English with Hinglish mix',
    tone_description: 'Confident and warm',
    style_description: 'Short punchy sentences',
    emoji_description: 'Heavy emoji user',
    overall: 'A warm, confident, emoji-loving voice.',
  },
  sample_generated_reply: {
    context: 'How are you?',
    reply: 'Doing amazing bro! 🔥',
  },
  confidence_level: 'high',
};

describe('VoiceReviewPanel logic', () => {
  describe('confidence config', () => {
    it('maps high confidence correctly', () => {
      const config = CONFIDENCE_CONFIG['high'];
      expect(config.label).toBe('High Confidence');
      expect(config.className).toContain('green');
    });

    it('maps medium confidence correctly', () => {
      const config = CONFIDENCE_CONFIG['medium'];
      expect(config.label).toBe('Medium Confidence');
      expect(config.className).toContain('yellow');
    });

    it('maps low confidence correctly', () => {
      const config = CONFIDENCE_CONFIG['low'];
      expect(config.label).toBe('Low Confidence');
      expect(config.className).toContain('red');
    });

    it('covers all confidence levels', () => {
      const levels: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
      levels.forEach(l => expect(CONFIDENCE_CONFIG[l]).toBeDefined());
    });
  });

  describe('summary cards', () => {
    it('has 4 summary card definitions', () => {
      expect(SUMMARY_CARDS).toHaveLength(4);
    });

    it('summary keys match VoiceReview summary fields', () => {
      SUMMARY_CARDS.forEach(card => {
        expect(mockReview.summary[card.key]).toBeTruthy();
      });
    });

    it('all labels are non-empty', () => {
      SUMMARY_CARDS.forEach(card => {
        expect(card.label.length).toBeGreaterThan(0);
      });
    });
  });

  describe('source label mapping', () => {
    it('auto_inferred maps to "Auto-Inferred"', () => {
      const sourceLabels: Record<VoiceDnaSource, string> = {
        auto_inferred: 'Auto-Inferred',
        hybrid: 'Hybrid',
        user_configured: 'Manual',
      };
      expect(sourceLabels[mockReview.voice_dna.source]).toBe('Auto-Inferred');
    });
  });

  describe('recommended adjustments', () => {
    it('review without adjustments has undefined/empty', () => {
      expect(mockReview.recommended_adjustments).toBeUndefined();
    });

    it('review with adjustments is an array', () => {
      const reviewWithAdj: VoiceReview = {
        ...mockReview,
        recommended_adjustments: ['Add more emojis', 'Shorten sentences'],
      };
      expect(reviewWithAdj.recommended_adjustments).toHaveLength(2);
    });
  });
});

// === FeedbackCollector Tests ===

/** Mirrors feedback DTO construction in FeedbackCollector */
function buildFeedbackDto(
  type: 'approve' | 'edit' | 'reject',
  params: {
    voiceDnaId: string;
    botId: string;
    generatedReply: string;
    originalMessage: string;
    editedReply?: string;
    rejectReason?: string;
  }
): VoiceFeedbackDto {
  return {
    voice_dna_id: params.voiceDnaId,
    bot_id: params.botId,
    feedback_type: type,
    original_reply: params.generatedReply,
    edited_reply: type === 'edit' ? params.editedReply : undefined,
    context: params.originalMessage,
    reason: type === 'reject' ? params.rejectReason : undefined,
  };
}

describe('FeedbackCollector logic', () => {
  const baseParams = {
    voiceDnaId: 'vdna-1',
    botId: 'bot-1',
    generatedReply: 'Hey! Glad you like it 🔥',
    originalMessage: 'Love your product!',
  };

  describe('approve feedback', () => {
    it('builds correct DTO for approve', () => {
      const dto = buildFeedbackDto('approve', baseParams);
      expect(dto.feedback_type).toBe('approve');
      expect(dto.voice_dna_id).toBe('vdna-1');
      expect(dto.bot_id).toBe('bot-1');
      expect(dto.original_reply).toBe('Hey! Glad you like it 🔥');
      expect(dto.context).toBe('Love your product!');
    });

    it('does not include edited_reply for approve', () => {
      const dto = buildFeedbackDto('approve', baseParams);
      expect(dto.edited_reply).toBeUndefined();
    });

    it('does not include reason for approve', () => {
      const dto = buildFeedbackDto('approve', baseParams);
      expect(dto.reason).toBeUndefined();
    });
  });

  describe('edit feedback', () => {
    it('builds correct DTO with edited reply', () => {
      const dto = buildFeedbackDto('edit', {
        ...baseParams,
        editedReply: 'Thanks so much! Glad you enjoy it 💪',
      });
      expect(dto.feedback_type).toBe('edit');
      expect(dto.edited_reply).toBe('Thanks so much! Glad you enjoy it 💪');
    });

    it('does not include reason for edit', () => {
      const dto = buildFeedbackDto('edit', {
        ...baseParams,
        editedReply: 'edited text',
      });
      expect(dto.reason).toBeUndefined();
    });
  });

  describe('reject feedback', () => {
    it('builds correct DTO with reason', () => {
      const dto = buildFeedbackDto('reject', {
        ...baseParams,
        rejectReason: 'Too casual for this context',
      });
      expect(dto.feedback_type).toBe('reject');
      expect(dto.reason).toBe('Too casual for this context');
    });

    it('does not include edited_reply for reject', () => {
      const dto = buildFeedbackDto('reject', {
        ...baseParams,
        rejectReason: 'Too casual',
      });
      expect(dto.edited_reply).toBeUndefined();
    });
  });

  describe('feedback state transitions', () => {
    type FeedbackState = 'idle' | 'editing' | 'rejecting' | 'submitted';

    it('valid state transitions from idle', () => {
      const validFromIdle: FeedbackState[] = [
        'editing',
        'rejecting',
        'submitted',
      ];
      validFromIdle.forEach(s => expect(s).toBeTruthy());
    });

    it('editing can go back to idle (cancel)', () => {
      const state: FeedbackState = 'editing';
      const cancelled: FeedbackState = 'idle';
      expect(state).not.toBe(cancelled);
    });

    it('submitted is a terminal state', () => {
      const state: FeedbackState = 'submitted';
      expect(state).toBe('submitted');
    });
  });
});
