export interface Media {
  id: string;
  name: string;
  original_name: string;
  size_bytes: number;
  description?: string | null;
  mime_type: string;
  url: string;
  thumbnail_url?: string | null;
  width?: number | null;
  height?: number | null;
  duration_seconds?: number | null;
  status: 'active' | 'inactive' | 'processing' | 'failed';
  tags: string[];
  category?: string | null;
  alt_text?: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  _links?: Record<string, { href: string; method?: string }>;
  size?: number;
}

export interface ListMediaParams {
  page?: number;
  limit?: number;
  type?: string;
  search?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
