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

export type NotificationStatus = 'unread' | 'read' | 'archived' | 'deleted';
export type NotificationPriority = 'high' | 'medium' | 'low' | 'urgent';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationTypeType;
  title: string;
  message: string;
  status: NotificationStatus;
  priority: NotificationPriority;
  action_url?: string | null;
  action_label?: string;
  read_at?: string | null;
  is_read?: boolean;
  is_broadcast: boolean;
  target_channels: string[];
  created_at: string;
  updated_at: string;
  _links?: Record<string, { href: string; method?: string }>;
}

export type NotificationPriorityType = NotificationPriority;
