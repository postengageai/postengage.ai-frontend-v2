import { httpClient, SuccessResponse } from '../http/client';
import type {
  MemoryStats,
  UserRelationshipMemory,
  MemoryEntity,
  MemoryUsersParams,
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

  static async getUserMemory(
    botId: string,
    platformUserId: string
  ): Promise<SuccessResponse<UserRelationshipMemory>> {
    const response = await httpClient.get<UserRelationshipMemory>(
      `${INTELLIGENCE_BASE_URL}/bots/${botId}/memory/users/${platformUserId}`
    );
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
}
