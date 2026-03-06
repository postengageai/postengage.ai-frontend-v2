import { describe, expect, it } from 'vitest';
import type {
  VoiceDna,
  VoiceDnaFingerprint,
  FewShotExample,
  NegativeExample,
  TriggerAutoInferDto,
  VoiceFeedbackDto,
  AdjustVoiceDto,
  VoiceReview,
} from '@/lib/types/voice-dna';

/**
 * Tests for Voice DNA type contracts and data transformation logic.
 * These verify the structure and constraints of the domain types
 * used across all Voice DNA components.
 */

// Flat fingerprint structure matching the backend schema
const sampleFingerprint: VoiceDnaFingerprint = {
  avg_sentence_length: 10,
  vocabulary_complexity: 'simple',
  emoji_patterns: ['🔥', '💪', '🙌'],
  emoji_frequency: 0.6,
  punctuation_style: {
    uses_exclamation: true,
    uses_ellipsis: false,
    uses_caps_for_emphasis: false,
  },
  primary_language: 'en',
  code_switching_frequency: 0.4,
  slang_patterns: ['yo', 'bro'],
  filler_words: [],
  humor_level: 0.7,
  directness: 0.8,
  warmth: 0.6,
  assertiveness: 0.5,
  starts_with_patterns: ['yo!'],
  ends_with_patterns: ['later'],
  question_response_style: 'direct_answer',
};

