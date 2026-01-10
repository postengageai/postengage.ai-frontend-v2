'use client';

import {
  MessageCircle,
  Mail,
  Pause,
  AlertCircle,
  SkipForward,
  Zap,
} from 'lucide-react';
import type { Activity } from '@/lib/types/dashboard';

interface ActivityItemProps {
  activity: Activity;
  isLast?: boolean;
}

export function ActivityItem({ activity, isLast = false }: ActivityItemProps) {
  // Get icon and colors based on activity type
  const getActivityStyle = () => {
    switch (activity.type) {
      case 'reply_sent':
        return {
          icon: MessageCircle,
          bgColor: 'bg-success/10',
          iconColor: 'text-success',
          label: 'Reply sent',
        };
      case 'dm_sent':
        return {
          icon: Mail,
          bgColor: 'bg-primary/10',
          iconColor: 'text-primary',
          label: 'DM sent',
        };
      case 'automation_paused':
        return {
          icon: Pause,
          bgColor: 'bg-warning/10',
          iconColor: 'text-warning',
          label: 'Paused',
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-destructive/10',
          iconColor: 'text-destructive',
          label: 'Error',
        };
      case 'skipped':
        return {
          icon: SkipForward,
          bgColor: 'bg-secondary',
          iconColor: 'text-muted-foreground',
          label: 'Skipped',
        };
      default:
        return {
          icon: MessageCircle,
          bgColor: 'bg-secondary',
          iconColor: 'text-muted-foreground',
          label: activity.type,
        };
    }
  };

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const style = getActivityStyle();
  const Icon = style.icon;

  return (
    <div className='flex gap-3'>
      {/* Timeline dot and line */}
      <div className='flex flex-col items-center'>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.bgColor}`}
        >
          <Icon className={`h-4 w-4 ${style.iconColor}`} />
        </div>
        {!isLast && <div className='w-px flex-1 bg-border my-1' />}
      </div>

      {/* Content */}
      <div className='flex-1 pb-4'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0'>
            <p className='text-sm'>
              <span className={style.iconColor}>{style.label}</span>
              {activity.description && (
                <span className='text-muted-foreground ml-1'>
                  — {activity.description}
                </span>
              )}
            </p>
            <div className='flex items-center gap-3 mt-1'>
              <span className='text-xs text-muted-foreground'>
                {activity.automationName}
              </span>
              {activity.creditCost > 0 && (
                <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <Zap className='h-3 w-3' />
                  {activity.creditCost}
                </span>
              )}
            </div>
          </div>
          <span className='text-xs text-muted-foreground shrink-0'>
            {formatTimestamp(activity.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
