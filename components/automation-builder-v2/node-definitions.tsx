import {
  MessageCircle,
  Mail,
  Filter,
  Users,
  MessageSquare,
  Send,
  ImageIcon,
  AtSign,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import type {
  FlowNodeCategory,
  FlowNodeDefinitionId,
  TriggerNodeId,
  ActionNodeId,
} from './types';

export interface NodeDefinition {
  id: FlowNodeDefinitionId;
  category: FlowNodeCategory;
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  // node card accent colors (Tailwind classes)
  borderColor: string;
  headerBg: string;
  headerText: string;
  iconBg: string;
  iconColor: string;
}

export const NODE_DEFINITIONS: NodeDefinition[] = [
  // ── TRIGGERS ──────────────────────────────────────────────────────────────
  {
    id: 'new_comment',
    category: 'trigger',
    label: 'New Comment',
    description: 'Someone comments on your posts or reels',
    badge: 'Most Popular',
    icon: MessageCircle,
    borderColor: 'border-amber-500/60',
    headerBg: 'bg-amber-500/10',
    headerText: 'text-amber-400',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    id: 'dm_received',
    category: 'trigger',
    label: 'Direct Message',
    description: 'Someone sends you a direct message',
    icon: Mail,
    borderColor: 'border-amber-500/60',
    headerBg: 'bg-amber-500/10',
    headerText: 'text-amber-400',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    id: 'story_reply',
    category: 'trigger',
    label: 'Story Reply',
    description: 'Someone replies to your story',
    icon: ImageIcon,
    borderColor: 'border-amber-500/60',
    headerBg: 'bg-amber-500/10',
    headerText: 'text-amber-400',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    id: 'mention',
    category: 'trigger',
    label: 'Mention',
    description: 'Someone mentions your account in a post',
    icon: AtSign,
    borderColor: 'border-amber-500/60',
    headerBg: 'bg-amber-500/10',
    headerText: 'text-amber-400',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    id: 'new_follower',
    category: 'trigger',
    label: 'New Follower',
    description: 'Someone starts following your account',
    icon: UserPlus,
    borderColor: 'border-amber-500/60',
    headerBg: 'bg-amber-500/10',
    headerText: 'text-amber-400',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
  },

  // ── CONDITIONS ────────────────────────────────────────────────────────────
  {
    id: 'keyword_match',
    category: 'condition',
    label: 'Keyword Match',
    description: 'Filter by keyword text',
    icon: Filter,
    borderColor: 'border-violet-500/60',
    headerBg: 'bg-violet-500/10',
    headerText: 'text-violet-400',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-400',
  },
  {
    id: 'follower_count',
    category: 'condition',
    label: 'Follower Count',
    description: 'Check follower threshold',
    icon: Users,
    borderColor: 'border-violet-500/60',
    headerBg: 'bg-violet-500/10',
    headerText: 'text-violet-400',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-400',
  },

  // ── ACTIONS ───────────────────────────────────────────────────────────────
  // NOTE: Available actions depend on the trigger:
  //   new_comment → reply_comment + private_reply
  //   everything else → send_dm only
  {
    id: 'reply_comment',
    category: 'action',
    label: 'Reply to Comment',
    description: 'Post a public reply to the comment',
    icon: MessageSquare,
    borderColor: 'border-blue-500/60',
    headerBg: 'bg-blue-500/10',
    headerText: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    id: 'private_reply',
    category: 'action',
    label: 'Send Private Reply',
    description: 'Send a private message to the commenter',
    icon: Mail,
    borderColor: 'border-blue-500/60',
    headerBg: 'bg-blue-500/10',
    headerText: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    id: 'send_dm',
    category: 'action',
    label: 'Send DM Reply',
    description: 'Reply to the direct message',
    icon: Send,
    borderColor: 'border-blue-500/60',
    headerBg: 'bg-blue-500/10',
    headerText: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
  },
];

export const SIDEBAR_GROUPS = [
  {
    label: 'TRIGGERS',
    icon: '⚡',
    nodes: NODE_DEFINITIONS.filter(n => n.category === 'trigger'),
  },
  {
    label: 'CONDITIONS',
    icon: '≡',
    nodes: NODE_DEFINITIONS.filter(n => n.category === 'condition'),
  },
  {
    label: 'ACTIONS',
    icon: '✦',
    nodes: NODE_DEFINITIONS.filter(n => n.category === 'action'),
  },
];

export function getNodeDef(id: FlowNodeDefinitionId): NodeDefinition {
  return NODE_DEFINITIONS.find(n => n.id === id)!;
}

/** Returns action node definitions that are valid for the active trigger.
 *  Used by the node panel and canvas to grey out / hide incompatible actions. */
export function getActionsForTrigger(
  triggerNodeId: TriggerNodeId | null
): ActionNodeId[] {
  if (!triggerNodeId) return ['reply_comment', 'private_reply', 'send_dm'];
  if (triggerNodeId === 'new_comment')
    return ['reply_comment', 'private_reply'];
  return ['send_dm'];
}
