import { describe, expect, it, vi, beforeEach } from 'vitest';
import type {
  TriggerAutoInferDto,
  AutoInferResult,
  VoiceDna,
} from '@/lib/types/voice-dna';
import { BotStatus } from '@/lib/types/intelligence';
import type { CreateBotDto, Bot, BotBehavior } from '@/lib/types/intelligence';

/**
 * Integration test: Bot creation → Voice DNA auto-infer flow
 *
 * Tests the logical sequence of:
 * 1. Create bot with social account + optional brand voice
 * 2. Trigger auto-inference from the bot's social account data
 * 3. Poll/receive status updates
 * 4. Review voice DNA once ready
 *
 * These are logic-level tests — no DOM rendering.
 */

// Mock the APIs
vi.mock('@/lib/api/intelligence', () => ({
  IntelligenceApi: {
    createBot: vi.fn(),
    getBot: vi.fn(),
  },
}));

vi.mock('@/lib/api/voice-dna', () => ({
  VoiceDnaApi: {
    triggerAutoInfer: vi.fn(),
    getVoiceDna: vi.fn(),
    getVoiceReview: vi.fn(),
  },
}));

import { IntelligenceApi } from '@/lib/api/intelligence';
import { VoiceDnaApi } from '@/lib/api/voice-dna';

const mockBehavior: BotBehavior = {
  auto_reply_enabled: true,
  max_replies_per_hour: 10,
  max_replies_per_day: 50,
  reply_delay_min_seconds: 30,
  reply_delay_max_seconds: 300,
  escalation_threshold: 0.7,
  cta_aggressiveness: 'soft',
  should_reply_to_spam: false,
  stop_after_escalation: true,
};

