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

type RawLeadsData =
  | Lead[]
  | { readonly leads?: Lead[]; readonly data?: Lead[] };

function normalisePaginated(
  raw: SuccessResponse<RawLeadsData>
): SuccessResponse<LeadsResponse> {
  // Backend findPaginated returns { data: Lead[], pagination: {...} }
  const items: Lead[] = Array.isArray(raw.data)
    ? raw.data
    : (raw.data.data ?? raw.data.leads ?? []);

  const pagination = raw.pagination ?? {};

  return {
    ...raw,
    data: {
      leads: items,
      total: pagination.total ?? items.length,
      page: pagination.page ?? 1,
      per_page: pagination.limit ?? items.length,
      total_pages: pagination.total_pages ?? 1,
    },
  };
}

export class LeadsApi {
  static async getLeads(
    params?: GetLeadsParams
  ): Promise<SuccessResponse<LeadsResponse>> {
    // Build params explicitly to avoid sending unknown fields that would
    // trigger `forbidNonWhitelisted` on the backend. Also renames per_page
    // → limit because PaginationDto uses `limit` as the field name.
    const q: Record<string, unknown> = {};
    if (params?.page !== undefined) q.page = params.page;
    const pageSize = params?.limit ?? params?.per_page;
    if (pageSize !== undefined) q.limit = pageSize;
    if (params?.search) q.search = params.search;
    if (params?.platform && params.platform !== 'all')
      q.platform = params.platform;
    if (params?.tags?.length) q.tags = params.tags.join(',');

    const response = await httpClient.get<
      Lead[] | { data?: Lead[]; leads?: Lead[] }
    >(BASE, { params: q });
    return normalisePaginated(response.data!);
  }

  static async getLead(id: string): Promise<SuccessResponse<Lead>> {
    const response = await httpClient.get<Lead>(`${BASE}/${id}`);
    return response.data!;
  }

  static async createLead(
    data: CreateLeadRequest
  ): Promise<SuccessResponse<Lead>> {
    const response = await httpClient.post<Lead>(BASE, data);
    return response.data!;
  }

  static async deleteLead(id: string): Promise<void> {
    await httpClient.delete(`${BASE}/${id}`);
  }

  // ── Tags ──────────────────────────────────────────────────────────────────

  static async updateLeadTags(
    id: string,
    data: UpdateLeadTagsRequest
  ): Promise<SuccessResponse<Lead>> {
    const response = await httpClient.patch<Lead>(`${BASE}/${id}/tags`, data);
    return response.data!;
  }

  static async getLeadTags(): Promise<SuccessResponse<LeadTag[]>> {
    const response = await httpClient.get<LeadTag[]>(`${BASE}/tags`);
    return response.data!;
  }

  // ── Social profiles ───────────────────────────────────────────────────────

  static async addSocialProfile(
    leadId: string,
    data: AddSocialProfileRequest
  ): Promise<SuccessResponse<Lead>> {
    const response = await httpClient.post<Lead>(
      `${BASE}/${leadId}/social-profiles`,
      data
    );
    return response.data!;
  }

  static async removeSocialProfile(
    leadId: string,
    profileId: string
  ): Promise<SuccessResponse<Lead>> {
    const response = await httpClient.delete<Lead>(
      `${BASE}/${leadId}/social-profiles/${profileId}`
    );
    return response.data!;
  }

  static async setPrimaryProfile(
    leadId: string,
    profileId: string
  ): Promise<SuccessResponse<Lead>> {
    const response = await httpClient.patch<Lead>(
      `${BASE}/${leadId}/social-profiles/${profileId}/primary`,
      {}
    );
    return response.data!;
  }

  // ── Export ────────────────────────────────────────────────────────────────

  static async exportLeads(params: ExportLeadsParams): Promise<Blob> {
    const body = { ...params };
    if (body.platform === 'all') delete body.platform;

    const response = await httpClient.post<Blob>(`${BASE}/export`, body, {
      responseType: 'blob',
    });
    // For responseType:'blob', Axios returns raw binary data — not wrapped in
    // SuccessResponse. The type system can't represent this; the cast is correct.
    return response.data as unknown as Blob;
  }
}