describe('VoiceDna types', () => {
  describe('VoiceDnaFingerprint', () => {
    it('has all required tone dimensions', () => {
      expect(sampleFingerprint).toHaveProperty('humor_level');
      expect(sampleFingerprint).toHaveProperty('directness');
      expect(sampleFingerprint).toHaveProperty('warmth');
      expect(sampleFingerprint).toHaveProperty('assertiveness');
    });

    it('tone values are within 0-1 range', () => {
      const { humor_level, directness, warmth, assertiveness } =
        sampleFingerprint;
      for (const value of [humor_level, directness, warmth, assertiveness]) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    });

    it('code_switching_frequency is within 0-1 range', () => {
      expect(sampleFingerprint.code_switching_frequency).toBeGreaterThanOrEqual(
        0
      );
      expect(sampleFingerprint.code_switching_frequency).toBeLessThanOrEqual(1);
    });

    it('emoji frequency is within 0-1 range', () => {
      expect(sampleFingerprint.emoji_frequency).toBeGreaterThanOrEqual(0);
      expect(sampleFingerprint.emoji_frequency).toBeLessThanOrEqual(1);
    });

    it('punctuation_style has boolean flags', () => {
      expect(typeof sampleFingerprint.punctuation_style.uses_exclamation).toBe(
        'boolean'
      );
      expect(typeof sampleFingerprint.punctuation_style.uses_ellipsis).toBe(
        'boolean'
      );
      expect(
        typeof sampleFingerprint.punctuation_style.uses_caps_for_emphasis
      ).toBe('boolean');
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

    it('tags can be empty array', () => {
      const example: FewShotExample = {
        context: 'General greeting',
        reply: 'Yo! What can I help with?',
        tags: [],
      };
      expect(example.tags).toHaveLength(0);
    });
  });

  describe('NegativeExample', () => {
    it('has required reply and context (reason why reply is bad)', () => {
      const example: NegativeExample = {
        reply: 'Dear valued customer, we appreciate your inquiry...',
        context: 'Too formal, sounds corporate',
        tags: ['formal'],
      };
      expect(example.reply).toBeTruthy();
      expect(example.context).toBeTruthy();
    });

    it('uses context field (not reason) for explanation', () => {
      const example: NegativeExample = {
        reply: 'I am unable to assist with that request.',
        context: 'Too robotic, avoid corporate-speak',
        tags: [],
      };
      expect(example.context).toBeTruthy();
      expect((example as Record<string, unknown>).reason).toBeUndefined();
    });
  });

  describe('VoiceDna status transitions', () => {
    it('valid statuses are correct set', () => {
      const validStatuses = [
        'pending',
        'analyzing',
        'ready',
        'failed',
        'stale',
      ] as const;
      const vdna: VoiceDna = {
        _id: 'test',
        brand_voice_id: 'bv-1',
        user_id: 'u-1',
        source: 'user_configured',
        status: 'ready',
        fingerprint: sampleFingerprint,
        few_shot_examples: [],
        negative_examples: [],
        raw_samples: [],
        samples_analyzed: 0,
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
    it('requires only bot_id', () => {
      const dto: TriggerAutoInferDto = {
        bot_id: 'bot-1',
      };
      expect(dto.bot_id).toBeTruthy();
    });

    it('brand_voice_id is optional', () => {
      const dto: TriggerAutoInferDto = {
        bot_id: 'bot-1',
        brand_voice_id: 'bv-1',
      };
      expect(dto.brand_voice_id).toBe('bv-1');
    });

    it('does not include social_account_id or source fields', () => {
      const dto: TriggerAutoInferDto = { bot_id: 'bot-1' };
      expect(
        (dto as Record<string, unknown>).social_account_id
      ).toBeUndefined();
      expect((dto as Record<string, unknown>).source).toBeUndefined();
    });
  });

  describe('VoiceFeedbackDto', () => {
    it('approved feedback requires core fields', () => {
      const dto: VoiceFeedbackDto = {
        voice_dna_id: 'vdna-1',
        log_id: 'log-1',
        feedback_status: 'approved',
        original_text: 'Looks good!',
        context_text: 'User asked about pricing',
      };
      expect(dto.feedback_status).toBe('approved');
      expect(dto.voice_dna_id).toBeTruthy();
      expect(dto.log_id).toBeTruthy();
    });

    it('edited feedback includes edited_text', () => {
      const dto: VoiceFeedbackDto = {
        voice_dna_id: 'vdna-1',
        log_id: 'log-2',
        feedback_status: 'edited',
        original_text: 'Hey there!',
        context_text: 'General greeting',
        edited_text: 'Hey! How can I help?',
      };
      expect(dto.edited_text).toBeTruthy();
    });

    it('rejected feedback uses feedback_status rejected', () => {
      const dto: VoiceFeedbackDto = {
        voice_dna_id: 'vdna-1',
        log_id: 'log-3',
        feedback_status: 'rejected',
        original_text: 'Dear sir...',
        context_text: 'Formal reply context',
      };
      expect(dto.feedback_status).toBe('rejected');
    });

    it('feedback_status is one of approved | edited | rejected', () => {
      const validStatuses = ['approved', 'edited', 'rejected'];
      const dto: VoiceFeedbackDto = {
        voice_dna_id: 'vdna-1',
        log_id: 'log-1',
        feedback_status: 'approved',
        original_text: 'ok',
        context_text: 'context',
      };
      expect(validStatuses).toContain(dto.feedback_status);
    });
  });

  describe('AdjustVoiceDto', () => {
    it('can add few-shot examples as JSON strings', () => {
      const dto: AdjustVoiceDto = {
        add_few_shot_examples: [
          JSON.stringify({ context: 'test', reply: 'yo test!' }),
          JSON.stringify({
            context: 'hello',
            reply: 'hey there!',
            tags: ['greeting'],
          }),
        ],
      };
      expect(dto.add_few_shot_examples).toHaveLength(2);
      expect(typeof dto.add_few_shot_examples![0]).toBe('string');
    });

    it('can add negative examples as JSON strings', () => {
      const dto: AdjustVoiceDto = {
        add_negative_examples: [
          JSON.stringify({
            context: 'too corporate',
            reply: 'Dear valued customer...',
          }),
        ],
      };
      expect(dto.add_negative_examples).toHaveLength(1);
    });

    it('can trigger reanalysis', () => {
      const dto: AdjustVoiceDto = {
        trigger_reanalysis: true,
      };
      expect(dto.trigger_reanalysis).toBe(true);
    });

    it('can combine multiple adjustments', () => {
      const dto: AdjustVoiceDto = {
        add_few_shot_examples: [JSON.stringify({ context: 'q', reply: 'a' })],
        add_negative_examples: [
          JSON.stringify({ context: 'bad style', reply: 'bad reply' }),
        ],
        trigger_reanalysis: true,
      };
      expect(dto.trigger_reanalysis).toBe(true);
      expect(dto.add_few_shot_examples).toHaveLength(1);
      expect(dto.add_negative_examples).toHaveLength(1);
    });

    it('can remove few-shot examples by string indices', () => {
      const dto: AdjustVoiceDto = {
        remove_few_shot_indices: ['0', '2'],
      };
      expect(dto.remove_few_shot_indices).toEqual(['0', '2']);
    });

    it('does not support adjust_tone field', () => {
      const dto: AdjustVoiceDto = { trigger_reanalysis: false };
      expect((dto as Record<string, unknown>).adjust_tone).toBeUndefined();
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
          samples_analyzed: 5,
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

      expect(review.summary!.language_description).toBeTruthy();
      expect(review.summary!.tone_description).toBeTruthy();
      expect(review.summary!.style_description).toBeTruthy();
      expect(review.summary!.emoji_description).toBeTruthy();
      expect(review.summary!.overall).toBeTruthy();
      expect(['high', 'medium', 'low']).toContain(review.confidence_level);
    });

    it('supports flattened structure with voice_summary', () => {
      const review: VoiceReview = {
        voice_dna_id: 'vdna-1',
        status: 'ready',
        source: 'auto_inferred',
        voice_summary: {
          language: 'English with Hinglish',
          tone: 'Warm and direct',
          style: 'Casual, punchy',
          emoji_usage: 'Frequent',
        },
        confidence_level: 'medium',
      };
      expect(review.voice_summary!.language).toBeTruthy();
      expect(review.confidence_level).toBe('medium');
    });
  });
});
