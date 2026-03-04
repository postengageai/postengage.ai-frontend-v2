export interface InstagramUser {
  id: string;
  username: string;
}

export interface InstagramComment {
  id: string;
  text: string;
  timestamp: string;
  from?: InstagramUser;
  like_count?: number;
  replies?: InstagramComment[];
}

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  username?: string;
  owner?: InstagramUser;
  is_comment_enabled?: boolean;
  is_shared_to_feed?: boolean;
  shortcode?: string;
  video_title?: string;
}

export interface InstagramInsightValue {
  value: number;
  end_time?: string;
}

export interface InstagramInsight {
  id: string;
  name: string;
  period: string;
  values: InstagramInsightValue[];
  title?: string;
  description?: string;
}

export interface CreateMediaContainerPayload {
  social_account_id: string;
  media_type?: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'REELS' | 'STORIES';
  image_url?: string;
  video_url?: string;
  caption?: string;
  location_id?: string;
}

export interface PublishMediaPayload {
  social_account_id: string;
  container_id: string;
}
