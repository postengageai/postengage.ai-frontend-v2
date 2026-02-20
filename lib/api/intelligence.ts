import { httpClient, SuccessResponse } from '../http/client';
import {
  Bot,
  CreateBotDto,
  UpdateBotDto,
  KnowledgeSource,
  AddKnowledgeSourceDto,
  UserLlmConfig,
  UpdateUserLlmConfigDto,
} from '../types/intelligence';

const INTELLIGENCE_BASE_URL = '/api/v1/intelligence';

export class IntelligenceApi {
  // Bots
  static async getBots(): Promise<SuccessResponse<Bot[]>> {
    const response = await httpClient.get<Bot[]>(
      `${INTELLIGENCE_BASE_URL}/bots`
    );
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
}
