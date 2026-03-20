import { httpClient, SuccessResponse } from '../http/client';
import type {
  MemoryStats,
  UserRelationshipMemory,
  MemoryEntity,
  MemoryUsersParams,
  SemanticMemory,
  SemanticMemoryStats,
  SemanticMemoryUsersResponse,
} from '../types/memory';

const INTELLIGENCE_BASE_URL = '/api/v1/intelligence';

export class MemoryApi {
  static async getMemoryStats(
    botId: string
  ): Promise<SuccessResponse<MemoryStats>> {
    const response = await httpClient.get<MemoryStats>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/memory/stats`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async getTrackedUsers(
    botId: string,
    params?: MemoryUsersParams
  ): Promise<SuccessResponse<UserRelationshipMemory[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.stage) searchParams.set('stage', params.stage);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.set('sort_order', params.sort_order);

    const query = searchParams.toString();
    const url = query
      ? `${INTELLIGENCE_BASE_URL}/bots/${botId}/memory/users?${query}`
      : `${INTELLIGENCE_BASE_URL}/bots/${botId}/memory/users`;

    const response = await httpClient.get<UserRelationshipMemory[]>(url);
    if (response.error) throw response.error;
    return response.data;
  }

  static async searchEntities(
    botId: string,
    query: string
  ): Promise<SuccessResponse<MemoryEntity[]>> {
    const response = await httpClient.get<MemoryEntity[]>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/memory/search?q=${encodeURIComponent(query)}`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  // ── Semantic Memory (pgvector) ───────────────────────────────────────────

  static async getSemanticStats(
    botId: string
  ): Promise<SuccessResponse<SemanticMemoryStats>> {
    const response = await httpClient.get<SemanticMemoryStats>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/memory/semantic/stats`
    );
    if (response.error) throw response.error;
    return response.data;
  }

  static async getSemanticUsers(
    botId: string,
    params?: { page?: number; limit?: number }
  ): Promise<SuccessResponse<SemanticMemoryUsersResponse>> {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const q = sp.toString();
    const url = q
      ? `${INTELLIGENCE_BASE_URL}/bots/${botId}/memory/semantic/users?${q}`
      : `${INTELLIGENCE_BASE_URL}/bots/${botId}/memory/semantic/users`;
    const response = await httpClient.get<SemanticMemoryUsersResponse>(url);
    if (response.error) throw response.error;
    return response.data;
  }

  static async getSemanticUserMemories(
    botId: string,
    platformUserId: string
  ): Promise<SuccessResponse<SemanticMemory[]>> {
    const response = await httpClient.get<SemanticMemory[]>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/memory/semantic/users/${encodeURIComponent(platformUserId)}`
    );
    if (response.error) throw response.error;
    return response.data;
  }
}
