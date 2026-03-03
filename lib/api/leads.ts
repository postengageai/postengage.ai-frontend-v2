import { httpClient, SuccessResponse } from '../http/client';
import {
  Lead,
  CreateLeadPayload,
  LeadExportPayload,
  LeadExportResult,
  AddLeadTagsPayload,
} from '@/lib/types/leads';

const LEADS_BASE_URL = '/api/leads';

export interface LeadsListParams {
  status?: string;
  platform?: string;
  tags?: string[];
  search?: string;
  cursor?: string;
  limit?: number;
  direction?: 'forward' | 'backward';
}

export class LeadsApi {
  static async getLeads(
    params?: LeadsListParams
  ): Promise<SuccessResponse<Lead[]>> {
    const response = await httpClient.get<Lead[]>(LEADS_BASE_URL, {
      params,
    });
    return response.data!;
  }

  static async createLead(
    payload: CreateLeadPayload
  ): Promise<SuccessResponse<Lead>> {
    const response = await httpClient.post<Lead>(LEADS_BASE_URL, payload);
    return response.data!;
  }

  static async getLeadById(id: string): Promise<SuccessResponse<Lead>> {
    const response = await httpClient.get<Lead>(`${LEADS_BASE_URL}/${id}`);
    return response.data!;
  }

  static async exportLeads(
    payload: LeadExportPayload
  ): Promise<SuccessResponse<LeadExportResult>> {
    const response = await httpClient.post<LeadExportResult>(
      `${LEADS_BASE_URL}/export`,
      payload
    );
    return response.data!;
  }

  static async addLeadTags(
    id: string,
    payload: AddLeadTagsPayload
  ): Promise<SuccessResponse<Lead>> {
    const response = await httpClient.patch<Lead>(
      `${LEADS_BASE_URL}/${id}/tags`,
      payload
    );
    return response.data!;
  }
}

export const leadsApi = {
  getLeads: LeadsApi.getLeads,
  createLead: LeadsApi.createLead,
  getLeadById: LeadsApi.getLeadById,
  exportLeads: LeadsApi.exportLeads,
  addLeadTags: LeadsApi.addLeadTags,
};
