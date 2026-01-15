'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  Send,
  AlertCircle,
  SkipForward,
  Clock,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Activity } from '@/lib/types/dashboard';

interface LiveActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

export function LiveActivityFeed({
  activities,
  maxItems = 8,
}: LiveActivityFeedProps) {
  const [isLive, setIsLive] = useState(true);
  const displayedActivities = activities.slice(0, maxItems);
  const hasMore = activities.length > maxItems;

  // Simulate live indicator pulse
  useEffect(() => {
    if (activities.length === 0) return;
    const interval = setInterval(() => {
      setIsLive(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, [activities.length]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'reply_sent':
        return <MessageCircle className='h-4 w-4' />;
      case 'dm_sent':
        return <Send className='h-4 w-4' />;
      case 'error':
        return <AlertCircle className='h-4 w-4' />;
      case 'skipped':
        return <SkipForward className='h-4 w-4' />;
      default:
        return <Clock className='h-4 w-4' />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'reply_sent':
      case 'dm_sent':
        return 'text-success bg-success/10';
      case 'error':
        return 'text-destructive bg-destructive/10';
      case 'skipped':
        return 'text-muted-foreground bg-muted';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (activities.length === 0) {
    return <EmptyActivityState />;
  }

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <CardTitle className='text-lg'>Live Activity</CardTitle>
            {/* Live indicator */}
            <div className='flex items-center gap-1.5'>
              <div
                className={cn(
                  'h-2 w-2 rounded-full bg-success transition-opacity duration-500',
                  isLive ? 'opacity-100' : 'opacity-40'
                )}
              />
              <span className='text-xs text-muted-foreground'>Live</span>
            </div>
          </div>
          <Button variant='ghost' size='sm' className='text-muted-foreground'>
            <RefreshCw className='h-3.5 w-3.5 mr-1.5' />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className='pt-0'>
        {/* Activity list */}
        <div className='space-y-1'>
          {displayedActivities.map((activity, index) => (
            <div
              key={activity.id}
              className={cn(
                'group flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-secondary/50',
                index === 0 && 'bg-secondary/30'
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'p-1.5 rounded-md flex-shrink-0 mt-0.5',
                  getActivityColor(activity.type)
                )}
              >
                {getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between gap-2'>
                  <div className='min-w-0'>
                    <p className='text-sm font-medium truncate'>
                      {activity.description}
                    </p>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      {activity.automationName}
                    </p>
                  </div>
                  <div className='flex items-center gap-2 flex-shrink-0'>
                    {activity.creditCost > 0 && (
                      <Badge
                        variant='secondary'
                        className='text-xs font-normal'
                      >
                        -{activity.creditCost}
                      </Badge>
                    )}
                    <span className='text-xs text-muted-foreground whitespace-nowrap'>
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all link */}
        {hasMore && (
          <div className='mt-4 pt-3 border-t border-border'>
            <Link
              href='/dashboard/activity'
              className='text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1'
            >
              View all {activities.length} activities
              <ArrowRight className='h-3 w-3' />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyActivityState() {
  return (
    <Card className='overflow-hidden border-dashed'>
      <CardContent className='p-8'>
        <div className='text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
            <Sparkles className='h-6 w-6 text-primary' />
          </div>
          <h3 className='mt-4 font-semibold'>Your AI is ready</h3>
          <p className='mt-2 text-sm text-muted-foreground max-w-sm mx-auto'>
            When comments come in, you'll see every reply your AI sends right
            here. It's like watching a helpful assistant work for you.
          </p>
          <Button
            asChild
            className='mt-4 bg-transparent'
            variant='outline'
            size='sm'
          >
            <Link href='/dashboard/automations/new'>
              Create your first automation
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
