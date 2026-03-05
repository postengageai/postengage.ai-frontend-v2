import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useVoiceDnaStore } from '../voice-dna';
import type { VoiceDna } from '../../types/voice-dna';

// Mock the API module
vi.mock('../../api/voice-dna', () => ({
  VoiceDnaApi: {
    listVoiceDna: vi.fn(),
    getVoiceDna: vi.fn(),
    getVoiceDnaByBrandVoice: vi.fn(),
    createVoiceDna: vi.fn(),
    addFewShotExample: vi.fn(),
    deleteFewShotExample: vi.fn(),
    addNegativeExample: vi.fn(),
    deleteNegativeExample: vi.fn(),
    reanalyzeVoiceDna: vi.fn(),
    deleteVoiceDna: vi.fn(),
  },
}));

// Import the mocked module
import { VoiceDnaApi } from '../../api/voice-dna';

const mockVoiceDna: VoiceDna = {
  _id: 'vdna-1',
  brand_voice_id: 'bv-1',
  user_id: 'user-1',
  source: 'user_configured',
  status: 'ready',
  fingerprint: {
    style_metrics: {
      avg_sentence_length: 12,
      vocabulary_complexity: 'moderate',
      emoji_patterns: ['👍', '🔥'],
      emoji_frequency: 0.3,
      punctuation_style: {
        exclamation_frequency: 0.4,
        ellipsis_usage: false,
        caps_emphasis: false,
      },
    },
    language_patterns: {
      primary_language: 'en',
      code_switching_frequency: 0,
      slang_patterns: [],
      filler_words: [],
    },
    tone_markers: {
      humor_level: 0.5,
      directness: 0.7,
      warmth: 0.8,
      assertiveness: 0.6,
    },
    structural_patterns: {
      starts_with_patterns: ['Hey!'],
      ends_with_patterns: ['Cheers'],
      question_response_style: 'direct_answer',
    },
  },
  few_shot_examples: [
    {
      context: 'User asks about pricing',
      reply:
        'Hey! Our plans start at $29/mo. Want me to walk you through them?',
      tags: ['pricing'],
      source: 'creator_manual',
      added_at: '2026-01-01T00:00:00Z',
    },
  ],
  negative_examples: [],
  raw_samples: [],
  feedback_signals_processed: 0,
  auto_refinement_count: 0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const mockVoiceDna2: VoiceDna = {
  ...mockVoiceDna,
  _id: 'vdna-2',
  brand_voice_id: 'bv-2',
};

const mockSuccessResponse = <T>(data: T) => ({
  success: true,
  data,
  meta: {
    request_id: 'req-1',
    timestamp: '2026-01-01T00:00:00Z',
    api_version: 'v1',
  },
});

describe('useVoiceDnaStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useVoiceDnaStore.getState().actions.reset();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has correct default values', () => {
      const state = useVoiceDnaStore.getState();
      expect(state.voiceDnaList).toEqual([]);
      expect(state.selectedVoiceDna).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchAll', () => {
    it('fetches and sets voice DNA list', async () => {
      vi.mocked(VoiceDnaApi.listVoiceDna).mockResolvedValue(
        mockSuccessResponse([mockVoiceDna, mockVoiceDna2])
      );

      await useVoiceDnaStore.getState().actions.fetchAll();

      const state = useVoiceDnaStore.getState();
      expect(state.voiceDnaList).toHaveLength(2);
      expect(state.voiceDnaList[0]._id).toBe('vdna-1');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('sets loading state during fetch', async () => {
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      vi.mocked(VoiceDnaApi.listVoiceDna).mockReturnValue(
        pendingPromise as ReturnType<typeof VoiceDnaApi.listVoiceDna>
      );

      const fetchPromise = useVoiceDnaStore.getState().actions.fetchAll();

      expect(useVoiceDnaStore.getState().isLoading).toBe(true);

      resolvePromise!(mockSuccessResponse([mockVoiceDna]));
      await fetchPromise;

      expect(useVoiceDnaStore.getState().isLoading).toBe(false);
    });

    it('sets error on failure', async () => {
      vi.mocked(VoiceDnaApi.listVoiceDna).mockRejectedValue(
        new Error('Network error')
      );

      await useVoiceDnaStore.getState().actions.fetchAll();

      const state = useVoiceDnaStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.isLoading).toBe(false);
    });

    it('sets default error message for non-Error throws', async () => {
      vi.mocked(VoiceDnaApi.listVoiceDna).mockRejectedValue('unknown');

      await useVoiceDnaStore.getState().actions.fetchAll();

      expect(useVoiceDnaStore.getState().error).toBe(
        'Failed to fetch Voice DNA list'
      );
    });
  });

  describe('fetchById', () => {
    it('fetches and sets selected voice DNA', async () => {
      vi.mocked(VoiceDnaApi.getVoiceDna).mockResolvedValue(
        mockSuccessResponse(mockVoiceDna)
      );

      await useVoiceDnaStore.getState().actions.fetchById('vdna-1');

      expect(useVoiceDnaStore.getState().selectedVoiceDna?._id).toBe('vdna-1');
      expect(useVoiceDnaStore.getState().isLoading).toBe(false);
    });

    it('sets error on fetch failure', async () => {
      vi.mocked(VoiceDnaApi.getVoiceDna).mockRejectedValue(
        new Error('Not found')
      );

      await useVoiceDnaStore.getState().actions.fetchById('invalid');

      expect(useVoiceDnaStore.getState().error).toBe('Not found');
      expect(useVoiceDnaStore.getState().selectedVoiceDna).toBeNull();
    });
  });

  describe('fetchByBrandVoice', () => {
    it('returns voice DNA for brand voice', async () => {
      vi.mocked(VoiceDnaApi.getVoiceDnaByBrandVoice).mockResolvedValue(
        mockSuccessResponse(mockVoiceDna)
      );

      const result = await useVoiceDnaStore
        .getState()
        .actions.fetchByBrandVoice('bv-1');

      expect(result?._id).toBe('vdna-1');
    });

    it('returns null on failure', async () => {
      vi.mocked(VoiceDnaApi.getVoiceDnaByBrandVoice).mockRejectedValue(
        new Error('Not found')
      );

      const result = await useVoiceDnaStore
        .getState()
        .actions.fetchByBrandVoice('bv-999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates and adds to list', async () => {
      vi.mocked(VoiceDnaApi.createVoiceDna).mockResolvedValue(
        mockSuccessResponse(mockVoiceDna)
      );

      const result = await useVoiceDnaStore.getState().actions.create({
        brand_voice_id: 'bv-1',
        raw_samples: [{ text: 'sample text', source: 'manual' }],
      });

      expect(result._id).toBe('vdna-1');
      expect(useVoiceDnaStore.getState().voiceDnaList).toHaveLength(1);
    });

    it('throws and sets error on failure', async () => {
      vi.mocked(VoiceDnaApi.createVoiceDna).mockRejectedValue(
        new Error('Create failed')
      );

      await expect(
        useVoiceDnaStore.getState().actions.create({
          brand_voice_id: 'bv-1',
          raw_samples: [{ text: 'sample text', source: 'manual' }],
        })
      ).rejects.toThrow('Create failed');

      expect(useVoiceDnaStore.getState().error).toBe('Create failed');
    });
  });

  describe('addFewShot', () => {
    it('updates selected and list after adding', async () => {
      const updated = {
        ...mockVoiceDna,
        few_shot_examples: [
          ...mockVoiceDna.few_shot_examples,
          {
            context: 'new context',
            reply: 'new reply',
            tags: [],
            source: 'creator_manual' as const,
            added_at: '2026-01-01T00:00:00Z',
          },
        ],
      };
      vi.mocked(VoiceDnaApi.addFewShotExample).mockResolvedValue(
        mockSuccessResponse(updated)
      );

      // Pre-populate store
      useVoiceDnaStore.setState({
        voiceDnaList: [mockVoiceDna],
        selectedVoiceDna: mockVoiceDna,
      });

      await useVoiceDnaStore.getState().actions.addFewShot('vdna-1', {
        context: 'new context',
        reply: 'new reply',
        tags: [],
      });

      const state = useVoiceDnaStore.getState();
      expect(state.selectedVoiceDna?.few_shot_examples).toHaveLength(2);
      expect(state.voiceDnaList[0].few_shot_examples).toHaveLength(2);
    });

    it('does not update selectedVoiceDna if id mismatch', async () => {
      const updated = { ...mockVoiceDna2, few_shot_examples: [] };
      vi.mocked(VoiceDnaApi.addFewShotExample).mockResolvedValue(
        mockSuccessResponse(updated)
      );

      useVoiceDnaStore.setState({
        voiceDnaList: [mockVoiceDna, mockVoiceDna2],
        selectedVoiceDna: mockVoiceDna, // selected is vdna-1, updating vdna-2
      });

      await useVoiceDnaStore.getState().actions.addFewShot('vdna-2', {
        context: 'test',
        reply: 'test',
        tags: [],
      });

      // Selected should remain unchanged (vdna-1)
      expect(useVoiceDnaStore.getState().selectedVoiceDna?._id).toBe('vdna-1');
    });
  });

  describe('deleteFewShot', () => {
    it('updates after deleting few-shot example', async () => {
      const updated = { ...mockVoiceDna, few_shot_examples: [] };
      vi.mocked(VoiceDnaApi.deleteFewShotExample).mockResolvedValue(
        mockSuccessResponse(updated)
      );

      useVoiceDnaStore.setState({
        voiceDnaList: [mockVoiceDna],
        selectedVoiceDna: mockVoiceDna,
      });

      await useVoiceDnaStore.getState().actions.deleteFewShot('vdna-1', 0);

      expect(
        useVoiceDnaStore.getState().selectedVoiceDna?.few_shot_examples
      ).toHaveLength(0);
    });
  });

  describe('addNegative', () => {
    it('updates after adding negative example', async () => {
      const updated = {
        ...mockVoiceDna,
        negative_examples: [
          {
            reply: 'bad reply',
            reason: 'too formal',
            tags: [],
            added_at: '2026-01-01T00:00:00Z',
          },
        ],
      };
      vi.mocked(VoiceDnaApi.addNegativeExample).mockResolvedValue(
        mockSuccessResponse(updated)
      );

      useVoiceDnaStore.setState({
        voiceDnaList: [mockVoiceDna],
        selectedVoiceDna: mockVoiceDna,
      });

      await useVoiceDnaStore.getState().actions.addNegative('vdna-1', {
        reply: 'bad reply',
        reason: 'too formal',
        tags: [],
      });

      expect(
        useVoiceDnaStore.getState().selectedVoiceDna?.negative_examples
      ).toHaveLength(1);
    });
  });

  describe('deleteNegative', () => {
    it('updates after deleting negative example', async () => {
      const withNegative = {
        ...mockVoiceDna,
        negative_examples: [
          {
            reply: 'bad reply',
            reason: 'too formal',
            tags: [],
            added_at: '2026-01-01T00:00:00Z',
          },
        ],
      };
      const afterDelete = { ...mockVoiceDna, negative_examples: [] };

      vi.mocked(VoiceDnaApi.deleteNegativeExample).mockResolvedValue(
        mockSuccessResponse(afterDelete)
      );

      useVoiceDnaStore.setState({
        voiceDnaList: [withNegative],
        selectedVoiceDna: withNegative,
      });

      await useVoiceDnaStore.getState().actions.deleteNegative('vdna-1', 0);

      expect(
        useVoiceDnaStore.getState().selectedVoiceDna?.negative_examples
      ).toHaveLength(0);
    });
  });

  describe('triggerReanalyze', () => {
    it('updates status after reanalysis', async () => {
      const updated = { ...mockVoiceDna, status: 'analyzing' as const };
      vi.mocked(VoiceDnaApi.reanalyzeVoiceDna).mockResolvedValue(
        mockSuccessResponse(updated)
      );

      useVoiceDnaStore.setState({
        voiceDnaList: [mockVoiceDna],
        selectedVoiceDna: mockVoiceDna,
      });

      await useVoiceDnaStore.getState().actions.triggerReanalyze('vdna-1');

      expect(useVoiceDnaStore.getState().selectedVoiceDna?.status).toBe(
        'analyzing'
      );
    });
  });

  describe('deleteVoiceDna', () => {
    it('removes from list and clears selected', async () => {
      vi.mocked(VoiceDnaApi.deleteVoiceDna).mockResolvedValue(
        mockSuccessResponse(undefined as unknown as void)
      );

      useVoiceDnaStore.setState({
        voiceDnaList: [mockVoiceDna, mockVoiceDna2],
        selectedVoiceDna: mockVoiceDna,
      });

      await useVoiceDnaStore.getState().actions.deleteVoiceDna('vdna-1');

      const state = useVoiceDnaStore.getState();
      expect(state.voiceDnaList).toHaveLength(1);
      expect(state.voiceDnaList[0]._id).toBe('vdna-2');
      expect(state.selectedVoiceDna).toBeNull();
    });

    it('does not clear selected if deleting different item', async () => {
      vi.mocked(VoiceDnaApi.deleteVoiceDna).mockResolvedValue(
        mockSuccessResponse(undefined as unknown as void)
      );

      useVoiceDnaStore.setState({
        voiceDnaList: [mockVoiceDna, mockVoiceDna2],
        selectedVoiceDna: mockVoiceDna,
      });

      await useVoiceDnaStore.getState().actions.deleteVoiceDna('vdna-2');

      expect(useVoiceDnaStore.getState().selectedVoiceDna?._id).toBe('vdna-1');
      expect(useVoiceDnaStore.getState().voiceDnaList).toHaveLength(1);
    });
  });

  describe('setSelected', () => {
    it('sets selected voice DNA', () => {
      useVoiceDnaStore.getState().actions.setSelected(mockVoiceDna);
      expect(useVoiceDnaStore.getState().selectedVoiceDna?._id).toBe('vdna-1');
    });

    it('clears selected voice DNA', () => {
      useVoiceDnaStore.setState({ selectedVoiceDna: mockVoiceDna });
      useVoiceDnaStore.getState().actions.setSelected(null);
      expect(useVoiceDnaStore.getState().selectedVoiceDna).toBeNull();
    });
  });

  describe('updateInList', () => {
    it('updates item in list and selected', () => {
      const updated = { ...mockVoiceDna, feedback_signals_processed: 10 };

      useVoiceDnaStore.setState({
        voiceDnaList: [mockVoiceDna, mockVoiceDna2],
        selectedVoiceDna: mockVoiceDna,
      });

      useVoiceDnaStore.getState().actions.updateInList(updated);

      const state = useVoiceDnaStore.getState();
      expect(state.voiceDnaList[0].feedback_signals_processed).toBe(10);
      expect(state.selectedVoiceDna?.feedback_signals_processed).toBe(10);
    });

    it('does not update selected if different item', () => {
      const updated = { ...mockVoiceDna2, feedback_signals_processed: 10 };

      useVoiceDnaStore.setState({
        voiceDnaList: [mockVoiceDna, mockVoiceDna2],
        selectedVoiceDna: mockVoiceDna,
      });

      useVoiceDnaStore.getState().actions.updateInList(updated);

      expect(
        useVoiceDnaStore.getState().selectedVoiceDna?.feedback_signals_processed
      ).toBe(0);
    });
  });

  describe('reset', () => {
    it('resets store to initial state', () => {
      useVoiceDnaStore.setState({
        voiceDnaList: [mockVoiceDna],
        selectedVoiceDna: mockVoiceDna,
        isLoading: true,
        error: 'some error',
      });

      useVoiceDnaStore.getState().actions.reset();

      const state = useVoiceDnaStore.getState();
      expect(state.voiceDnaList).toEqual([]);
      expect(state.selectedVoiceDna).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
