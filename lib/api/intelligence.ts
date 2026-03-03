import { httpClient, SuccessResponse } from '../http/client';
import {
  Bot,
  CreateBotDto,
  UpdateBotDto,
  KnowledgeSource,
  VoiceDNA,
  MemoryEntry,
} from '../types/intelligence';

const INTELLIGENCE_BASE_URL = '/api/intelligence';

export class IntelligenceApi {
  // Bots
  static async getBots(params?: {
    cursor?: string;
  }): Promise<SuccessResponse<Bot[]>> {
    const searchParams = new URLSearchParams();
    if (params?.cursor) {
      searchParams.set('cursor', params.cursor);
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

  // Knowledge Sources
  static async addKnowledgeSource(
    botId: string,
    data: {
      source_type: 'url' | 'text' | 'document';
      content: string;
      title?: string;
    }
  ): Promise<SuccessResponse<KnowledgeSource>> {
    const response = await httpClient.post<KnowledgeSource>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/knowledge-sources`,
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
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/knowledge-sources/${sourceId}`
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  // Voice DNA
  static async getVoiceDNA(botId: string): Promise<SuccessResponse<VoiceDNA>> {
    const response = await httpClient.get<VoiceDNA>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/voice-dna`
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async refineVoiceDNA(
    botId: string,
    data: {
      few_shot_examples?: Array<{ input: string; output: string }>;
      negative_examples?: Array<{
        input: string;
        bad_output: string;
        reason: string;
      }>;
    }
  ): Promise<SuccessResponse<VoiceDNA>> {
    const response = await httpClient.post<VoiceDNA>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/voice-dna/refine`,
      data
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  // Memory
  static async getMemory(
    botId: string
  ): Promise<SuccessResponse<MemoryEntry[]>> {
    const response = await httpClient.get<MemoryEntry[]>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/memory`
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async addMemoryEntry(
    botId: string,
    data: {
      key: string;
      value: string;
      category?: string;
    }
  ): Promise<SuccessResponse<MemoryEntry>> {
    const response = await httpClient.post<MemoryEntry>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/memory`,
      data
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async deleteMemoryEntry(
    botId: string,
    entryId: string
  ): Promise<SuccessResponse<void>> {
    const response = await httpClient.delete<void>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/memory/${entryId}`
    );
    if (response.error) throw response.error;
    return response.data!;
  }
}

export const intelligenceApi = new IntelligenceApi();
