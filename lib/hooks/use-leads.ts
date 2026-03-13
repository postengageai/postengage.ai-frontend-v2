import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { LeadsApi } from '../api/leads';
import type {
  GetLeadsParams,
  CreateLeadRequest,
  UpdateLeadTagsRequest,
  AddSocialProfileRequest,
} from '../types/leads';
import { queryKeys } from './query-keys';

// ── List ───────────────────────────────────────────────────────────────────────

export function useLeads(params: GetLeadsParams = {}) {
  return useQuery({
    queryKey: queryKeys.leads.list(params as Record<string, unknown>),
    queryFn: () => LeadsApi.getLeads(params),
    // Keep showing old page data while the next page loads (no blank flash)
    placeholderData: keepPreviousData,
    staleTime: 30 * 1_000,
    select: (res) => res.data,
  });
}

// ── Single lead ────────────────────────────────────────────────────────────────

export function useLead(id: string) {
  return useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: () => LeadsApi.getLead(id),
    enabled: Boolean(id),
    select: (res) => res.data,
  });
}

// ── Tags ───────────────────────────────────────────────────────────────────────

export function useLeadTags() {
  return useQuery({
    queryKey: queryKeys.leads.tags(),
    queryFn: () => LeadsApi.getLeadTags(),
    staleTime: 5 * 60 * 1_000,
    select: (res) => res.data,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────────

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeadRequest) => LeadsApi.createLead(data),
    onSuccess: () => {
      // Invalidate all lead lists so new lead appears
      qc.invalidateQueries({ queryKey: queryKeys.leads.lists() });
      qc.invalidateQueries({ queryKey: queryKeys.leads.tags() });
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => LeadsApi.deleteLead(id),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: queryKeys.leads.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.leads.lists() });
    },
  });
}

export function useUpdateLeadTags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadTagsRequest }) =>
      LeadsApi.updateLeadTags(id, data),
    onSuccess: (res, { id }) => {
      qc.setQueryData(queryKeys.leads.detail(id), res);
      qc.invalidateQueries({ queryKey: queryKeys.leads.lists() });
      qc.invalidateQueries({ queryKey: queryKeys.leads.tags() });
    },
  });
}

export function useAddSocialProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      leadId,
      data,
    }: {
      leadId: string;
      data: AddSocialProfileRequest;
    }) => LeadsApi.addSocialProfile(leadId, data),
    onSuccess: (res, { leadId }) => {
      qc.setQueryData(queryKeys.leads.detail(leadId), res);
    },
  });
}

export function useRemoveSocialProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      leadId,
      profileId,
    }: {
      leadId: string;
      profileId: string;
    }) => LeadsApi.removeSocialProfile(leadId, profileId),
    onSuccess: (res, { leadId }) => {
      qc.setQueryData(queryKeys.leads.detail(leadId), res);
    },
  });
}

export function useSetPrimaryProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      leadId,
      profileId,
    }: {
      leadId: string;
      profileId: string;
    }) => LeadsApi.setPrimaryProfile(leadId, profileId),
    onSuccess: (res, { leadId }) => {
      qc.setQueryData(queryKeys.leads.detail(leadId), res);
    },
  });
}
