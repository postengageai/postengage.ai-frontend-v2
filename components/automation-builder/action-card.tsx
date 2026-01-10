'use client';

import type React from 'react';

import {
  MessageCircle,
  Send,
  Heart,
  EyeOff,
  Tag,
  GripVertical,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { ActionConfig, ActionType } from '@/lib/types/automation-builder';
import { getActionTypeLabel } from '@/lib/mock/automation-builder-data';

interface ActionCardProps {
  action: ActionConfig;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ActionConfig>) => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const actionIcons: Record<ActionType, React.ReactNode> = {
  reply_comment: <MessageCircle className='h-4 w-4' />,
  send_dm: <Send className='h-4 w-4' />,
  like_comment: <Heart className='h-4 w-4' />,
  hide_comment: <EyeOff className='h-4 w-4' />,
  add_tag: <Tag className='h-4 w-4' />,
};

const actionColors: Record<
  ActionType,
  { bg: string; text: string; border: string }
> = {
  reply_comment: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    border: 'border-emerald-500/20',
  },
  send_dm: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    border: 'border-purple-500/20',
  },
  like_comment: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-500',
    border: 'border-pink-500/20',
  },
  hide_comment: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-500',
    border: 'border-slate-500/20',
  },
  add_tag: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    border: 'border-blue-500/20',
  },
};

export function ActionCard({
  action,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: ActionCardProps) {
  const colors = actionColors[action.type];
  const hasAI = action.config.useAI;
  const hasDelay = action.config.delay && action.config.delay > 0;

  // Determine if action is properly configured
  const isConfigured = () => {
    if (action.type === 'reply_comment') {
      return (
        hasAI ||
        (action.config.replyTemplates &&
          action.config.replyTemplates.length > 0)
      );
    }
    if (action.type === 'send_dm') {
      return action.config.dmTemplates && action.config.dmTemplates.length > 0;
    }
    return true;
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:translate-y-[-2px]',
        isSelected
          ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/10'
          : 'border-border hover:border-primary/50',
        !action.enabled && 'opacity-60'
      )}
      onClick={onSelect}
    >
      <CardContent className='p-4'>
        {/* Header */}
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            {/* Drag handle and order */}
            <div
              className='flex items-center gap-1'
              onClick={e => e.stopPropagation()}
            >
              <GripVertical className='h-4 w-4 text-muted-foreground cursor-grab' />
              <div className='flex flex-col'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-4 w-4 p-0'
                  disabled={!canMoveUp}
                  onClick={e => {
                    e.stopPropagation();
                    onMoveUp();
                  }}
                >
                  <ChevronUp className='h-3 w-3' />
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-4 w-4 p-0'
                  disabled={!canMoveDown}
                  onClick={e => {
                    e.stopPropagation();
                    onMoveDown();
                  }}
                >
                  <ChevronDown className='h-3 w-3' />
                </Button>
              </div>
            </div>

            {/* Order badge */}
            <div className='w-6 h-6 rounded-full bg-muted flex items-center justify-center'>
              <span className='text-xs font-semibold'>{action.order}</span>
            </div>

            {/* Icon and label */}
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                colors.bg,
                colors.text
              )}
            >
              {actionIcons[action.type]}
            </div>
            <div>
              <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                Then
              </p>
              <p className='font-medium text-sm'>
                {getActionTypeLabel(action.type)}
              </p>
            </div>
          </div>

          <div
            className='flex items-center gap-2'
            onClick={e => e.stopPropagation()}
          >
            <Badge
              variant='secondary'
              className={cn('border', colors.bg, colors.text, colors.border)}
            >
              Action
            </Badge>
            <Switch
              checked={action.enabled}
              onCheckedChange={checked => onUpdate({ enabled: checked })}
              className='data-[state=checked]:bg-emerald-500'
            />
          </div>
        </div>

        {/* Quick info */}
        {action.enabled && (
          <div className='flex flex-wrap items-center gap-2 mb-3'>
            {hasAI && (
              <Badge
                variant='outline'
                className='text-xs gap-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10'
              >
                <Sparkles className='h-3 w-3 text-purple-500' />
                AI Enabled
              </Badge>
            )}
            {hasDelay && (
              <Badge variant='outline' className='text-xs gap-1'>
                <Clock className='h-3 w-3 text-muted-foreground' />
                {action.config.delay}s delay
              </Badge>
            )}
            <Badge variant='outline' className='text-xs font-mono'>
              {action.creditCost} credit{action.creditCost > 1 ? 's' : ''}
            </Badge>
          </div>
        )}

        {/* Preview content */}
        {action.enabled && (
          <div className='bg-background/50 rounded-lg p-3 border border-border'>
            {action.type === 'reply_comment' && (
              <div className='space-y-1'>
                {hasAI ? (
                  <>
                    <p className='text-xs text-muted-foreground'>
                      AI will generate replies with:
                    </p>
                    <p className='text-sm font-medium capitalize'>
                      {action.config.aiTone} tone
                    </p>
                  </>
                ) : (
                  <>
                    <p className='text-xs text-muted-foreground'>
                      Reply templates:
                    </p>
                    <p className='text-sm truncate'>
                      {action.config.replyTemplates?.[0] ||
                        'No templates added'}
                    </p>
                  </>
                )}
              </div>
            )}

            {action.type === 'send_dm' && (
              <div className='space-y-1'>
                <p className='text-xs text-muted-foreground'>
                  {action.config.dmTemplates?.length || 0} template(s)
                  {action.config.sendOnlyOnce && ' • Send once per user'}
                </p>
                <p className='text-sm truncate'>
                  {action.config.dmTemplates?.[0]?.name || 'No templates added'}
                </p>
              </div>
            )}

            {action.type === 'like_comment' && (
              <p className='text-sm text-muted-foreground'>
                Automatically like the triggering comment
              </p>
            )}

            {action.type === 'hide_comment' && (
              <p className='text-sm text-muted-foreground'>
                Hide comment from public view
              </p>
            )}

            {action.type === 'add_tag' && (
              <div className='space-y-1'>
                <p className='text-xs text-muted-foreground'>Tag user as:</p>
                <p className='text-sm font-medium'>
                  {action.config.tagName || 'No tag specified'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Validation indicator */}
        <div className='flex items-center justify-between mt-3 pt-3 border-t border-border'>
          <div className='flex items-center gap-1.5'>
            {!action.enabled || isConfigured() ? (
              <>
                <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
                <span className='text-xs text-emerald-500'>
                  {action.enabled ? 'Configured' : 'Disabled'}
                </span>
              </>
            ) : (
              <>
                <AlertCircle className='h-3.5 w-3.5 text-amber-500' />
                <span className='text-xs text-amber-500'>
                  Needs configuration
                </span>
              </>
            )}
          </div>

          <Button
            variant='ghost'
            size='sm'
            className='h-6 text-xs text-muted-foreground hover:text-destructive'
            onClick={e => {
              e.stopPropagation();
              onRemove();
            }}
          >
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
