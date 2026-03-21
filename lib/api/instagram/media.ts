import { httpClient, SuccessResponse } from '../../http/client';

const INSTAGRAM_MEDIA_BASE_URL = '/api/v1/instagram/media';

export interface CarouselChild {
  id: string;
  media_type: 'IMAGE' | 'VIDEO';
  media_url: string;
  thumbnail_url?: string;
}

export interface MediaComment {
  id: string;
  text: string;
  timestamp: string;
  username?: string;
  like_count?: number;
  replies?: { data: MediaComment[] };
}

export interface GetMediaResponse {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'REELS' | 'STORIES';
  media_url: string;
  caption?: string;
  timestamp: string;
  permalink: string;
  like_count?: number;
  comments_count?: number;
  thumbnail_url?: string;
  children?: { data: CarouselChild[] };
}

export interface GetMediaParams {
  social_account_id: string;
  fields?: string;
}

export interface GetMediaListParams {
  social_account_id: string;
  fields?: string;
  limit?: number;
  after?: string;
  before?: string;
}

export interface GetCommentsParams {
  social_account_id: string;
  after?: string;
  limit?: number;
}

export class InstagramMediaApi {
  /**
   * Retrieves a list of Instagram media objects.
   *
   * @param params Query parameters including social_account_id (required).
   * @returns The list of media objects and pagination info.
   */
  static async getMediaList(
    params: GetMediaListParams
  ): Promise<SuccessResponse<GetMediaResponse[]>> {
    const response = await httpClient.get<GetMediaResponse[]>(
      INSTAGRAM_MEDIA_BASE_URL,
      {
        params: {
          social_account_id: params.social_account_id,
          fields: params.fields,
          limit: params.limit,
          after: params.after,
          before: params.before,
        },
      }
    );
    return response.data!;
  }

  /**
   * Retrieves detailed information about a specific Instagram media object.
   *
   * @param mediaId The Instagram Media ID to retrieve.
   * @param params Query parameters including social_account_id (required) and fields (optional).
   * @returns The media details.
   */
  static async getMedia(
    mediaId: string,
    params: GetMediaParams
  ): Promise<SuccessResponse<GetMediaResponse>> {
    const response = await httpClient.get<GetMediaResponse>(
      `${INSTAGRAM_MEDIA_BASE_URL}/${mediaId}`,
      {
        params: {
          social_account_id: params.social_account_id,
          fields: params.fields,
        },
      }
    );
    return response.data!;
  }

  /**
   * Retrieves paginated comments for a specific Instagram media object.
   */
  static async getComments(
    mediaId: string,
    params: GetCommentsParams
  ): Promise<SuccessResponse<MediaComment[]>> {
    const response = await httpClient.get<MediaComment[]>(
      `${INSTAGRAM_MEDIA_BASE_URL}/${mediaId}/comments`,
      { params }
    );
    return response.data!;
  }
}
