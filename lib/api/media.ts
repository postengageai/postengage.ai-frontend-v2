import { httpClient, SuccessResponse } from '../http/client';
import type { Media, ListMediaParams } from '../types/media';

const MEDIA_BASE_URL = '/api/v1/media';

export type { Media };

export class MediaApi {
  static async list(
    params?: ListMediaParams
  ): Promise<SuccessResponse<Media[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) {
      searchParams.set('page', String(params.page));
    }
    if (params?.limit) {
      searchParams.set('limit', String(params.limit));
    }
    if (params?.type) {
      searchParams.set('type', params.type);
    }

    const query = searchParams.toString();
    const url = query ? `${MEDIA_BASE_URL}?${query}` : MEDIA_BASE_URL;

    const response = await httpClient.get<Media[]>(url);
    if (response.error) throw response.error;
    return response.data!;
  }

  static async upload(
    file: File,
    metadata?: {
      name?: string;
      description?: string;
      alt_text?: string;
      tags?: string[];
    },
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<SuccessResponse<Media>> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata?.name) formData.append('name', metadata.name);
    if (metadata?.description)
      formData.append('description', metadata.description);
    if (metadata?.alt_text) formData.append('alt_text', metadata.alt_text);
    if (metadata?.tags && Array.isArray(metadata.tags)) {
      metadata.tags.forEach(tag => formData.append('tags[]', tag));
    }

    const response = await httpClient.post<Media>(
      `${MEDIA_BASE_URL}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: progressEvent => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
        signal,
      }
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async get(id: string): Promise<SuccessResponse<Media>> {
    const response = await httpClient.get<Media>(`${MEDIA_BASE_URL}/${id}`);
    if (response.error) throw response.error;
    return response.data!;
  }

  static async update(
    id: string,
    payload: Partial<{
      name: string;
      description: string;
      alt_text: string;
      tags: string[];
    }>
  ): Promise<SuccessResponse<Media>> {
    const response = await httpClient.patch<Media>(
      `${MEDIA_BASE_URL}/${id}`,
      payload
    );
    if (response.error) throw response.error;
    return response.data!;
  }

  static async delete(id: string): Promise<SuccessResponse<void>> {
    const response = await httpClient.delete<void>(`${MEDIA_BASE_URL}/${id}`);
    if (response.error) throw response.error;
    return response.data!;
  }
}

export const mediaApi = new MediaApi();
