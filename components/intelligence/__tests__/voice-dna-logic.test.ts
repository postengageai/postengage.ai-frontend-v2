import { describe, expect, it } from 'vitest';
import type {
  VoiceDna,
  VoiceDnaFingerprint,
  FewShotExample,
  NegativeExample,
  TriggerAutoInferDto,
  VoiceFeedbackDto,
  AdjustVoiceDto,
  GenerateSampleReplyDto,
  ContinuousLearningStats,
  VoiceReview,
} from '@/lib/types/voice-dna';

/**
 * Tests for Voice DNA type contracts and data transformation logic.
 * These verify the structure and constraints of the domain types
 * used across all Voice DNA components.
 */

const sampleFingerprint: VoiceDnaFingerprint = {
  language: {
    primary_language: 'en',
    code_switching: true,
    script: 'latin',
    formality_level: 0.4,
  },
  tone: {
    humor_level: 0.7,
    directness: 0.8,
    warmth: 0.6,
    assertiveness: 0.5,
  },
  style: {
    avg_sentence_length: 10,
    vocabulary_richness: 0.55,
    punctuation_style: 'minimal',
    capitalization_style: 'lowercase',
  },
  structural: {
    greeting_pattern: 'yo!',
    closing_pattern: 'later',
    paragraph_tendency: 'short',
    list_usage: false,
  },
  emoji: {
    frequency: 0.6,
    preferred_emojis: ['🔥', '💪', '🙌'],
    placement: 'inline',
  },
};

