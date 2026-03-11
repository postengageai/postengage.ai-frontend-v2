// ── Flow node definitions ──────────────────────────────────────────────────
// These IDs match the real backend constants in lib/constants/automations.ts

export type FlowNodeCategory = 'trigger' | 'condition' | 'action';

// Trigger IDs — mirror AutomationTriggerType constants
export type TriggerNodeId =
  | 'new_comment'
  | 'dm_received'
  | 'story_reply'
  | 'mention'
  | 'new_follower';

// Condition IDs — mirror AutomationConditionType constants
export type ConditionNodeId = 'keyword_match' | 'follower_count';

// Action IDs — mirror AutomationActionType constants
export type ActionNodeId = 'reply_comment' | 'private_reply' | 'send_dm';

export type FlowNodeDefinitionId =
  | TriggerNodeId
  | ConditionNodeId
  | ActionNodeId;

// ── Per-node config shapes ─────────────────────────────────────────────────
// These mirror the wizard's data model and the backend API payload types.

export interface NewCommentConfig {
  social_account_id: string;
  social_account_name?: string;
  platform: 'instagram';
  /** 'all' = all posts & reels, 'specific' = specific posts */
  postFilter: 'all' | 'specific';
  /** Selected post / reel IDs when postFilter === 'specific' */
  content_ids: string[];
  cooldownHours: number;
}

export interface DmReceivedConfig {
  social_account_id: string;
  social_account_name?: string;
  platform: 'instagram';
  cooldownHours: number;
}

export interface StoryReplyConfig {
  social_account_id: string;
  social_account_name?: string;
  platform: 'instagram';
  cooldownHours: number;
}

export interface MentionConfig {
  social_account_id: string;
  social_account_name?: string;
  platform: 'instagram';
  cooldownHours: number;
}

export interface NewFollowerConfig {
  social_account_id: string;
  social_account_name?: string;
  platform: 'instagram';
  cooldownHours: number;
}

// Keyword condition — mirrors AutomationConditionKeywordMode
export interface KeywordMatchConfig {
  /** Maps to condition_keyword_mode on the API */
  matchMode: 'any' | 'all' | 'exact' | 'none';
  keywords: string[];
}

export interface FollowerCountConfig {
  operator: 'greater_than' | 'less_than' | 'equals';
  threshold: number;
}

// ── Action configs — use API payload shapes directly ──────────────────────

/** ReplyCommentPayload equivalent */
export interface ReplyCommentConfig {
  text: string;
  use_ai_reply: boolean;
  delay_seconds: number;
}

/** PrivateReplyPayload equivalent */
export interface PrivateReplyConfig {
  text: string;
  use_ai_reply: boolean;
  delay_seconds: number;
}

/** SendDmPayload equivalent — text or media */
export interface SendDmConfig {
  /** 'text' | 'media' — controls which message variant is active */
  messageKind: 'text' | 'media';
  /** Text body (used when messageKind === 'text') */
  text: string;
  /** Media URL (used when messageKind === 'media') */
  mediaUrl?: string;
  /** 'image' | 'video' | 'file' */
  mediaType?: 'image' | 'video' | 'file';
  use_ai_reply: boolean;
  delay_seconds: number;
  /** Prevent duplicate DMs to the same user */
  sendOnce: boolean;
}

export type NodeConfig =
  | NewCommentConfig
  | DmReceivedConfig
  | StoryReplyConfig
  | MentionConfig
  | NewFollowerConfig
  | KeywordMatchConfig
  | FollowerCountConfig
  | ReplyCommentConfig
  | PrivateReplyConfig
  | SendDmConfig;

// ── Flow node instance ─────────────────────────────────────────────────────

export interface FlowNode {
  id: string;
  definitionId: FlowNodeDefinitionId;
  category: FlowNodeCategory;
  order: number;
  config: NodeConfig;
}

// ── Builder state ──────────────────────────────────────────────────────────

export interface BuilderState {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused';
  nodes: FlowNode[];
  /** Bot selected for AI-enabled actions */
  bot_id?: string;
}

export interface ValidationError {
  nodeId: string | null;
  message: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Returns which action node IDs are allowed given the current trigger */
export function getAllowedActions(
  triggerNodeId: TriggerNodeId
): ActionNodeId[] {
  if (triggerNodeId === 'new_comment') {
    // Can reply to comment publicly OR send a private DM reply
    return ['reply_comment', 'private_reply'];
  }
  // DM / Story Reply / Mention / New Follower → DM reply only
  return ['send_dm'];
}

// ── Default configs ────────────────────────────────────────────────────────

export const DEFAULT_CONFIGS: Record<FlowNodeDefinitionId, NodeConfig> = {
  // Triggers
  new_comment: {
    social_account_id: '',
    platform: 'instagram',
    postFilter: 'all',
    content_ids: [],
    cooldownHours: 24,
  } as NewCommentConfig,
  dm_received: {
    social_account_id: '',
    platform: 'instagram',
    cooldownHours: 0,
  } as DmReceivedConfig,
  story_reply: {
    social_account_id: '',
    platform: 'instagram',
    cooldownHours: 0,
  } as StoryReplyConfig,
  mention: {
    social_account_id: '',
    platform: 'instagram',
    cooldownHours: 0,
  } as MentionConfig,
  new_follower: {
    social_account_id: '',
    platform: 'instagram',
    cooldownHours: 0,
  } as NewFollowerConfig,
  // Conditions
  keyword_match: {
    matchMode: 'any',
    keywords: [],
  } as KeywordMatchConfig,
  follower_count: {
    operator: 'greater_than',
    threshold: 1000,
  } as FollowerCountConfig,
  // Actions
  reply_comment: {
    text: '',
    use_ai_reply: false,
    delay_seconds: 2,
  } as ReplyCommentConfig,
  private_reply: {
    text: '',
    use_ai_reply: false,
    delay_seconds: 5,
  } as PrivateReplyConfig,
  send_dm: {
    messageKind: 'text',
    text: '',
    use_ai_reply: false,
    delay_seconds: 5,
    sendOnce: true,
  } as SendDmConfig,
};
