// Notification types matching backend schema
export const NotificationType = {
  AUTOMATION: 'automation',
  BILLING: 'billing',
  SYSTEM: 'system',
  USAGE: 'usage',
  SECURITY: 'security',
  SOCIAL: 'social',
  PERFORMANCE: 'performance',
  MAINTENANCE: 'maintenance',
  NEW_FEATURE: 'new_feature',
  ANNOUNCEMENT: 'announcement',
} as const;

export type NotificationTypeType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationStatus = {
  UNREAD: 'unread',
  READ: 'read',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
} as const;

export type NotificationStatusType =
  (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const NotificationPriority = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  URGENT: 'urgent',
} as const;

export type NotificationPriorityType =
  (typeof NotificationPriority)[keyof typeof NotificationPriority];

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationTypeType;
  status: NotificationStatusType;
  priority: NotificationPriorityType;
  action_url?: string;
  action_label?: string;
  read_at?: string;
  archived_at?: string;
  icon?: string;
  category?: string;
  tags: string[];
  metadata?: Record<string, unknown>;
  deep_link?: string;
  image_url?: string;
  dismissible: boolean;
  click_count: number;
  is_broadcast: boolean;
  target_channels: string[];
  created_at: string;
  updated_at: string;
}
