export interface Media {
  id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  mime_type: string;
  size_bytes: number;
  dimensions?: {
    width: number;
    height: number;
  };
  duration_seconds?: number;
  description?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface ListMediaParams {
  page?: number;
  per_page?: number;
  type?: 'image' | 'video' | 'audio' | 'document';
}
