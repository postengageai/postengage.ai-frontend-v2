import { httpClient, SuccessResponse } from '../http/client';
import { Job, JobListParams } from '../types/jobs';

const JOBS_BASE_URL = '/api/jobs';

export class JobsApi {
  static async get(id: string): Promise<SuccessResponse<Job>> {
    const response = await httpClient.get<Job>(`${JOBS_BASE_URL}/${id}`);
    if (response.error) throw response.error;
    return response.data!;
  }

  static async list(params?: JobListParams): Promise<SuccessResponse<Job[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) {
      searchParams.set('page', String(params.page));
    }
    if (params?.per_page) {
      searchParams.set('per_page', String(params.per_page));
    }

    const query = searchParams.toString();
    const url = query ? `${JOBS_BASE_URL}?${query}` : JOBS_BASE_URL;

    const response = await httpClient.get<Job[]>(url);
    if (response.error) throw response.error;
    return response.data!;
  }

  static async cancel(id: string): Promise<SuccessResponse<void>> {
    const response = await httpClient.delete<void>(`${JOBS_BASE_URL}/${id}`);
    if (response.error) throw response.error;
    return response.data!;
  }
}

export const jobsApi = new JobsApi();