describe('VoiceDna types', () => {
  describe('VoiceDnaFingerprint', () => {
    it('has all required tone dimensions', () => {
      const { tone } = sampleFingerprint;
      expect(tone).toHaveProperty('humor_level');
      expect(tone).toHaveProperty('directness');
      expect(tone).toHaveProperty('warmth');
      expect(tone).toHaveProperty('assertiveness');
    });

    it('tone values are within 0-1 range', () => {
      const { tone } = sampleFingerprint;
      for (const [, value] of Object.entries(tone)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    });

    it('formality_level is within 0-1 range', () => {
      expect(sampleFingerprint.language.formality_level).toBeGreaterThanOrEqual(
        0
      );
      expect(sampleFingerprint.language.formality_level).toBeLessThanOrEqual(1);
    });

    it('emoji frequency is within 0-1 range', () => {
      expect(sampleFingerprint.emoji.frequency).toBeGreaterThanOrEqual(0);
      expect(sampleFingerprint.emoji.frequency).toBeLessThanOrEqual(1);
    });
  });

  describe('FewShotExample', () => {
    it('has required context and reply', () => {
      const example: FewShotExample = {
        context: 'User asks about return policy',
        reply: 'Hey! Yeah we do 30-day returns, no questions asked 🔥',
        tags: ['returns', 'policy'],
      };
      expect(example.context).toBeTruthy();
      expect(example.reply).toBeTruthy();
      expect(example.tags).toHaveLength(2);
    });

    it('tags are optional', () => {
      const example: FewShotExample = {
        context: 'General greeting',
        reply: 'Yo! What can I help with?',
      };
      expect(example.tags).toBeUndefined();
    });
  });

  describe('NegativeExample', () => {
    it('has required reply, reason, and added_at', () => {
      const example: NegativeExample = {
        reply: 'Dear valued customer, we appreciate your inquiry...',
        reason: 'Too formal, sounds corporate',
        tags: ['formal'],
        added_at: '2026-01-15T00:00:00Z',
      };
      expect(example.reply).toBeTruthy();
      expect(example.reason).toBeTruthy();
      expect(example.added_at).toBeTruthy();
    });
  });

  describe('VoiceDna status transitions', () => {
    it('valid statuses are correct set', () => {
      const validStatuses = [
        'pending',
        'analyzing',
        'ready',
        'failed',
      ] as const;
      const vdna: VoiceDna = {
        _id: 'test',
        brand_voice_id: 'bv-1',
        user_id: 'u-1',
        source: 'manual_samples',
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
      expect(validStatuses).toContain(vdna.status);
    });
  });
});

describe('Phase 5 DTO contracts', () => {
  describe('TriggerAutoInferDto', () => {
    it('requires bot_id and social_account_id', () => {
      const dto: TriggerAutoInferDto = {
        bot_id: 'bot-1',
        social_account_id: 'sa-1',
      };
      expect(dto.bot_id).toBeTruthy();
      expect(dto.social_account_id).toBeTruthy();
    });

    it('optional fields can be set', () => {
      const dto: TriggerAutoInferDto = {
        bot_id: 'bot-1',
        social_account_id: 'sa-1',
        brand_voice_id: 'bv-1',
        source: 'onboarding',
      };
      expect(dto.source).toBe('onboarding');
      expect(dto.brand_voice_id).toBe('bv-1');
    });

    it('source must be one of valid values', () => {
      const validSources = ['onboarding', 'manual_trigger', 'settings'];
      const dto: TriggerAutoInferDto = {
        bot_id: 'bot-1',
        social_account_id: 'sa-1',
        source: 'onboarding',
      };
      expect(validSources).toContain(dto.source);
    });
  });

  describe('VoiceFeedbackDto', () => {
    it('approve feedback requires minimal fields', () => {
      const dto: VoiceFeedbackDto = {
        voice_dna_id: 'vdna-1',
        bot_id: 'bot-1',
        feedback_type: 'approve',
        original_reply: 'Looks good!',
      };
      expect(dto.feedback_type).toBe('approve');
    });

    it('edit feedback includes edited_reply', () => {
      const dto: VoiceFeedbackDto = {
        voice_dna_id: 'vdna-1',
        bot_id: 'bot-1',
        feedback_type: 'edit',
        original_reply: 'Hey there!',
        edited_reply: 'Hey! How can I help?',
      };
      expect(dto.edited_reply).toBeTruthy();
    });

    it('reject feedback includes reason', () => {
      const dto: VoiceFeedbackDto = {
        voice_dna_id: 'vdna-1',
        bot_id: 'bot-1',
        feedback_type: 'reject',
        original_reply: 'Dear sir...',
        reason: 'Too formal',
      };
      expect(dto.reason).toBeTruthy();
    });
  });

  describe('AdjustVoiceDto', () => {
    it('can adjust tone only', () => {
      const dto: AdjustVoiceDto = {
        adjust_tone: { humor_level: 0.9, warmth: 0.8 },
      };
      expect(dto.adjust_tone?.humor_level).toBe(0.9);
      expect(dto.add_few_shot).toBeUndefined();
    });

    it('can add few-shot examples', () => {
      const dto: AdjustVoiceDto = {
        add_few_shot: [
          { context: 'test', reply: 'yo test!' },
          { context: 'hello', reply: 'hey there!', tags: ['greeting'] },
        ],
      };
      expect(dto.add_few_shot).toHaveLength(2);
    });

    it('can combine multiple adjustments', () => {
      const dto: AdjustVoiceDto = {
        adjust_tone: { directness: 0.9 },
        add_few_shot: [{ context: 'q', reply: 'a' }],
        add_negative: [{ reply: 'bad', reason: 'too long' }],
        trigger_reanalysis: true,
      };
      expect(dto.trigger_reanalysis).toBe(true);
      expect(dto.add_few_shot).toHaveLength(1);
      expect(dto.add_negative).toHaveLength(1);
    });

    it('can remove examples by index', () => {
      const dto: AdjustVoiceDto = {
        remove_few_shot_indices: [0, 2],
        remove_negative_indices: [1],
      };
      expect(dto.remove_few_shot_indices).toEqual([0, 2]);
    });
  });

  describe('GenerateSampleReplyDto', () => {
    it('requires voice_dna_id and user_message', () => {
      const dto: GenerateSampleReplyDto = {
        voice_dna_id: 'vdna-1',
        user_message: 'How much does this cost?',
      };
      expect(dto.voice_dna_id).toBeTruthy();
      expect(dto.user_message).toBeTruthy();
    });
  });

  describe('ContinuousLearningStats', () => {
    it('feedback breakdown adds up to total', () => {
      const stats: ContinuousLearningStats = {
        voice_dna_id: 'vdna-1',
        total_feedback_processed: 50,
        feedback_breakdown: { approved: 30, edited: 15, rejected: 5 },
        few_shot_examples_count: 10,
        negative_examples_count: 3,
        auto_refinement_count: 2,
        last_refinement_at: '2026-01-15',
        next_refinement_at_signals: 8,
        learning_velocity: 'fast',
      };
      const sum =
        stats.feedback_breakdown.approved +
        stats.feedback_breakdown.edited +
        stats.feedback_breakdown.rejected;
      expect(sum).toBe(stats.total_feedback_processed);
    });

    it('learning velocity is one of valid values', () => {
      const validVelocities = ['fast', 'moderate', 'slow'];
      const stats: ContinuousLearningStats = {
        voice_dna_id: 'vdna-1',
        total_feedback_processed: 10,
        feedback_breakdown: { approved: 5, edited: 3, rejected: 2 },
        few_shot_examples_count: 5,
        negative_examples_count: 1,
        auto_refinement_count: 0,
        next_refinement_at_signals: 10,
        learning_velocity: 'moderate',
      };
      expect(validVelocities).toContain(stats.learning_velocity);
    });
  });

  describe('VoiceReview', () => {
    it('has all summary fields', () => {
      const review: VoiceReview = {
        voice_dna: {
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
        },
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

      expect(review.summary.language_description).toBeTruthy();
      expect(review.summary.tone_description).toBeTruthy();
      expect(review.summary.style_description).toBeTruthy();
      expect(review.summary.emoji_description).toBeTruthy();
      expect(review.summary.overall).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(review.confidence_level);
    });
  });
});