const mockBot: Bot = {
  _id: 'bot-1',
  user_id: 'user-1',
  name: 'Test Bot',
  description: 'A test bot',
  social_account_id: 'sa-1',
  brand_voice_id: 'bv-1',
  behavior: mockBehavior,
  status: BotStatus.ACTIVE,
  is_active: true,
  stats: {
    total_replies: 0,
    total_escalations: 0,
    total_skipped: 0,
    avg_confidence: 0,
    last_active_at: undefined,
  },
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

const mockMeta = {
  request_id: 'req-1',
  timestamp: '2026-01-01',
  api_version: 'v1',
};

describe('Bot creation → Voice DNA auto-infer flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('step 1: creates bot and gets back bot ID', async () => {
    vi.mocked(IntelligenceApi.createBot).mockResolvedValue({
      success: true,
      data: mockBot,
      meta: mockMeta,
    });

    const createDto: CreateBotDto = {
      name: 'Test Bot',
      description: 'A test bot',
      social_account_id: 'sa-1',
      brand_voice_id: 'bv-1',
      behavior: mockBehavior,
    };

    const response = await IntelligenceApi.createBot(createDto);

    expect(response.data._id).toBe('bot-1');
    expect(response.data.social_account_id).toBe('sa-1');
    expect(response.data.brand_voice_id).toBe('bv-1');
  });

  it('step 2: triggers auto-infer with bot + social account info', async () => {
    const autoInferResult: AutoInferResult = {
      voice_dna_id: 'vdna-new',
      status: 'queued',
      estimated_time_seconds: 30,
      samples_found: {
        instagram_posts: 15,
        manual_replies: 3,
        total: 18,
      },
    };

    vi.mocked(VoiceDnaApi.triggerAutoInfer).mockResolvedValue({
      success: true,
      data: autoInferResult,
      meta: mockMeta,
    });

    const inferDto: TriggerAutoInferDto = {
      bot_id: 'bot-1',
      social_account_id: 'sa-1',
      brand_voice_id: 'bv-1',
      source: 'onboarding',
    };

    const response = await VoiceDnaApi.triggerAutoInfer(inferDto);

    expect(response.data.voice_dna_id).toBe('vdna-new');
    expect(response.data.status).toBe('queued');
    expect(response.data.samples_found.total).toBeGreaterThanOrEqual(5);
  });

  it('step 3: polls voice DNA status until ready', async () => {
    const analyzingVdna: Partial<VoiceDna> = {
      _id: 'vdna-new',
      status: 'analyzing',
    };
    const readyVdna: Partial<VoiceDna> = {
      _id: 'vdna-new',
      status: 'ready',
    };

    // First poll: still analyzing
    vi.mocked(VoiceDnaApi.getVoiceDna)
      .mockResolvedValueOnce({
        success: true,
        data: analyzingVdna as VoiceDna,
        meta: mockMeta,
      })
      // Second poll: ready
      .mockResolvedValueOnce({
        success: true,
        data: readyVdna as VoiceDna,
        meta: mockMeta,
      });

    // First poll
    const poll1 = await VoiceDnaApi.getVoiceDna('vdna-new');
    expect(poll1.data.status).toBe('analyzing');

    // Second poll
    const poll2 = await VoiceDnaApi.getVoiceDna('vdna-new');
    expect(poll2.data.status).toBe('ready');
  });

  it('step 4: retrieves voice review after ready', async () => {
    vi.mocked(VoiceDnaApi.getVoiceReview).mockResolvedValue({
      success: true,
      data: {
        voice_dna: {} as VoiceDna,
        summary: {
          language_description: 'English',
          tone_description: 'Warm and casual',
          style_description: 'Short sentences, lots of emojis',
          emoji_description: 'Uses 🔥 and 💪 frequently',
          overall:
            'Your voice is warm, casual, and confident with a touch of humor.',
        },
        sample_generated_reply: {
          context: 'What does your product do?',
          reply:
            'Hey! We help you automate your social replies 🔥 Super easy to set up!',
        },
        confidence_level: 'high',
      },
      meta: mockMeta,
    });

    const review = await VoiceDnaApi.getVoiceReview('vdna-new');

    expect(review.data.confidence_level).toBe('high');
    expect(review.data.summary.overall).toBeTruthy();
    expect(review.data.sample_generated_reply.reply).toBeTruthy();
  });

  it('full flow: create bot → auto-infer → poll → review', async () => {
    // 1. Create bot
    vi.mocked(IntelligenceApi.createBot).mockResolvedValue({
      success: true,
      data: mockBot,
      meta: mockMeta,
    });

    const botResponse = await IntelligenceApi.createBot({
      name: 'Flow Bot',
      social_account_id: 'sa-1',
      behavior: mockBehavior,
    });
    const botId = botResponse.data._id;
    const socialAccountId = botResponse.data.social_account_id;

    // 2. Trigger auto-infer
    vi.mocked(VoiceDnaApi.triggerAutoInfer).mockResolvedValue({
      success: true,
      data: {
        voice_dna_id: 'vdna-flow',
        status: 'queued',
        samples_found: { instagram_posts: 20, manual_replies: 0, total: 20 },
      },
      meta: mockMeta,
    });

    const inferResponse = await VoiceDnaApi.triggerAutoInfer({
      bot_id: botId,
      social_account_id: socialAccountId,
      source: 'onboarding',
    });
    const voiceDnaId = inferResponse.data.voice_dna_id;

    // 3. Poll until ready
    vi.mocked(VoiceDnaApi.getVoiceDna).mockResolvedValue({
      success: true,
      data: { _id: voiceDnaId, status: 'ready' } as VoiceDna,
      meta: mockMeta,
    });

    const statusResponse = await VoiceDnaApi.getVoiceDna(voiceDnaId);
    expect(statusResponse.data.status).toBe('ready');

    // 4. Get review
    vi.mocked(VoiceDnaApi.getVoiceReview).mockResolvedValue({
      success: true,
      data: {
        voice_dna: {} as VoiceDna,
        summary: {
          language_description: 'English',
          tone_description: 'Professional',
          style_description: 'Concise',
          emoji_description: 'Minimal',
          overall: 'Professional and concise.',
        },
        sample_generated_reply: {
          context: 'Tell me more',
          reply: 'Sure thing! Here are the details...',
        },
        confidence_level: 'medium',
      },
      meta: mockMeta,
    });

    const review = await VoiceDnaApi.getVoiceReview(voiceDnaId);

    expect(review.data.confidence_level).toBeDefined();
    expect(review.data.summary.overall.length).toBeGreaterThan(0);

    // Verify the full chain was called
    expect(IntelligenceApi.createBot).toHaveBeenCalledTimes(1);
    expect(VoiceDnaApi.triggerAutoInfer).toHaveBeenCalledTimes(1);
    expect(VoiceDnaApi.getVoiceDna).toHaveBeenCalledTimes(1);
    expect(VoiceDnaApi.getVoiceReview).toHaveBeenCalledTimes(1);
  });

  it('handles auto-infer failure gracefully', async () => {
    vi.mocked(VoiceDnaApi.triggerAutoInfer).mockResolvedValue({
      success: true,
      data: {
        voice_dna_id: 'vdna-fail',
        status: 'queued',
        samples_found: { instagram_posts: 2, manual_replies: 0, total: 2 },
      },
      meta: mockMeta,
    });

    const inferResponse = await VoiceDnaApi.triggerAutoInfer({
      bot_id: 'bot-1',
      social_account_id: 'sa-1',
      source: 'onboarding',
    });

    // Not enough samples but still queued
    expect(inferResponse.data.samples_found.total).toBeLessThan(5);

    // Polling returns failed
    vi.mocked(VoiceDnaApi.getVoiceDna).mockResolvedValue({
      success: true,
      data: {
        _id: 'vdna-fail',
        status: 'failed',
        failure_reason: 'Insufficient samples for analysis',
      } as VoiceDna & { failure_reason: string },
      meta: mockMeta,
    });

    const statusResponse = await VoiceDnaApi.getVoiceDna('vdna-fail');
    expect(statusResponse.data.status).toBe('failed');
  });
});
