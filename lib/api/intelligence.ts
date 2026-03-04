import { httpClient, SuccessResponse } from '../http/client';
import {
  Bot,
  BrandVoice,
  CreateBotDto,
  UpdateBotDto,
  CreateBrandVoiceDto,
  KnowledgeSource,
  VoiceDNA,
  CreateVoiceDnaDto,
  AddFewShotExampleDto,
  ReanalyzVoiceDnaDto,
  TriggerAutoInferDto,
  VoiceFeedbackDto,
  AdjustVoiceDto,
  MemoryStats,
  TrackedUser,
  MemoryEntity,
  MemoryUsersParamsDto,
  UserLlmConfig,
} from '../types/intelligence';

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
    return response.data!;
  }

  static async getBot(id: string): Promise<SuccessResponse<Bot>> {
    const response = await httpClient.get<Bot>(
      `${INTELLIGENCE_BASE_URL}/bots/${id}`
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async createBot(data: CreateBotDto): Promise<SuccessResponse<Bot>> {
    const response = await httpClient.post<Bot>(
      `${INTELLIGENCE_BASE_URL}/bots`,
      data
    );
    if (response.error) throw response.error;
    return response.data!;
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
    return response.data!;
  }

  static async deleteBot(id: string): Promise<SuccessResponse<void>> {
    const response = await httpClient.delete<void>(
      `${INTELLIGENCE_BASE_URL}/bots/${id}`
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  // Brand Voices
  static async getBrandVoices(): Promise<SuccessResponse<BrandVoice[]>> {
    const response = await httpClient.get<BrandVoice[]>(
      `${INTELLIGENCE_BASE_URL}/brand-voices`
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async getBrandVoice(id: string): Promise<SuccessResponse<BrandVoice>> {
    const response = await httpClient.get<BrandVoice>(
      `${INTELLIGENCE_BASE_URL}/brand-voices/${id}`
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async createBrandVoice(
    data: CreateBrandVoiceDto
  ): Promise<SuccessResponse<BrandVoice>> {
    const response = await httpClient.post<BrandVoice>(
      `${INTELLIGENCE_BASE_URL}/brand-voices`,
      data
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async updateBrandVoice(
    id: string,
    data: Partial<CreateBrandVoiceDto>
  ): Promise<SuccessResponse<BrandVoice>> {
    const response = await httpClient.patch<BrandVoice>(
      `${INTELLIGENCE_BASE_URL}/brand-voices/${id}`,
      data
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async deleteBrandVoice(id: string): Promise<SuccessResponse<void>> {
    const response = await httpClient.delete<void>(
      `${INTELLIGENCE_BASE_URL}/brand-voices/${id}`
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  // Knowledge Sources
  static async addKnowledgeSource(
    botId: string,
    data: {
      title: string;
      content: string;
    }
  ): Promise<SuccessResponse<KnowledgeSource>> {
    const response = await httpClient.post<KnowledgeSource>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/knowledge`,
      data
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async removeKnowledgeSource(
    botId: string,
    sourceId: string
  ): Promise<SuccessResponse<void>> {
    const response = await httpClient.delete<void>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/knowledge/${sourceId}`
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  // Voice DNA
  static async createVoiceDna(
    data: CreateVoiceDnaDto
  ): Promise<SuccessResponse<VoiceDNA>> {
    const response = await httpClient.post<VoiceDNA>(
      `${INTELLIGENCE_BASE_URL}/voice-dna`,
      data
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async getAllVoiceDna(): Promise<SuccessResponse<VoiceDNA[]>> {
    const response = await httpClient.get<VoiceDNA[]>(
      `${INTELLIGENCE_BASE_URL}/voice-dna`
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async getVoiceDna(id: string): Promise<SuccessResponse<VoiceDNA>> {
    const response = await httpClient.get<VoiceDNA>(
      `${INTELLIGENCE_BASE_URL}/voice-dna/${id}`
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async getVoiceDnaByBrandVoice(
    brandVoiceId: string
  ): Promise<SuccessResponse<VoiceDNA>> {
    const response = await httpClient.get<VoiceDNA>(
      `${INTELLIGENCE_BASE_URL}/voice-dna/brand-voice/${brandVoiceId}`
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async addFewShotExample(
    id: string,
    data: AddFewShotExampleDto
  ): Promise<SuccessResponse<VoiceDNA>> {
    const response = await httpClient.post<VoiceDNA>(
      `${INTELLIGENCE_BASE_URL}/voice-dna/${id}/few-shot`,
      data
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async deleteFewShotExample(
    id: string,
    index: number
  ): Promise<SuccessResponse<void>> {
    const response = await httpClient.delete<void>(
      `${INTELLIGENCE_BASE_URL}/voice-dna/${id}/few-shot/${index}`
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async addNegativeExample(
    id: string,
    data: AddFewShotExampleDto
  ): Promise<SuccessResponse<VoiceDNA>> {
    const response = await httpClient.post<VoiceDNA>(
      `${INTELLIGENCE_BASE_URL}/voice-dna/${id}/negative-example`,
      data
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async deleteNegativeExample(
    id: string,
    index: number
  ): Promise<SuccessResponse<void>> {
    const response = await httpClient.delete<void>(
      `${INTELLIGENCE_BASE_URL}/voice-dna/${id}/negative-example/${index}`
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async reanalyzeVoiceDna(
    id: string,
    data: ReanalyzVoiceDnaDto
  ): Promise<SuccessResponse<VoiceDNA>> {
    const response = await httpClient.post<VoiceDNA>(
      `${INTELLIGENCE_BASE_URL}/voice-dna/${id}/reanalyze`,
      data
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async triggerAutoInfer(
    data: TriggerAutoInferDto
  ): Promise<SuccessResponse<VoiceDNA>> {
    const response = await httpClient.post<VoiceDNA>(
      `${INTELLIGENCE_BASE_URL}/voice-dna/auto-infer`,
      data
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async processFeedback(
    data: VoiceFeedbackDto
  ): Promise<SuccessResponse<void>> {
    const response = await httpClient.post<void>(
      `${INTELLIGENCE_BASE_URL}/voice-dna/feedback`,
      data
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async adjustVoice(
    id: string,
    data: AdjustVoiceDto
  ): Promise<SuccessResponse<VoiceDNA>> {
    const response = await httpClient.post<VoiceDNA>(
      `${INTELLIGENCE_BASE_URL}/voice-dna/${id}/adjust`,
      data
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  // Memory
  static async getMemoryStats(
    botId: string
  ): Promise<SuccessResponse<MemoryStats>> {
    const response = await httpClient.get<MemoryStats>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/memory/stats`
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async getTrackedUsers(
    botId: string,
    params?: MemoryUsersParamsDto
  ): Promise<SuccessResponse<TrackedUser[]>> {
    const response = await httpClient.get<TrackedUser[]>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/memory/users`,
      { params: params as any }
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async searchEntities(
    botId: string,
    query: string
  ): Promise<SuccessResponse<MemoryEntity[]>> {
    const response = await httpClient.get<MemoryEntity[]>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/memory/search`,
      { params: { q: query } }
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  // LLM Config
  static async getUserConfig(): Promise<SuccessResponse<UserLlmConfig>> {
    const response = await httpClient.get<UserLlmConfig>(
      `${INTELLIGENCE_BASE_URL}/llm-config`
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async getLlmDefaults(): Promise<SuccessResponse<any>> {
    const response = await httpClient.get<any>(
      `${INTELLIGENCE_BASE_URL}/llm-config/defaults`
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async updateUserConfig(
    data: Partial<UserLlmConfig>
  ): Promise<SuccessResponse<UserLlmConfig>> {
    const response = await httpClient.patch<UserLlmConfig>(
      `${INTELLIGENCE_BASE_URL}/llm-config`,
      data
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  // Analytics
  static async getIntelligenceAnalytics(
    params: any
  ): Promise<SuccessResponse<any>> {
    const response = await httpClient.get<any>(
      `${INTELLIGENCE_BASE_URL}/analytics`,
      { params }
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async getQualityAnalytics(params: any): Promise<SuccessResponse<any>> {
    const response = await httpClient.get<any>(
      `${INTELLIGENCE_BASE_URL}/quality`,
      { params }
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  // Flagged Replies
  static async getFlaggedReplies(
    botId: string,
    params?: any
  ): Promise<SuccessResponse<any>> {
    const response = await httpClient.get<any>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/flagged-replies`,
      { params }
    );
    if (response.error) throw response.error;
    return response.data!;
  }
}

export const intelligenceApi = new IntelligenceApi();
