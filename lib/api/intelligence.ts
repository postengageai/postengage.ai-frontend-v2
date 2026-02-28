import { httpClient, SuccessResponse } from '../http/client';
import {
  Bot,
  CreateBotDto,
  UpdateBotDto,
  KnowledgeSource,
  AddKnowledgeSourceDto,
  UserLlmConfig,
  UpdateUserLlmConfigDto,
  BrandVoice,
  CreateBrandVoiceDto,
  UpdateBrandVoiceDto,
  LlmDefaults,
} from '../types/intelligence';
import { AnalyticsPeriod, IntelligenceAnalyticsItem } from '../types/analytics';
import type {
  IntelligenceQualityAnalytics,
  QualityAnalyticsParams,
  BotHealthScore,
  FlaggedReply,
  FlaggedRepliesParams,
} from '../types/quality';

const INTELLIGENCE_BASE_URL = '/api/v1/intelligence';

export class IntelligenceApi {
  // Bots
  static async getBots(params?: {
    social_account_id?: string;
  }): Promise<SuccessResponse<Bot[]>> {
    const searchParams = new URLSearchParams();
    if (params?.social_account_id) {
      searchParams.set('social_account_id', params.social_account_id);
    }

    const query = searchParams.toString();
    const url = query
      ? `${INTELLIGENCE_BASE_URL}/bots?${query}`
      : `${INTELLIGENCE_BASE_URL}/bots`;

    const response = await httpClient.get<Bot[]>(url);
    if (response.error) throw response.error;
    return response.data;
  }

