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

  // Get single media
  static async get(id: string): Promise<SuccessResponse<Media>> {
    const response = await httpClient.get<Media>(`${MEDIA_BASE_URL}/${id}`);
    return response.data!;
  }

  // Delete media
  static async delete(id: string): Promise<void> {
    await httpClient.delete<void>(`${MEDIA_BASE_URL}/${id}`);
  }
}
