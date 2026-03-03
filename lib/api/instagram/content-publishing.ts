import { httpClient, SuccessResponse } from '../../http/client';
import {
  CreateMediaContainerPayload,
  PublishMediaPayload,
} from '@/lib/types/instagram';

const CONTENT_PUBLISHING_BASE_URL = '/api/instagram/content-publishing';

export interface MediaContainerStatus {
  container_id: string;
  status: 'PENDING' | 'FINISHED' | 'FAILED' | 'EXPIRED';
  error_message?: string;
}

export interface PublishingLimits {
  max_containers_per_hour: number;
  containers_created_this_hour: number;
  remaining: number;
  reset_at: string;
}

export class InstagramContentPublishingApi {
  static async createMediaContainer(
    payload: CreateMediaContainerPayload
  ): Promise<SuccessResponse<{ container_id: string }>> {
    const response = await httpClient.post<{ container_id: string }>(
      `${CONTENT_PUBLISHING_BASE_URL}/containers`,
      payload
    );
    return response.data!;
  }

  static async publishMedia(
    payload: PublishMediaPayload
  ): Promise<SuccessResponse<{ media_id: string }>> {
    const response = await httpClient.post<{ media_id: string }>(
      `${CONTENT_PUBLISHING_BASE_URL}/publish`,
      payload
    );
    return response.data!;
  }

  static async getContainerStatus(
    containerId: string,
    params?: Record<string, unknown>
  ): Promise<SuccessResponse<MediaContainerStatus>> {
    const response = await httpClient.get<MediaContainerStatus>(
      `${CONTENT_PUBLISHING_BASE_URL}/containers/${containerId}/status`,
      {
        params,
      }
    );
    return response.data!;
  }

  static async getPublishingLimits(
    params?: Record<string, unknown>
  ): Promise<SuccessResponse<PublishingLimits>> {
    const response = await httpClient.get<PublishingLimits>(
      `${CONTENT_PUBLISHING_BASE_URL}/limits`,
      {
        params,
      }
    );
    return response.data!;
  }
}

export const instagramContentPublishingApi = {
  createMediaContainer: InstagramContentPublishingApi.createMediaContainer,
  publishMedia: InstagramContentPublishingApi.publishMedia,
  getContainerStatus: InstagramContentPublishingApi.getContainerStatus,
  getPublishingLimits: InstagramContentPublishingApi.getPublishingLimits,
};
