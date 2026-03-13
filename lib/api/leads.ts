import { httpClient, SuccessResponse } from '../http/client';
import type {
  Lead,
  LeadsResponse,
  GetLeadsParams,
  CreateLeadRequest,
  UpdateLeadTagsRequest,
  ExportLeadsParams,
  LeadTag,
  AddSocialProfileRequest,
} from '../types/leads';

const BASE = '/api/v1/leads';

// ── Response normaliser ───────────────────────────────────────────────────────
// The backend returns paginated data under `data` + `pagination`.
// Single-item endpoints return `{ data: Lead }`.
// We adapt both shapes here.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface PaginatedLeadsResponse {
  data:
    | {
        leads?: Lead[];
        // backend may return data[] or leads[]
        data?: Lead[];
      }
    | Lead[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    total_pages?: number;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalisePaginated(raw: any): SuccessResponse<LeadsResponse> {
  // Backend findPaginated returns { data: Lead[], pagination: {...} }
  const items: Lead[] = Array.isArray(raw.data)
    ? raw.data
    : (raw.data?.data ?? raw.data?.leads ?? []);

  const pagination = raw.pagination ?? {};

  return {
    success: true,
    data: {
      leads: items,
      total: pagination.total ?? items.length,
      page: pagination.page ?? 1,
      per_page: pagination.limit ?? items.length,
      total_pages: pagination.total_pages ?? 1,
    },
    meta: raw.meta,
  };
}

export class LeadsApi {
  static async getLeads(
    params?: GetLeadsParams
  ): Promise<SuccessResponse<LeadsResponse>> {
    const q: Record<string, unknown> = { ...params };
    if (params?.tags?.length) q.tags = params.tags.join(',');
    if (params?.platform === 'all') delete q.platform;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await httpClient.get<any>(BASE, { params: q });
    return normalisePaginated(response.data);
  }

  static async getLead(id: string): Promise<SuccessResponse<Lead>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await httpClient.get<any>(`${BASE}/${id}`);
    const lead: Lead = response.data?.data ?? response.data;
    return { success: true, data: lead, meta: response.data?.meta! };
  }

  static async createLead(
    data: CreateLeadRequest
  ): Promise<SuccessResponse<Lead>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await httpClient.post<any>(BASE, data);
    const lead: Lead = response.data?.data ?? response.data;
    return { success: true, data: lead, meta: response.data?.meta! };
  }

  static async deleteLead(id: string): Promise<void> {
    await httpClient.delete(`${BASE}/${id}`);
  }

  // ── Tags ──────────────────────────────────────────────────────────────────

  static async updateLeadTags(
    id: string,
    data: UpdateLeadTagsRequest
  ): Promise<SuccessResponse<Lead>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await httpClient.patch<any>(`${BASE}/${id}/tags`, data);
    const lead: Lead = response.data?.data ?? response.data;
    return { success: true, data: lead, meta: response.data?.meta! };
  }

  static async getLeadTags(): Promise<SuccessResponse<LeadTag[]>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await httpClient.get<any>(`${BASE}/tags`);
    const tags: LeadTag[] = response.data?.data ?? response.data ?? [];
    return { success: true, data: tags, meta: response.data?.meta! };
  }

  // ── Social profiles ───────────────────────────────────────────────────────

  static async addSocialProfile(
    leadId: string,
    data: AddSocialProfileRequest
  ): Promise<SuccessResponse<Lead>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await httpClient.post<any>(
      `${BASE}/${leadId}/social-profiles`,
      data
    );
    const lead: Lead = response.data?.data ?? response.data;
    return { success: true, data: lead, meta: response.data?.meta! };
  }

  static async removeSocialProfile(
    leadId: string,
    profileId: string
  ): Promise<SuccessResponse<Lead>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await httpClient.delete<any>(
      `${BASE}/${leadId}/social-profiles/${profileId}`
    );
    const lead: Lead = response.data?.data ?? response.data;
    return { success: true, data: lead, meta: response.data?.meta! };
  }

  static async setPrimaryProfile(
    leadId: string,
    profileId: string
  ): Promise<SuccessResponse<Lead>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await httpClient.patch<any>(
      `${BASE}/${leadId}/social-profiles/${profileId}/primary`,
      {}
    );
    const lead: Lead = response.data?.data ?? response.data;
    return { success: true, data: lead, meta: response.data?.meta! };
  }

  // ── Export ────────────────────────────────────────────────────────────────

  static async exportLeads(params: ExportLeadsParams): Promise<Blob> {
    const body = { ...params };
    if (body.platform === 'all') delete body.platform;

    const response = await httpClient.post<Blob>(`${BASE}/export`, body, {
      responseType: 'blob',
    });
    return response.data as unknown as Blob;
  }
}
