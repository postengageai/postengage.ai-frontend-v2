// Automation Builder Types - Based on API contract
import {
  AutomationTriggerType,
  type AutomationTriggerTypeType,
  AutomationTriggerSource,
  type AutomationTriggerSourceType,
  AutomationTriggerScope,
  type AutomationTriggerScopeType,
  AutomationActionType,
  type AutomationActionTypeType,
  AutomationStatus,
  type AutomationStatusType,
  AutomationPlatform,
  type AutomationPlatformType,
  AutomationExecutionMode,
  type AutomationExecutionModeType,
  AutomationConditionType,
  type AutomationConditionTypeType,
  AutomationConditionOperator,
  type AutomationConditionOperatorType,
  AutomationConditionKeywordMode,
  type AutomationConditionKeywordModeType,
  AutomationConditionSource,
  type AutomationConditionSourceType,
} from '@/lib/constants/automations';

// Re-export values
export {
  AutomationTriggerType,
  AutomationTriggerSource,
  AutomationTriggerScope,
  AutomationActionType,
  AutomationStatus,
  AutomationPlatform,
  AutomationExecutionMode,
  AutomationConditionType,
  AutomationConditionOperator,
  AutomationConditionKeywordMode,
  AutomationConditionSource,
};

export type {
  AutomationTriggerTypeType,
  AutomationTriggerSourceType,
  AutomationTriggerScopeType,
  AutomationActionTypeType,
  AutomationStatusType,
  AutomationPlatformType,
  AutomationExecutionModeType,
  AutomationConditionTypeType,
  AutomationConditionOperatorType,
  AutomationConditionKeywordModeType,
  AutomationConditionSourceType,
};

export interface ReplyCommentPayload {
  text: string;
  variations?: string[];
  hide_comment?: boolean;
  use_ai_reply?: boolean;
}

export interface SendDmTextMessage {
  type: 'text';
  text: string;
}

export interface SendDmMediaMessage {
  type: 'image' | 'video' | 'file';
  payload: {
    url: string;
    is_reusable?: boolean;
  };
}

export type SendDmMessage = SendDmTextMessage | SendDmMediaMessage;

export interface SendDmTextPayload {
  message: SendDmTextMessage;
  use_ai_reply?: boolean;
}

export interface SendDmMediaPayload {
  message: SendDmMediaMessage;
  attachment_id?: string;
  use_ai_reply?: boolean;
}

export type SendDmPayload = SendDmTextPayload | SendDmMediaPayload;

export interface PrivateReplyPayload {
  text: string;
  use_ai_reply?: boolean;
}

export interface AddTagPayload {
  tag_name: string;
  create_if_missing?: boolean;
}

export interface NotifyAdminPayload {
  message: string;
  email?: string;
}

export type ActionPayload =
  | ReplyCommentPayload
  | SendDmPayload
  | PrivateReplyPayload
  | AddTagPayload
  | NotifyAdminPayload;

export interface FollowerCountConditionValue {
  min?: number;
  max?: number;
}

export interface UserPropertyConditionValue {
  property: 'is_verified' | 'is_business' | 'is_private';
  value: boolean;
}

export type ConditionValue =
  | string
  | number
  | boolean
  | string[]
  | FollowerCountConditionValue
  | UserPropertyConditionValue;

// Config Interfaces

export interface ConditionConfig {
  condition_type: AutomationConditionTypeType;
  condition_operator: AutomationConditionOperatorType;
  condition_value: ConditionValue;
  condition_keyword_mode?: AutomationConditionKeywordModeType;
  condition_source?: AutomationConditionSourceType;
}

export interface BaseTriggerConfig {
  ignore_verified_users?: boolean;
  ignore_business_accounts?: boolean;
}

export interface NewCommentTriggerConfig extends BaseTriggerConfig {
  include_reply_to_comments?: boolean;
  exclude_keywords?: string[];
}

export interface StoryReplyTriggerConfig extends BaseTriggerConfig {
  match_keywords?: string[];
}

export type TriggerConfigPayload =
  | NewCommentTriggerConfig
  | StoryReplyTriggerConfig
  | BaseTriggerConfig;

export interface TriggerConfig {
  trigger_type: AutomationTriggerTypeType;
  trigger_source: AutomationTriggerSourceType;
  trigger_scope?: AutomationTriggerScopeType;
  content_ids?: string[];
  trigger_config?: TriggerConfigPayload;
  type?: AutomationTriggerTypeType; // Added for compatibility
  scope?: AutomationTriggerScopeType; // Added for compatibility

