export interface InstagramComment {
  readonly id: string;
  readonly text: string;
  readonly username: string;
  readonly timestamp: string;
  readonly like_count: number;
  readonly replies?: readonly InstagramComment[];
}

export interface InstagramInsight {
  readonly name: string;
  readonly period: string;
  readonly values: readonly {
    readonly value: number;
    readonly end_time: string;
  }[];
  readonly title: string;
  readonly description: string;
}

export interface CreateMediaContainerPayload {
  readonly social_account_id: string;
  readonly media_type?: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'REELS' | 'STORIES';
  readonly image_url?: string;
  readonly video_url?: string;
  readonly caption?: string;
  readonly location_id?: string;
}

export interface PublishMediaPayload {
  readonly social_account_id: string;
  readonly container_id: string;
}
