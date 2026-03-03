export const NotificationType = {
  AUTOMATION: 'automation',
  LEAD: 'lead',
  PAYMENT: 'payment',
  SOCIAL: 'social',
  SYSTEM: 'system',
  BOT: 'bot',
  UPGRADE: 'upgrade',
} as const;

export type NotificationTypeType =
  (typeof NotificationType)[keyof typeof NotificationType];

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationTypeType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}
