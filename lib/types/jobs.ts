export type JobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type JobType =
  | 'lead_export'
  | 'lead_import'
  | 'report_generation'
  | 'bulk_automation_update'
  | 'account_data_export';

export interface Job {
  job_id: string;
  status: JobStatus;
  type: JobType;
  progress: number;
  result?: {
    export_url?: string;
    record_count?: number;
    file_size_bytes?: number;
    [key: string]: unknown;
  };
  error?: {
    code: string;
    message: string;
  };
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface JobListParams {
  page?: number;
  per_page?: number;
  status?: JobStatus;
  type?: JobType;
}
