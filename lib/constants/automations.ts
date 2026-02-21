export const AutomationTriggerType = {
  NEW_COMMENT: 'new_comment',
  STORY_REPLY: 'story_reply',
  DM_RECEIVED: 'dm_received',
  MENTION: 'mention',
  NEW_FOLLOWER: 'new_follower',
} as const;

export type AutomationTriggerTypeType =
  (typeof AutomationTriggerType)[keyof typeof AutomationTriggerType];

export const AutomationTriggerSource = {
  POST: 'post',
  REEL: 'reel',
  STORY: 'story',
  PROFILE: 'profile',
  DIRECT_MESSAGE: 'direct_message',
  AD: 'ad',
} as const;

export type AutomationTriggerSourceType =
  (typeof AutomationTriggerSource)[keyof typeof AutomationTriggerSource];

export const AutomationTriggerScope = {
  ALL: 'all',
  SPECIFIC: 'specific',
} as const;

export type AutomationTriggerScopeType =
  (typeof AutomationTriggerScope)[keyof typeof AutomationTriggerScope];

export const AutomationActionType = {
  REPLY_COMMENT: 'reply_comment',
  SEND_DM: 'send_dm',
  PRIVATE_REPLY: 'private_reply',
} as const;

export type AutomationActionTypeType =
  (typeof AutomationActionType)[keyof typeof AutomationActionType];

export const AutomationPlatform = {
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  LINKEDIN: 'linkedin',
} as const;

export type AutomationPlatformType =
  (typeof AutomationPlatform)[keyof typeof AutomationPlatform];

export const AutomationStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PAUSED: 'paused',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
  ERROR: 'error',
} as const;

export type AutomationStatusType =
  (typeof AutomationStatus)[keyof typeof AutomationStatus];

export const AutomationExecutionMode = {
  REAL_TIME: 'real_time',
  SCHEDULED: 'scheduled',
  DELAYED: 'delayed',
} as const;

export type AutomationExecutionModeType =
  (typeof AutomationExecutionMode)[keyof typeof AutomationExecutionMode];

export const AutomationConditionType = {
  KEYWORD: 'keyword',
  USER_FILTER: 'user_filter',
  TIME_RANGE: 'time_range',
  FOLLOWER_COUNT: 'follower_count',
  ENGAGEMENT_HISTORY: 'engagement_history',
} as const;

export type AutomationConditionTypeType =
  (typeof AutomationConditionType)[keyof typeof AutomationConditionType];

export const AutomationConditionOperator = {
  EQUALS: 'equals',
  CONTAINS: 'contains',
  STARTS_WITH: 'starts_with',
  AND: 'AND',
  OR: 'OR',
} as const;

export type AutomationConditionOperatorType =
  (typeof AutomationConditionOperator)[keyof typeof AutomationConditionOperator];

export const AutomationConditionKeywordMode = {
  ANY: 'any',
  ALL: 'all',
  EXACT: 'exact',
  NONE: 'none',
} as const;

export type AutomationConditionKeywordModeType =
  (typeof AutomationConditionKeywordMode)[keyof typeof AutomationConditionKeywordMode];

export const AutomationConditionSource = {
  COMMENT_TEXT: 'comment_text',
  DM_TEXT: 'dm_text',
  BIO_LINK: 'bio_link',
  CAPTION: 'caption',
  USER_BIO: 'user_bio',
} as const;

export type AutomationConditionSourceType =
  (typeof AutomationConditionSource)[keyof typeof AutomationConditionSource];
