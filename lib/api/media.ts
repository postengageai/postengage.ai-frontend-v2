import { httpClient, SuccessResponse } from '../http/client';
import { Media, ListMediaParams } from '../types/media';

const MEDIA_BASE_URL = '/api/media';

export class MediaApi {
  static async list(
    params?: ListMediaParams
  ): Promise<SuccessResponse<Media[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) {
      searchParams.set('page', String(params.page));
    }
    if (params?.per_page) {
      searchParams.set('per_page', String(params.per_page));
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
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<SuccessResponse<Media>> {
    const formData = new FormData();
    formData.append('file', file);

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

  static async delete(id: string): Promise<SuccessResponse<void>> {
    const response = await httpClient.delete<void>(`${MEDIA_BASE_URL}/${id}`);
    if (response.error) throw response.error;
    return response.data!;
  }
}

export const mediaApi = new MediaApi();
