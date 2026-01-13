import { httpClient, SuccessResponse } from '../../http/client';

const INSTAGRAM_MEDIA_BASE_URL = '/api/v1/instagram/media';

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

export interface GetMediaListResponse {
  data: GetMediaResponse[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
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
  ): Promise<SuccessResponse<GetMediaListResponse>> {
    const response = await httpClient.get<GetMediaListResponse>(
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
}
