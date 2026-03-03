// Automation Builder Types - Based on API contract

export type TriggerType =
  | 'comment_received'
  | 'direct_message'
  | 'story_mention'
  | 'story_reply'
  | 'keyword_match';
export type ActionType =
  | 'send_message'
  | 'add_tag'
  | 'capture_lead'
  | 'assign_bot'
  | 'send_notification';
export type AutomationStatus = 'active' | 'inactive' | 'error';

export interface ConditionConfig {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex';
  value: string;
  case_sensitive?: boolean;
}

export interface ActionConfig {
  type: ActionType;
  params: Record<string, unknown>;
  delay_seconds?: number;
  order: number;
}

export interface TriggerConfig {
  type: TriggerType;
  platform: string;
  social_account_id: string;
  conditions?: ConditionConfig[];
}

export interface Automation {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  status: AutomationStatus;
  triggers: TriggerConfig[];
  actions: ActionConfig[];
  bot_id?: string;
  total_runs: number;
  last_run_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAutomationDto {
  name: string;
  description?: string;
  triggers: TriggerConfig[];
  actions: ActionConfig[];
  bot_id?: string;
}
