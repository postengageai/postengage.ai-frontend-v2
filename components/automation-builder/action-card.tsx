'use client';

import type React from 'react';

import {
  MessageCircle,
  Send,
  Heart,
  Tag,
  GripVertical,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ActionConfig, ActionType } from '@/lib/types/automation-builder';
import { getActionTypeLabel } from '@/lib/mock/automation-builder-data';

interface ActionCardProps {
  action: ActionConfig;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate?: (updates: Partial<ActionConfig>) => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const actionIcons: Record<ActionType, React.ReactNode> = {
  send_message: <Send className='h-4 w-4' />,
  add_tag: <Tag className='h-4 w-4' />,
  capture_lead: <Heart className='h-4 w-4' />,
  assign_bot: <MessageCircle className='h-4 w-4' />,
  send_notification: <AlertCircle className='h-4 w-4' />,
};

const actionColors: Record<
  ActionType,
  { bg: string; text: string; border: string }
> = {
  send_message: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    border: 'border-emerald-500/20',
  },
  add_tag: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    border: 'border-blue-500/20',
  },
  capture_lead: {
    bg: 'bg-pink-500/10',
    text: 'text-pink-500',
    border: 'border-pink-500/20',
  },
  assign_bot: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    border: 'border-purple-500/20',
  },
  send_notification: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-500',
    border: 'border-slate-500/20',
  },
};

export function ActionCard({
  action,
  isSelected,
  onSelect,
  onUpdate: _onUpdate,
  onRemove,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: ActionCardProps) {
  const colors = actionColors[action.type];
  const hasDelay = action.delay_seconds && action.delay_seconds > 0;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:translate-y-[-2px]',
        isSelected
          ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/10'
          : 'border-border hover:border-primary/50'
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

          <Badge
            variant='secondary'
            className={cn('border', colors.bg, colors.text, colors.border)}
          >
            Action
          </Badge>
        </div>

        {/* Quick info */}
        <div className='flex flex-wrap items-center gap-2 mb-3'>
          {hasDelay && (
            <Badge variant='outline' className='text-xs gap-1'>
              <Clock className='h-3 w-3 text-muted-foreground' />
              {action.delay_seconds}s delay
            </Badge>
          )}
        </div>

        {/* Preview content */}
        <div className='bg-background/50 rounded-lg p-3 border border-border'>
          <div className='space-y-1'>
            <p className='text-xs text-muted-foreground'>
              Action configuration:
            </p>
            <p className='text-sm truncate font-mono text-foreground/70'>
              {JSON.stringify(action.params)}
            </p>
          </div>
        </div>

        {/* Validation indicator */}
        <div className='flex items-center justify-between mt-3 pt-3 border-t border-border'>
          <div className='flex items-center gap-1.5'>
            <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
            <span className='text-xs text-emerald-500'>Configured</span>
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
