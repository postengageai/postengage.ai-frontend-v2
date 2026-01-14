import { httpClient, SuccessResponse } from '../http/client';
import {
  AutomationPlatformType,
  AutomationStatusType,
  AutomationExecutionModeType,
  AutomationTriggerTypeType,
  AutomationTriggerSourceType,
  AutomationTriggerScopeType,
  AutomationConditionTypeType,
  AutomationConditionOperatorType,
  AutomationConditionKeywordModeType,
  AutomationConditionSourceType,
  AutomationActionTypeType,
} from '../constants/automations';

const AUTOMATIONS_BASE_URL = '/api/v1/automations';

export type AutomationPlatform = AutomationPlatformType;
export type AutomationStatus = AutomationStatusType;
export type AutomationExecutionMode = AutomationExecutionModeType;

export type AutomationTriggerType = AutomationTriggerTypeType;
export type AutomationTriggerSource = AutomationTriggerSourceType;
export type AutomationTriggerScope = AutomationTriggerScopeType;

export type AutomationConditionType = AutomationConditionTypeType;
export type AutomationConditionOperator = AutomationConditionOperatorType;
export type AutomationConditionKeywordMode = AutomationConditionKeywordModeType;
export type AutomationConditionSource = AutomationConditionSourceType;

export type AutomationActionType = AutomationActionTypeType;
export type AutomationActionStatus = 'active' | 'inactive';

export interface AutomationTriggerConfig {
  include_reply_to_comments?: boolean;
  exclude_keywords?: string[];
  match_keywords?: string[];
  ignore_verified_users?: boolean;
  ignore_business_accounts?: boolean;
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface AutomationTrigger {
  trigger_type: AutomationTriggerType;
  trigger_source?: AutomationTriggerSource;
  trigger_scope?: AutomationTriggerScope;
  content_ids?: string[];
  trigger_config?: AutomationTriggerConfig;
}

export interface AutomationTriggerResponse extends AutomationTrigger {
  id: string;
  status: AutomationStatus;
  created_at: string;
  updated_at: string;
}

export interface AutomationActionPayload {
  text?: string;
  variations?: string[];
  hide_comment?: boolean;
  attachment_url?: string;
  attachment_id?: string;
  attachment_type?: 'image' | 'video' | 'file';
  cta_buttons?: { label: string; url: string }[];
  tag_name?: string;
  create_if_missing?: boolean;
  message?: string;
  email?: string;
  [key: string]:
    | string
    | number
    | boolean
    | string[]
    | { label: string; url: string }[]
    | undefined;
}

export interface AutomationAction {
  action_type: AutomationActionType;
  execution_order: number;
  delay_seconds?: number;
  status?: AutomationActionStatus;
  action_payload: AutomationActionPayload;
}

export interface AutomationActionResponse extends AutomationAction {
  id: string;
  created_at: string;
  updated_at: string;
}

export type ConditionValue =
  | string
  | number
  | boolean
  | string[]
  | { min?: number; max?: number }
  | { property: string; value: boolean };

export interface AutomationCondition {
  condition_type: AutomationConditionType;
  condition_operator: AutomationConditionOperator;
  condition_keyword_mode?: AutomationConditionKeywordMode;
  condition_source?: AutomationConditionSource;
  condition_value: ConditionValue;
  status?: AutomationStatus;
}

export interface AutomationConditionResponse extends AutomationCondition {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAutomationRequest {
  name: string;
  description?: string;
  social_account_id: string;
  platform: AutomationPlatform;
  status?: AutomationStatus;
  execution_mode: AutomationExecutionMode;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  conditions?: AutomationCondition[];
  is_template?: boolean;
  template_category?: string;
  template_tags?: string[];
}

export interface AutomationStatistics {
  success_rate: number;
  total_executions: number;
  estimated_cost_per_execution: number;
  last_7_days_executions: number;
  trend: 'active' | 'inactive';
}

export interface AutomationUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  is_verified: boolean;
  status: string;
  timezone?: string;
  language: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationSocialAccount {
  id: string;
  platform: string;
  username: string;
  connection_status: string;
  connected_at: string;
  is_active: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Automation {
  id: string;
  name: string;
  description?: string;
  platform: AutomationPlatform;
  status: AutomationStatus;
  execution_mode: AutomationExecutionMode;
  paused_reason?: string | null;
  scheduled_time?: string | null;
  delayed_minutes?: number | null;
  execution_count: number;
  success_count: number;
  failure_count: number;
  last_executed_at?: string | null;
  is_template: boolean;
  template_category?: string | null;
  template_tags: string[];
  statistics: AutomationStatistics;
  user?: AutomationUser;
  social_account?: AutomationSocialAccount;
  trigger: AutomationTriggerResponse;
  actions: AutomationActionResponse[];
  conditions: AutomationConditionResponse[];
  created_at: string;
  updated_at: string;
}

export interface AutomationListParams {
  status?: string;
  platform?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class AutomationsApi {
  static async create(
    request: CreateAutomationRequest
  ): Promise<SuccessResponse<Automation>> {
    const response = await httpClient.post<Automation>(
      AUTOMATIONS_BASE_URL,
      request
    );
    return response.data!;
  }

  static async update(
    id: string,
    request: Partial<CreateAutomationRequest>
  ): Promise<SuccessResponse<Automation>> {
    const response = await httpClient.patch<Automation>(
      `${AUTOMATIONS_BASE_URL}/${id}`,
      request
    );
    return response.data!;
  }

  static async get(id: string): Promise<SuccessResponse<Automation>> {
    const response = await httpClient.get<Automation>(
      `${AUTOMATIONS_BASE_URL}/${id}`
    );
    return response.data!;
  }

  static async list(
    params?: AutomationListParams
  ): Promise<SuccessResponse<Automation[]>> {
    const response = await httpClient.get<Automation[]>(AUTOMATIONS_BASE_URL, {
      params,
    });
    return response.data!;
  }
}

export const automationsApi = {
  create: AutomationsApi.create,
  update: AutomationsApi.update,
  get: AutomationsApi.get,
  list: AutomationsApi.list,
};
