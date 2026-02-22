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
}
