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
  HotLeadsResponse,
  GetHotLeadsParams,
} from '../types/intelligence';
import {
  AnalyticsPeriod,
  IntelligenceAnalyticsItem,
  IntelligenceQualityAnalytics,
  IntelligenceLogsByIntentResponse,
} from '../types/analytics';
import type {
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

  static async addKnowledgeSourceFromFile(
    botId: string,
    file: File,
    title?: string
  ): Promise<SuccessResponse<KnowledgeSource>> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    const response = await httpClient.post<KnowledgeSource>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/knowledge/upload`,
      formData
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async addKnowledgeSourceFromUrl(
    botId: string,
    data: { title: string; url: string }
  ): Promise<SuccessResponse<KnowledgeSource>> {
    const response = await httpClient.post<KnowledgeSource>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/knowledge/url`,
      data
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async updateKnowledgeSource(
    botId: string,
    sourceId: string,
    data: { title?: string; content?: string }
  ): Promise<SuccessResponse<KnowledgeSource>> {
    const response = await httpClient.patch<KnowledgeSource>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/knowledge/${sourceId}`,
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

  // LLM Config (UserLlmConfigController: GET/PATCH /intelligence/config)
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

  // LLM Defaults (LlmDefaultsController: GET /intelligence/llm-defaults)
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

  // Analytics (AnalyticsController: GET /analytics/intelligence)
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

  // Bot Health & Flagged Replies (BotQualityController: GET /intelligence/bots/:botId/health|flagged-replies)
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

  // Hot Leads
  static async getHotLeads(
    params?: GetHotLeadsParams
  ): Promise<SuccessResponse<HotLeadsResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.intent) searchParams.set('intent', params.intent);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.page) searchParams.set('page', String(params.page));

    const query = searchParams.toString();
    const url = query
      ? `${INTELLIGENCE_BASE_URL}/leads?${query}`
      : `${INTELLIGENCE_BASE_URL}/leads`;

    const response = await httpClient.get<HotLeadsResponse>(url);
    if (response.error) throw response.error;
    return response.data;
  }

  // Quality Analytics (GET /analytics/intelligence/quality)
  static async getIntelligenceQualityAnalytics(params: {
    period?: AnalyticsPeriod;
  }): Promise<SuccessResponse<IntelligenceQualityAnalytics>> {
    const searchParams = new URLSearchParams();
    if (params.period) searchParams.set('period', params.period);
    const query = searchParams.toString();
    const url = query
      ? `/api/v1/analytics/intelligence/quality?${query}`
      : `/api/v1/analytics/intelligence/quality`;
    const response = await httpClient.get<IntelligenceQualityAnalytics>(url);
    if (response.error) throw response.error;
    return response.data;
  }

  // Intent log drill-down (GET /analytics/intelligence/logs?intent=&period=&page=&limit=)
  static async getLogsByIntent(params: {
    intent: string;
    period?: AnalyticsPeriod;
    page?: number;
    limit?: number;
  }): Promise<SuccessResponse<IntelligenceLogsByIntentResponse>> {
    const searchParams = new URLSearchParams();
    searchParams.set('intent', params.intent);
    if (params.period) searchParams.set('period', params.period);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    const url = `/api/v1/analytics/intelligence/logs?${searchParams.toString()}`;
    const response =
      await httpClient.get<IntelligenceLogsByIntentResponse>(url);
    if (response.error) throw response.error;
    return response.data;
  }

  // Conversation thread (for future inbox use)
  static async getThread(
    platformUserId: string,
    limit?: number
  ): Promise<SuccessResponse<import('../types/intelligence').ThreadResponse>> {
    const searchParams = new URLSearchParams();
    if (limit) searchParams.set('limit', String(limit));
    const query = searchParams.toString();
    const url = query
      ? `${INTELLIGENCE_BASE_URL}/leads/${encodeURIComponent(platformUserId)}/thread?${query}`
      : `${INTELLIGENCE_BASE_URL}/leads/${encodeURIComponent(platformUserId)}/thread`;

    const response =
      await httpClient.get<import('../types/intelligence').ThreadResponse>(url);
    if (response.error) throw response.error;
    return response.data;
  }
}
