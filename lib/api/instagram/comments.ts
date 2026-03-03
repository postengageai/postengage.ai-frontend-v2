import { httpClient, SuccessResponse } from '../../http/client';
import { InstagramComment } from '@/lib/types/instagram';

const COMMENTS_BASE_URL = '/api/instagram/comments';

export interface GetCommentsParams {
  limit?: number;
  after?: string;
  before?: string;
  fields?: string;
}

export interface HideCommentPayload {
  hidden: boolean;
}

export interface ReplyToCommentPayload {
  message: string;
}

export class InstagramCommentsApi {
  static async getComments(
    mediaId: string,
    params?: GetCommentsParams
  ): Promise<SuccessResponse<InstagramComment[]>> {
    const response = await httpClient.get<InstagramComment[]>(
      `${COMMENTS_BASE_URL}/media/${mediaId}`,
      {
        params,
      }
    );
    return response.data!;
  }

  static async getCommentById(
    commentId: string,
    params?: GetCommentsParams
  ): Promise<SuccessResponse<InstagramComment>> {
    const response = await httpClient.get<InstagramComment>(
      `${COMMENTS_BASE_URL}/${commentId}`,
      {
        params,
      }
    );
    return response.data!;
  }

  static async deleteComment(
    commentId: string,
    params?: GetCommentsParams
  ): Promise<void> {
    await httpClient.delete(`${COMMENTS_BASE_URL}/${commentId}`, { params });
  }

  static async hideComment(
    commentId: string,
    payload: HideCommentPayload
  ): Promise<SuccessResponse<InstagramComment>> {
    const response = await httpClient.post<InstagramComment>(
      `${COMMENTS_BASE_URL}/${commentId}/hide`,
      payload
    );
    return response.data!;
  }

  static async getCommentReplies(
    commentId: string,
    params?: GetCommentsParams
  ): Promise<SuccessResponse<InstagramComment[]>> {
    const response = await httpClient.get<InstagramComment[]>(
      `${COMMENTS_BASE_URL}/${commentId}/replies`,
      {
        params,
      }
    );
    return response.data!;
  }

  static async replyToComment(
    commentId: string,
    payload: ReplyToCommentPayload
  ): Promise<SuccessResponse<InstagramComment>> {
    const response = await httpClient.post<InstagramComment>(
      `${COMMENTS_BASE_URL}/${commentId}/replies`,
      payload
    );
    return response.data!;
  }
}

export const instagramCommentsApi = {
  getComments: InstagramCommentsApi.getComments,
  getCommentById: InstagramCommentsApi.getCommentById,
  deleteComment: InstagramCommentsApi.deleteComment,
  hideComment: InstagramCommentsApi.hideComment,
  getCommentReplies: InstagramCommentsApi.getCommentReplies,
  replyToComment: InstagramCommentsApi.replyToComment,
};
