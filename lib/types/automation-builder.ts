// Automation Builder Types - Based on real API structure

export type Platform = 'instagram' | 'facebook' | 'twitter' | 'linkedin';

export type TriggerType =
  | 'new_comment'
  | 'keyword_mention'
  | 'new_dm'
  | 'story_reply'
  | 'new_follower';

export type TriggerScope =
  | 'all_posts'
  | 'specific_posts'
  | 'reels_only'
  | 'stories_only';

export type ConditionOperator =
  | 'contains'
  | 'equals'
  | 'starts_with'
  | 'ends_with'
  | 'regex';

export type ActionType =
  | 'reply_comment'
  | 'send_dm'
  | 'like_comment'
  | 'hide_comment'
  | 'add_tag';

export type ExecutionMode = 'real_time' | 'delayed' | 'scheduled';

export type AutomationStatus = 'active' | 'paused' | 'draft' | 'error';

export interface SelectedPost {
  id: string;
  thumbnail: string;
  caption: string;
  postType: 'image' | 'video' | 'reel' | 'carousel';
  postedAt: string;
}

export interface TriggerConfig {
  id: string;
  type: TriggerType;
  scope: TriggerScope;
  selectedPosts?: SelectedPost[];
}

export interface Condition {
  id: string;
  field: 'comment_text' | 'username' | 'follower_count' | 'is_verified';
  operator: ConditionOperator;
  value: string;
  caseSensitive: boolean;
}

export interface ConditionsConfig {
  id: string;
  enabled: boolean;
  logic: 'and' | 'or';
  conditions: Condition[];
}

export interface DmTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
}

export interface ActionConfig {
  id: string;
  type: ActionType;
  order: number;
  enabled: boolean;
  creditCost: number;
  config: {
    // For reply_comment
    replyTemplates?: string[];
    useAI?: boolean;
    aiTone?: 'friendly' | 'professional' | 'casual' | 'witty';
    aiContext?: string;
    delay?: number; // seconds

    // For send_dm
    dmTemplates?: DmTemplate[];
    sendOnlyOnce?: boolean;

    // For hide_comment
    hideReason?: string;

    // For add_tag
    tagName?: string;
  };
}

export interface AutomationStatistics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  totalCreditsUsed: number;
  avgExecutionTime: number; // milliseconds
  lastExecutionAt: string | null;
  trend: {
    executionsChange: number; // percentage
    period: 'day' | 'week' | 'month';
  };
}

export interface RateLimit {
  maxPerHour: number;
  maxPerDay: number;
  currentHourUsage: number;
  currentDayUsage: number;
  cooldownMinutes: number;
}

export interface AutomationBuilder {
  id: string;
  name: string;
  description?: string;
  platform: Platform;
  status: AutomationStatus;
  pausedReason?: string;
  executionMode: ExecutionMode;
  scheduledTime?: string; // For scheduled mode
  delaySeconds?: number; // For delayed mode

  trigger: TriggerConfig;
  conditions: ConditionsConfig;
  actions: ActionConfig[];

  statistics: AutomationStatistics;
  rateLimit: RateLimit;

  estimatedCreditCost: number; // Per execution

  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
}

// UI State types
export type SelectedBlock =
  | { type: 'trigger'; id: string }
  | { type: 'conditions'; id: string }
  | { type: 'action'; id: string }
  | null;

export interface ValidationError {
  blockType: 'trigger' | 'conditions' | 'action';
  blockId: string;
  field: string;
  message: string;
}

export interface BuilderUIState {
  selectedBlock: SelectedBlock;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  validationErrors: ValidationError[];
  expandedPanels: string[];
}