  // UI-only fields
  selectedPosts?: {
    id: string;
    thumbnail?: string;
    postType: 'image' | 'video' | 'reel' | 'carousel';
  }[];
}

export interface ActionConfig {
  action_type: AutomationActionTypeType;
  type?: AutomationActionTypeType; // Added for compatibility
  execution_order: number;
  order?: number; // Added for compatibility with sorting
  delay_seconds?: number;
  action_payload: ActionPayload;
  params?: ActionPayload; // Added for compatibility
}

// Response Interfaces (Simplified from Serializer)

export interface AutomationResponseTrigger {
  type: string;
  condition: string;
  value: string | number | boolean | null;
  platform?: string; // Added optional field
  social_account_id?: string; // Added optional field
}

export interface AutomationResponseAction {
  type: string;
  target: string;
  payload: string | number | boolean | null;
  params?: Record<string, unknown>; // Added optional field
  delay_seconds?: number; // Added optional field
}

export interface AutomationResponseCondition {
  field: string;
  operator: string;
  value: string | number | boolean | null;
}

export interface Automation {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: AutomationStatusType;
  platform: AutomationPlatformType;
  execution_mode: AutomationExecutionModeType;
  social_account_id: string;
  bot_id?: string;

  // Response structure matches AutomationSerializer
  triggers: AutomationResponseTrigger[];
  actions: AutomationResponseAction[];
  conditions: AutomationResponseCondition[];

  // Expanded fields
  bot?: unknown; // Defined in other files
  social_account?: unknown;
  user?: unknown;

  execution_count: number;
  success_count: number;
  failure_count: number;
  is_template: boolean;
  version: number;
  last_executed_at?: string | null;
  created_at: string;
  updated_at: string;

  // Optional fields for statistics (may be present depending on endpoint)
  total_runs?: number;
  last_run_at?: string | null;
}

export interface CreateAutomationDto {
  name: string;
  description?: string;
  social_account_id: string;
  bot_id?: string;
  platform: AutomationPlatformType;
  status?: AutomationStatusType;
  execution_mode: AutomationExecutionModeType;

  trigger: TriggerConfig;
  actions: ActionConfig[];
  conditions?: ConditionConfig[];

  is_template?: boolean;
  template_category?: string;
  template_tags?: string[];
}

// Aliases for backward compatibility
export const TriggerType = AutomationTriggerType;
// export type TriggerType = AutomationTriggerTypeType;
export const TriggerSource = AutomationTriggerSource;
// export type TriggerSource = AutomationTriggerSourceType;
export const TriggerScope = AutomationTriggerScope;
// export type TriggerScope = AutomationTriggerScopeType;
export const ActionType = AutomationActionType;
// export type ActionType = AutomationActionTypeType;
export const ConditionType = AutomationConditionType;
// export type ConditionType = AutomationConditionTypeType;
export const ConditionOperator = AutomationConditionOperator;
// export type ConditionOperator = AutomationConditionOperatorType;

// Additional exports for builder components
export type ActionBuilder = ActionConfig;

export interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
  caseSensitive?: boolean;
}

export interface ConditionsConfig {
  enabled: boolean;
  logic: 'and' | 'or';
  conditions: Condition[];
}

export type SelectedBlock =
  | TriggerConfig
  | ActionConfig
  | ConditionsConfig
  | null;

export interface BuilderUIState {
  validationErrors: {
    blockId: string;
    message: string;
  }[];
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  selectedBlockId: string | null;
  isDirty?: boolean;
  lastSavedAt?: string | null;
}

export type ExecutionMode = 'real_time' | 'delayed' | 'scheduled';

export interface AutomationBuilder {
  id: string;
  name: string;
  description?: string;
  status: AutomationStatusType;
  pausedReason?: string;
  executionMode: ExecutionMode;
  delaySeconds?: number;
  trigger: TriggerConfig;
  conditions: ConditionsConfig;
  actions: ActionConfig[];
  statistics: {
    totalExecutions: number;
    successfulExecutions: number;
    totalCreditsUsed: number;
    trend: {
      period: 'week' | 'day' | 'month';
      executionsChange: number;
    };
  };
  estimatedCreditCost?: number;
  rateLimit?: {
    currentHourUsage: number;
    maxPerHour: number;
    currentDayUsage: number;
    maxPerDay: number;
  };
}
