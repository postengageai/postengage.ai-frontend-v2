import { httpClient, SuccessResponse } from '../http/client';
import {
  Automation,
  CreateAutomationDto,
  AutomationTriggerType,
  AutomationActionType,
  AutomationStatus,
  AutomationPlatform,
  type AutomationStatusType,
  type AutomationPlatformType,
  TriggerConfig,
  ActionConfig,
  ConditionConfig,
  // New Payload Types
  ReplyCommentPayload,
  SendDmPayload,
  PrivateReplyPayload,
  SendDmTextMessage,
  SendDmTextPayload,
  SendDmMediaMessage,
  SendDmMediaPayload,
  ActionPayload,
} from '../types/automation-builder';

const AUTOMATIONS_BASE_URL = '/api/v1/automations';

// Re-export types and constants
export {
  AutomationTriggerType as TriggerType,
  AutomationActionType as ActionType,
  AutomationStatus,
  AutomationPlatform,
};

export type {
  Automation,
  CreateAutomationDto,
  TriggerConfig,
  ActionConfig,
  ConditionConfig,
};

// Legacy type aliases for backward compatibility with wizard components
export type CreateAutomationRequest = CreateAutomationDto;
export type AutomationActionPayload = ActionPayload;
export type {
  SendDmPayload,
  ReplyCommentPayload,
  PrivateReplyPayload,
  SendDmTextMessage,
  SendDmTextPayload,
  SendDmMediaMessage,
  SendDmMediaPayload,
};
export type AutomationActionResponse = ActionConfig;

export interface CursorPaginationMeta {
  cursor?: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
}

export interface AutomationListParams {
  status?: AutomationStatusType | string;
  platform?: AutomationPlatformType;
  search?: string;
  cursor?: string;
  limit?: number;
  direction?: 'forward' | 'backward';
}

export interface AutomationListResponse {
  data: Automation[];
  pagination: CursorPaginationMeta;
}

export interface AutomationExecution {
  _id: string;
  automation_id: string;
  trigger_event_id: string;
  status: 'success' | 'failed' | 'skipped' | 'partial_success';
  error_message?: string;
  duration_ms: number;
  executed_at: string;
  transaction_id?: string;
  trigger_data?: {
    username?: string;
    full_name?: string;
    text?: string;
    media_url?: string;
    [key: string]: unknown;
  };
  credits_used?: number;
}

export class AutomationsApi {
  // Create automation
  static async create(
    request: CreateAutomationDto
  ): Promise<SuccessResponse<Automation>> {
    const response = await httpClient.post<Automation>(
      AUTOMATIONS_BASE_URL,
      request
    );
    return response.data!;
  }

  // Update automation
  static async update(
    id: string,
    request: Partial<CreateAutomationDto>
  ): Promise<SuccessResponse<Automation>> {
    const response = await httpClient.patch<Automation>(
      `${AUTOMATIONS_BASE_URL}/${id}`,
      request
    );
    return response.data!;
  }

  // Delete automation
  static async delete(id: string): Promise<void> {
    await httpClient.delete(`${AUTOMATIONS_BASE_URL}/${id}`);
  }

  // Get automation by ID
  static async get(id: string): Promise<SuccessResponse<Automation>> {
    const response = await httpClient.get<Automation>(
      `${AUTOMATIONS_BASE_URL}/${id}`
    );
    return response.data!;
  }

  // List automations
  static async list(
    params?: AutomationListParams
  ): Promise<SuccessResponse<AutomationListResponse>> {
    const response = await httpClient.get<AutomationListResponse>(
      AUTOMATIONS_BASE_URL,
      {
        params,
      }
    );
    return response.data!;
  }

  // Activate automation
  static async activate(id: string): Promise<SuccessResponse<Automation>> {
    const response = await httpClient.post<Automation>(
      `${AUTOMATIONS_BASE_URL}/${id}/activate`
    );
    return response.data!;
  }

  // Deactivate automation
  static async deactivate(id: string): Promise<SuccessResponse<Automation>> {
    const response = await httpClient.post<Automation>(
      `${AUTOMATIONS_BASE_URL}/${id}/deactivate`
    );
    return response.data!;
  }
}

// Hook-friendly API functions
export const automationsApi = {
  create: AutomationsApi.create,
  update: AutomationsApi.update,
  delete: AutomationsApi.delete,
  get: AutomationsApi.get,
  list: AutomationsApi.list,
  activate: AutomationsApi.activate,
  deactivate: AutomationsApi.deactivate,
};
