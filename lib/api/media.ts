import { httpClient, SuccessResponse } from '../http/client';

export interface Media {
  id: string;
  name: string;
  url: string;
  thumbnail_url?: string;
  mime_type: string;
  size: number;
  width?: number;
  height?: number;
  description?: string;
  alt_text?: string;
  category?: string;
  tags?: string[];
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface ListMediaParams {
  status?: string;
  category?: string;
  search?: string;
  social_account_id?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

const MEDIA_BASE_URL = '/api/v1/media';

export class MediaApi {
  // List media
  static async list(
    params?: ListMediaParams
  ): Promise<SuccessResponse<Media[]>> {
    const response = await httpClient.get<Media[]>(MEDIA_BASE_URL, {
      params,
    });
    return response.data!;
  }

  // Upload media
  static async upload(
    file: File,
    metadata?: {
      name?: string;
      description?: string;
      alt_text?: string;
      tags?: string[];
      category?: string;
    },
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<SuccessResponse<Media>> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      if (metadata.name) formData.append('name', metadata.name);
      if (metadata.description)
        formData.append('description', metadata.description);
      if (metadata.alt_text) formData.append('alt_text', metadata.alt_text);
      if (metadata.tags)
        metadata.tags.forEach(tag => formData.append('tags', tag));
      if (metadata.category) formData.append('category', metadata.category);
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
    return response.data!;
  }

  // Get single media
  static async get(id: string): Promise<SuccessResponse<Media>> {
    const response = await httpClient.get<Media>(`${MEDIA_BASE_URL}/${id}`);
    return response.data!;
  }

  // Update media
  static async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      alt_text?: string;
      tags?: string[];
      category?: string;
    }
  ): Promise<SuccessResponse<Media>> {
    const response = await httpClient.put<Media>(
      `${MEDIA_BASE_URL}/${id}`,
      data
    );
    return response.data!;
  }

  // Delete media
  static async delete(id: string): Promise<void> {
    await httpClient.delete<void>(`${MEDIA_BASE_URL}/${id}`);
  }
}