  static async getBot(id: string): Promise<SuccessResponse<Bot>> {
    const response = await httpClient.get<Bot>(
      `${INTELLIGENCE_BASE_URL}/bots/${id}`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async createBot(data: CreateBotDto): Promise<SuccessResponse<Bot>> {
    const response = await httpClient.post<Bot>(
      `${INTELLIGENCE_BASE_URL}/bots`,
      data
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async updateBot(
    id: string,
    data: UpdateBotDto
  ): Promise<SuccessResponse<Bot>> {
    const response = await httpClient.patch<Bot>(
      `${INTELLIGENCE_BASE_URL}/bots/${id}`,
      data
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async deleteBot(id: string): Promise<SuccessResponse<void>> {
    const response = await httpClient.delete<void>(
      `${INTELLIGENCE_BASE_URL}/bots/${id}`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  // Knowledge
  static async getKnowledgeSources(
    botId: string
  ): Promise<SuccessResponse<KnowledgeSource[]>> {
    const response = await httpClient.get<KnowledgeSource[]>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/knowledge`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async addKnowledgeSource(
    botId: string,
    data: AddKnowledgeSourceDto
  ): Promise<SuccessResponse<KnowledgeSource>> {
    const response = await httpClient.post<KnowledgeSource>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/knowledge`,
      data
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async removeKnowledgeSource(
    botId: string,
    sourceId: string
  ): Promise<SuccessResponse<void>> {
    const response = await httpClient.delete<void>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/knowledge/${sourceId}`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  // Config
  static async getUserConfig(): Promise<SuccessResponse<UserLlmConfig>> {
    const response = await httpClient.get<UserLlmConfig>(
      `${INTELLIGENCE_BASE_URL}/config`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async updateUserConfig(
    data: UpdateUserLlmConfigDto
  ): Promise<SuccessResponse<UserLlmConfig>> {
    const response = await httpClient.patch<UserLlmConfig>(
      `${INTELLIGENCE_BASE_URL}/config`,
      data
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async getLlmDefaults(): Promise<SuccessResponse<LlmDefaults>> {
    const response = await httpClient.get<LlmDefaults>(
      `${INTELLIGENCE_BASE_URL}/llm-defaults`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  // Brand Voices
  static async getBrandVoices(): Promise<SuccessResponse<BrandVoice[]>> {
    const response = await httpClient.get<BrandVoice[]>(
      `${INTELLIGENCE_BASE_URL}/brand-voices`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async getBrandVoice(id: string): Promise<SuccessResponse<BrandVoice>> {
    const response = await httpClient.get<BrandVoice>(
      `${INTELLIGENCE_BASE_URL}/brand-voices/${id}`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async createBrandVoice(
    data: CreateBrandVoiceDto
  ): Promise<SuccessResponse<BrandVoice>> {
    const response = await httpClient.post<BrandVoice>(
      `${INTELLIGENCE_BASE_URL}/brand-voices`,
      data
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async updateBrandVoice(
    id: string,
    data: UpdateBrandVoiceDto
  ): Promise<SuccessResponse<BrandVoice>> {
    const response = await httpClient.patch<BrandVoice>(
      `${INTELLIGENCE_BASE_URL}/brand-voices/${id}`,
      data
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async deleteBrandVoice(id: string): Promise<SuccessResponse<void>> {
    const response = await httpClient.delete<void>(
      `${INTELLIGENCE_BASE_URL}/brand-voices/${id}`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  // Analytics
  static async getIntelligenceAnalytics(params: {
    period?: AnalyticsPeriod;
    page?: number;
    limit?: number;
  }): Promise<
    SuccessResponse<{
      period: {
        start: string;
        end: string;
        type?: AnalyticsPeriod;
      };
      items: IntelligenceAnalyticsItem[];
    }>
  > {
    const searchParams = new URLSearchParams();
    if (params.period) {
      searchParams.set('period', params.period);
    }
    if (params.page) {
      searchParams.set('page', String(params.page));
    }
    if (params.limit) {
      searchParams.set('limit', String(params.limit));
    }
    const query = searchParams.toString();
    const url = query
      ? `/api/v1/analytics/intelligence?${query}`
      : `/api/v1/analytics/intelligence`;
    const response = await httpClient.get<{
      period: {
        start: string;
        end: string;
        type?: AnalyticsPeriod;
      };
      items: IntelligenceAnalyticsItem[];
    }>(url);
    if (response.error) throw response.error;
    return response.data;
  }

  // Quality Analytics (Phase 3)
  static async getQualityAnalytics(
    params?: QualityAnalyticsParams
  ): Promise<SuccessResponse<IntelligenceQualityAnalytics>> {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.set('period', params.period);
    if (params?.bot_id) searchParams.set('bot_id', params.bot_id);
    if (params?.from) searchParams.set('from', params.from);
    if (params?.to) searchParams.set('to', params.to);
    if (params?.include_quality !== undefined)
      searchParams.set('include_quality', String(params.include_quality));
    if (params?.include_diversity !== undefined)
      searchParams.set('include_diversity', String(params.include_diversity));
    if (params?.include_intents !== undefined)
      searchParams.set('include_intents', String(params.include_intents));

    const query = searchParams.toString();
    const url = query
      ? `${INTELLIGENCE_BASE_URL}/analytics/quality?${query}`
      : `${INTELLIGENCE_BASE_URL}/analytics/quality`;

    const response = await httpClient.get<IntelligenceQualityAnalytics>(url);
    if (response.error) throw response.error;
    return response.data;
  }

  // Bot Health & Flagged Replies (Phase 4)
  static async getBotHealth(
    botId: string
  ): Promise<SuccessResponse<BotHealthScore>> {
    const response = await httpClient.get<BotHealthScore>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/health`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async getFlaggedReplies(
    botId: string,
    params?: FlaggedRepliesParams
  ): Promise<SuccessResponse<FlaggedReply[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.reviewed !== undefined)
      searchParams.set('reviewed', String(params.reviewed));

    const query = searchParams.toString();
    const url = query
      ? `${INTELLIGENCE_BASE_URL}/bots/${botId}/flagged-replies?${query}`
      : `${INTELLIGENCE_BASE_URL}/bots/${botId}/flagged-replies`;

    const response = await httpClient.get<FlaggedReply[]>(url);
    if (response.error) throw response.error;
    return response.data;
  }

  static async approveReply(replyId: string): Promise<SuccessResponse<void>> {
    const response = await httpClient.post<void>(
      `${INTELLIGENCE_BASE_URL}/flagged-replies/${replyId}/approve`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async rejectReply(
    replyId: string,
    reason?: string
  ): Promise<SuccessResponse<void>> {
    const response = await httpClient.post<void>(
      `${INTELLIGENCE_BASE_URL}/flagged-replies/${replyId}/reject`,
      reason ? { reason } : undefined
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async editAndApproveReply(
    replyId: string,
    editedReply: string
  ): Promise<SuccessResponse<void>> {
    const response = await httpClient.post<void>(
      `${INTELLIGENCE_BASE_URL}/flagged-replies/${replyId}/edit`,
      { edited_reply: editedReply }
    );
    if (response.error) throw response.error;
    return response.data;
  }
}
