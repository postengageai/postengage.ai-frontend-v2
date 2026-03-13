import { describe, expect, it, vi, beforeEach } from 'vitest';
import { VoiceDnaApi } from '../voice-dna';
import type { SuccessResponse } from '../../http/client';
import type {
  VoiceDna,
  AutoInferResult,
  VoiceReview,
} from '../../types/voice-dna';

// Mock the httpClient module
vi.mock('../../http/client', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import { httpClient } from '../../http/client';

const mockMeta = {
  request_id: 'req-1',
  timestamp: '2026-01-01T00:00:00Z',
  api_version: 'v1',
};

const mockVoiceDna: VoiceDna = {
  _id: 'vdna-1',
  brand_voice_id: 'bv-1',
  user_id: 'user-1',
  source: 'user_configured',
  status: 'ready',
  fingerprint: {
    avg_sentence_length: 12,
    vocabulary_complexity: 'moderate',
    emoji_patterns: ['👍'],
    emoji_frequency: 0.3,
    punctuation_style: {
      uses_exclamation: true,
      uses_ellipsis: false,
      uses_caps_for_emphasis: false,
    },
    primary_language: 'en',
    code_switching_frequency: 0,
    slang_patterns: [],
    filler_words: [],
    humor_level: 0.5,
    directness: 0.7,
    warmth: 0.8,
    assertiveness: 0.6,
    starts_with_patterns: ['Hey!'],
    ends_with_patterns: ['Cheers'],
    question_response_style: 'direct_answer',
  },
  few_shot_examples: [],
  negative_examples: [],
  raw_samples: [],
  samples_analyzed: 0,
  feedback_signals_processed: 0,
  auto_refinement_count: 0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

function makeApiResponse<T>(data: T) {
  return {
    data: { success: true, data, meta: mockMeta } as SuccessResponse<T>,
    error: null,
    status: 200,
    headers: {} as never,
  };
}

function makeErrorResponse() {
  return {
    data: null,
    error: {
      message: 'Server error',
      code: 'server_error',
      details: {},
      timestamp: '',
    },
    status: 500,
    headers: {} as never,
  };
}

describe('VoiceDnaApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listVoiceDna', () => {
    it('calls GET on voice-dna endpoint', async () => {
      vi.mocked(httpClient.get).mockResolvedValue(
        makeApiResponse([mockVoiceDna])
      );

      const result = await VoiceDnaApi.listVoiceDna();

      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/v1/intelligence/voice-dna'
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0]._id).toBe('vdna-1');
    });

    it('throws on error response', async () => {
      vi.mocked(httpClient.get).mockResolvedValue(makeErrorResponse() as never);

      await expect(VoiceDnaApi.listVoiceDna()).rejects.toBeDefined();
    });
  });

  describe('getVoiceDna', () => {
    it('calls GET with correct ID', async () => {
      vi.mocked(httpClient.get).mockResolvedValue(
        makeApiResponse(mockVoiceDna)
      );

      const result = await VoiceDnaApi.getVoiceDna('vdna-1');

      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/v1/intelligence/voice-dna/vdna-1'
      );
      expect(result.data._id).toBe('vdna-1');
    });
  });

  describe('getVoiceDnaByBrandVoice', () => {
    it('calls GET with brand voice ID', async () => {
      vi.mocked(httpClient.get).mockResolvedValue(
        makeApiResponse(mockVoiceDna)
      );

      await VoiceDnaApi.getVoiceDnaByBrandVoice('bv-1');

      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/v1/intelligence/voice-dna/brand-voice/bv-1'
      );
    });
  });

  describe('createVoiceDna', () => {
    it('calls POST with data', async () => {
      vi.mocked(httpClient.post).mockResolvedValue(
        makeApiResponse(mockVoiceDna)
      );

      const dto = {
        brand_voice_id: 'bv-1',
        raw_samples: [],
      };

      const result = await VoiceDnaApi.createVoiceDna(dto);

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/v1/intelligence/voice-dna',
        dto
      );
      expect(result.data._id).toBe('vdna-1');
    });
  });

  describe('addFewShotExample', () => {
    it('calls POST with few-shot data', async () => {
      vi.mocked(httpClient.post).mockResolvedValue(
        makeApiResponse(mockVoiceDna)
      );

      const dto = { context: 'test context', reply: 'test reply' };
      await VoiceDnaApi.addFewShotExample('vdna-1', dto);

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/v1/intelligence/voice-dna/vdna-1/few-shot',
        dto
      );
    });
  });

  describe('deleteFewShotExample', () => {
    it('calls DELETE with correct index', async () => {
      vi.mocked(httpClient.delete).mockResolvedValue(
        makeApiResponse(mockVoiceDna)
      );

      await VoiceDnaApi.deleteFewShotExample('vdna-1', 2);

      expect(httpClient.delete).toHaveBeenCalledWith(
        '/api/v1/intelligence/voice-dna/vdna-1/few-shot/2'
      );
    });
  });

  describe('addNegativeExample', () => {
    it('calls POST with negative example data', async () => {
      vi.mocked(httpClient.post).mockResolvedValue(
        makeApiResponse(mockVoiceDna)
      );

      const dto = { context: 'too formal', reply: 'bad reply' };
      await VoiceDnaApi.addNegativeExample('vdna-1', dto);

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/v1/intelligence/voice-dna/vdna-1/negative-example',
        dto
      );
    });
  });

  describe('deleteNegativeExample', () => {
    it('calls DELETE with correct index', async () => {
      vi.mocked(httpClient.delete).mockResolvedValue(
        makeApiResponse(mockVoiceDna)
      );

      await VoiceDnaApi.deleteNegativeExample('vdna-1', 0);

      expect(httpClient.delete).toHaveBeenCalledWith(
        '/api/v1/intelligence/voice-dna/vdna-1/negative-example/0'
      );
    });
  });

  describe('reanalyzeVoiceDna', () => {
    it('calls POST on reanalyze endpoint', async () => {
      vi.mocked(httpClient.post).mockResolvedValue(
        makeApiResponse(mockVoiceDna)
      );

      await VoiceDnaApi.reanalyzeVoiceDna('vdna-1');

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/v1/intelligence/voice-dna/vdna-1/reanalyze'
      );
    });
  });

  // === Phase 5 Methods ===

  describe('triggerAutoInfer', () => {
    it('calls POST with auto-infer data', async () => {
      const mockResult: AutoInferResult = {
        success: true,
        voice_dna_id: 'vdna-1',
        status: 'queued',
        samples_collected: 15,
        caption_samples: 10,
        reply_samples: 5,
        message: 'Analysis queued',
      };
      vi.mocked(httpClient.post).mockResolvedValue(makeApiResponse(mockResult));

      const dto = {
        bot_id: 'bot-1',
        brand_voice_id: 'bv-1',
      };
      const result = await VoiceDnaApi.triggerAutoInfer(dto);

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/v1/intelligence/voice-dna/auto-infer',
        dto
      );
      expect(result.data.voice_dna_id).toBe('vdna-1');
      expect(result.data.status).toBe('queued');
    });
  });

  describe('getVoiceReview', () => {
    it('calls GET for voice review', async () => {
      const mockReview: VoiceReview = {
        voice_dna: mockVoiceDna,
        summary: {
          language_description: 'English',
          tone_description: 'Warm',
          style_description: 'Casual',
          emoji_description: 'Uses 👍 often',
          overall: 'A warm and casual voice.',
        },
        sample_generated_reply: {
          context: 'How are you?',
          reply: 'Doing great! Thanks for asking 👍',
        },
        confidence_level: 'high',
      };
      vi.mocked(httpClient.get).mockResolvedValue(makeApiResponse(mockReview));

      const result = await VoiceDnaApi.getVoiceReview('vdna-1');

      expect(httpClient.get).toHaveBeenCalledWith(
        '/api/v1/intelligence/voice-dna/vdna-1/review'
      );
      expect(result.data.confidence_level).toBe('high');
    });
  });

  describe('submitVoiceFeedback', () => {
    it('calls POST with feedback data', async () => {
      vi.mocked(httpClient.post).mockResolvedValue(makeApiResponse(undefined));

      const dto = {
        voice_dna_id: 'vdna-1',
        log_id: 'log-1',
        feedback_status: 'approved' as const,
        original_text: 'test reply',
        context_text: 'User asked a question',
      };
      await VoiceDnaApi.submitVoiceFeedback(dto);

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/v1/intelligence/voice-dna/feedback',
        dto
      );
    });
  });

  describe('adjustVoice', () => {
    it('calls POST with adjustment data', async () => {
      vi.mocked(httpClient.post).mockResolvedValue(
        makeApiResponse(mockVoiceDna)
      );

      const dto = {
        add_few_shot_examples: ['{"context":"hi","reply":"hey!"}'],
        trigger_reanalysis: true,
      };
      const result = await VoiceDnaApi.adjustVoice('vdna-1', dto);

      expect(httpClient.post).toHaveBeenCalledWith(
        '/api/v1/intelligence/voice-dna/vdna-1/adjust',
        dto
      );
      expect(result.data._id).toBe('vdna-1');
    });
  });
});
