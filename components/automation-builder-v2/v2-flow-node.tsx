'use client';

import { useState } from 'react';
import { MoreHorizontal, Clock, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { getNodeDef } from './node-definitions';
import type {
  FlowNode,
  KeywordMatchConfig,
  NewCommentConfig,
  DmReceivedConfig,
  StoryReplyConfig,
  MentionConfig,
  NewFollowerConfig,
  ReplyCommentConfig,
  PrivateReplyConfig,
  SendDmConfig,
  FollowerCountConfig,
} from './types';

interface V2FlowNodeProps {
  node: FlowNode;
  actionIndex?: number;
  isSelected: boolean;
  hasError?: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}

export function V2FlowNode({
  node,
  actionIndex,
  isSelected,
  hasError,
  onSelect,
  onDelete,
  onDuplicate,
}: V2FlowNodeProps) {
  const def = getNodeDef(node.definitionId);
  const Icon = def.icon;
  const isTrigger = node.category === 'trigger';
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    if (isTrigger) {
      setShowDeleteConfirm(true);
    } else {
      onDelete();
    }
  };

  return (
    <>
      <div
        onClick={onSelect}
        className={cn(
          'relative w-[260px] cursor-pointer rounded-xl border-2 transition-all hover:shadow-lg',
          hasError
            ? 'border-red-500/70 shadow-red-500/10'
            : isSelected
              ? cn(def.borderColor, 'shadow-lg')
              : 'border-white/10 hover:border-white/20',
          'bg-[#131320]'
        )}
      >
        {/* Node header */}
        <div
          className={cn(
            'flex items-center justify-between rounded-t-xl px-3 py-2',
            def.headerBg
          )}
        >
          <div className='flex items-center gap-1.5'>
            <span
              className={cn(
                'text-[10px] font-bold uppercase tracking-widest',
                def.headerText
              )}
            >
              {node.category}
            </span>
            {def.badge && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0 text-[9px] font-semibold',
                  def.iconBg,
                  def.iconColor
                )}
              >
                {def.badge}
              </span>
            )}
          </div>
          <div className='flex items-center gap-1'>
            {node.category === 'action' && actionIndex !== undefined && (
              <span className='flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white'>
                {actionIndex + 1}
              </span>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-6 w-6 p-0 text-slate-500 hover:bg-white/10 hover:text-white'
                  onClick={e => e.stopPropagation()}
                >
                  <MoreHorizontal className='h-3.5 w-3.5' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='border-white/10 bg-[#1a1a2e] text-slate-200'
                onClick={e => e.stopPropagation()}
              >
                {onDuplicate && (
                  <DropdownMenuItem
                    onClick={onDuplicate}
                    className='hover:bg-white/5'
                  >
                    Duplicate
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className='bg-white/10' />
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className='text-red-400 hover:bg-red-500/10 hover:text-red-300'
                >
                  Delete node
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Node body */}
        <div className='p-3'>
          <div className='flex items-center gap-2.5'>
            <div
              className={cn(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
                def.iconBg
              )}
            >
              <Icon className={cn('h-4 w-4', def.iconColor)} />
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-sm font-semibold text-white'>{def.label}</p>
              <p className='text-xs text-slate-500'>
                <NodeSubtitle node={node} />
              </p>
            </div>
          </div>

          <NodePreview node={node} />
          <NodeFooter node={node} />
        </div>
      </div>

      {/* Trigger delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent
          className='border-red-500/20 bg-[#1a1a2e]'
          onClick={e => e.stopPropagation()}
        >
          <AlertDialogHeader>
            <div className='mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15'>
              <AlertTriangle className='h-5 w-5 text-red-400' />
            </div>
            <AlertDialogTitle className='text-white'>
              Delete trigger and all nodes?
            </AlertDialogTitle>
            <AlertDialogDescription className='text-slate-400'>
              Deleting the trigger will also remove{' '}
              <span className='font-semibold text-slate-200'>
                all conditions and actions
              </span>{' '}
              you&apos;ve configured in this flow. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'>
              Keep flow
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className='bg-red-600 text-white hover:bg-red-500'
            >
              Yes, delete everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Subtitle ──────────────────────────────────────────────────────────────

function NodeSubtitle({ node }: { node: FlowNode }) {
  switch (node.definitionId) {
    case 'new_comment': {
      const c = node.config as NewCommentConfig;
      return (
        <>
          Instagram ·{' '}
          {c.postFilter === 'all' ? 'All posts & reels' : 'Specific posts'}
        </>
      );
    }
    case 'dm_received': {
      const c = node.config as DmReceivedConfig;
      return (
        <>Instagram · DMs{c.cooldownHours ? ` · ${c.cooldownHours}h` : ''}</>
      );
    }
    case 'story_reply': {
      const c = node.config as StoryReplyConfig;
      return (
        <>
          Instagram · Story replies
          {c.cooldownHours ? ` · ${c.cooldownHours}h` : ''}
        </>
      );
    }
    case 'mention': {
      const c = node.config as MentionConfig;
      return (
        <>
          Instagram · Mentions{c.cooldownHours ? ` · ${c.cooldownHours}h` : ''}
        </>
      );
    }
    case 'new_follower': {
      const c = node.config as NewFollowerConfig;
      return (
        <>
          Instagram · New followers
          {c.cooldownHours ? ` · ${c.cooldownHours}h` : ''}
        </>
      );
    }
    case 'keyword_match': {
      const c = node.config as KeywordMatchConfig;
      const count = c.keywords.length;
      const modeLabel =
        c.matchMode === 'any'
          ? 'Contains Any'
          : c.matchMode === 'all'
            ? 'Contains All'
            : c.matchMode === 'none'
              ? 'Contains None'
              : 'Exact Match';
      return (
        <>
          {modeLabel} · {count} keyword{count !== 1 ? 's' : ''}
        </>
      );
    }
    case 'follower_count': {
      const c = node.config as FollowerCountConfig;
      const opLabel =
        c.operator === 'greater_than'
          ? '>'
          : c.operator === 'less_than'
            ? '<'
            : '=';
      return (
        <>
          Followers {opLabel} {c.threshold.toLocaleString()}
        </>
      );
    }
    case 'reply_comment': {
      const c = node.config as ReplyCommentConfig;
      return <>{c.use_ai_reply ? 'AI reply' : 'Manual reply'}</>;
    }
    case 'private_reply': {
      const c = node.config as PrivateReplyConfig;
      return (
        <>{c.use_ai_reply ? 'AI private reply' : 'Manual private reply'}</>
      );
    }
    case 'send_dm': {
      const c = node.config as SendDmConfig;
      if (c.messageKind === 'media') return <>Media DM</>;
      return <>{c.use_ai_reply ? 'AI DM' : 'Manual DM'}</>;
    }
    default:
      return null;
  }
}

// ── Preview (keyword pills, message snippets, AI badge) ───────────────────

function NodePreview({ node }: { node: FlowNode }) {
  if (node.definitionId === 'keyword_match') {
    const c = node.config as KeywordMatchConfig;
    if (c.keywords.length === 0) return null;
    return (
      <div className='mt-2.5 flex flex-wrap gap-1'>
        {c.keywords.slice(0, 3).map(kw => (
          <span
            key={kw}
            className='rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] text-violet-300'
          >
            {kw}
          </span>
        ))}
        {c.keywords.length > 3 && (
          <span className='rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500'>
            +{c.keywords.length - 3} more
          </span>
        )}
      </div>
    );
  }

  if (
    node.definitionId === 'reply_comment' ||
    node.definitionId === 'private_reply'
  ) {
    const c = node.config as ReplyCommentConfig | PrivateReplyConfig;
    if (c.use_ai_reply) {
      return (
        <div className='mt-2 flex items-center gap-1.5 rounded-lg bg-primary/5 px-2.5 py-1.5'>
          <Sparkles className='h-3 w-3 text-primary' />
          <span className='text-[10px] text-primary'>AI Reply Active</span>
        </div>
      );
    }
    if (!c.text) return null;
    return (
      <p className='mt-2 truncate rounded bg-white/5 px-2 py-1 text-xs italic text-slate-400'>
        &quot;{c.text.length > 38 ? c.text.slice(0, 38) + '…' : c.text}&quot;
      </p>
    );
  }

  if (node.definitionId === 'send_dm') {
    const c = node.config as SendDmConfig;
    if (c.use_ai_reply) {
      return (
        <div className='mt-2 flex items-center gap-1.5 rounded-lg bg-primary/5 px-2.5 py-1.5'>
          <Sparkles className='h-3 w-3 text-primary' />
          <span className='text-[10px] text-primary'>AI DM Active</span>
        </div>
      );
    }
    if (c.messageKind === 'media') {
      return (
        <p className='mt-2 rounded bg-white/5 px-2 py-1 text-[10px] text-slate-500'>
          📎 Media attachment
        </p>
      );
    }
    if (!c.text) return null;
    return (
      <p className='mt-2 truncate rounded bg-white/5 px-2 py-1 text-xs italic text-slate-400'>
        &quot;{c.text.length > 38 ? c.text.slice(0, 38) + '…' : c.text}&quot;
      </p>
    );
  }

  return null;
}

// ── Footer (cooldown for trigger nodes) ──────────────────────────────────

function NodeFooter({ node }: { node: FlowNode }) {
  if (node.category !== 'trigger') return null;

  const config = node.config as
    | NewCommentConfig
    | DmReceivedConfig
    | StoryReplyConfig
    | MentionConfig
    | NewFollowerConfig;

  if (!config.cooldownHours) return null;

  return (
    <div className='mt-2.5 flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5'>
      <Clock className='h-3 w-3 text-slate-500' />
      <span className='text-[10px] text-slate-400'>
        {config.cooldownHours}h cooldown per user
      </span>
    </div>
  );
}
