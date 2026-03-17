'use client';

import { useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Zap, AlertTriangle, Info, Megaphone } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { queryKeys } from '@/lib/hooks';
import { NotificationsApi } from '@/lib/api/notifications';
import { socketService } from '@/lib/socket/socket.service';
import {
  Notification,
  NotificationType,
  NotificationPriority,
} from '@/lib/types/notifications';

// ─── Icon resolver ─────────────────────────────────────────────────────────

function NotificationIcon({ notification }: { notification: Notification }) {
  const base = 'h-4 w-4 shrink-0 mt-0.5';

  if (
    notification.priority === NotificationPriority.URGENT ||
    notification.priority === NotificationPriority.HIGH
  ) {
    return <AlertTriangle className={cn(base, 'text-destructive')} />;
  }

  switch (notification.type) {
    case NotificationType.BILLING:
    case NotificationType.USAGE:
      return <Zap className={cn(base, 'text-warning')} />;
    case NotificationType.AUTOMATION:
      return <Zap className={cn(base, 'text-primary')} />;
    case NotificationType.ANNOUNCEMENT:
    case NotificationType.NEW_FEATURE:
      return <Megaphone className={cn(base, 'text-violet-500')} />;
    default:
      return <Info className={cn(base, 'text-muted-foreground')} />;
  }
}

// ─── Single notification row ────────────────────────────────────────────────

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  const isUnread = notification.status === 'unread';

  return (
    <button
      onClick={() => isUnread && onMarkRead(notification.id)}
      className={cn(
        'w-full text-left flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors',
        isUnread
          ? 'bg-primary/5 hover:bg-primary/10'
          : 'hover:bg-muted/50'
      )}
    >
      <NotificationIcon notification={notification} />
      <div className='flex-1 min-w-0'>
        <p
          className={cn(
            'text-sm leading-snug truncate',
            isUnread ? 'font-medium text-foreground' : 'text-muted-foreground'
          )}
        >
          {notification.title}
        </p>
        {notification.message && (
          <p className='text-xs text-muted-foreground mt-0.5 line-clamp-2 whitespace-normal'>
            {notification.message}
          </p>
        )}
        <p className='text-[11px] text-muted-foreground/70 mt-1'>
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
          })}
        </p>
      </div>
      {isUnread && (
        <span className='mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0' />
      )}
    </button>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function NotificationBell() {
  const qc = useQueryClient();

  // Unread count — polled every 60 s as a cheap background check
  const { data: countData } = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => NotificationsApi.getUnreadCount(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const unreadCount = countData?.data?.count ?? 0;

  // Notification list — fetched on popover open (enabled once we have focus)
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () =>
      NotificationsApi.getNotifications({ limit: 20, status: 'unread' }),
    staleTime: 30_000,
  });

  const notifications: Notification[] = notificationsData?.data ?? [];

  // Mark single as read
  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => NotificationsApi.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
    },
  });

  // Mark all as read
  const { mutate: markAllRead, isPending: markingAll } = useMutation({
    mutationFn: () => NotificationsApi.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
    },
  });

  // Refresh counts in real-time on socket notification events
  const handleSocketNotification = useCallback(() => {
    qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
  }, [qc]);

  useEffect(() => {
    socketService.subscribeToNotifications(handleSocketNotification);
    return () =>
      socketService.unsubscribeFromNotifications(handleSocketNotification);
  }, [handleSocketNotification]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className='relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors'
          aria-label='Notifications'
        >
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <span className='absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align='end'
        sideOffset={8}
        className='w-80 p-0 shadow-lg'
      >
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-border/50'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-semibold'>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant='secondary' className='text-xs px-1.5 py-0'>
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              disabled={markingAll}
              className='flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50'
            >
              <CheckCheck className='h-3.5 w-3.5' />
              Mark all read
            </button>
          )}
        </div>

        {/* Body */}
        <ScrollArea className='max-h-[360px]'>
          {isLoading ? (
            <div className='p-3 space-y-2'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='flex items-start gap-3 p-2'>
                  <Skeleton className='h-4 w-4 rounded-full mt-0.5' />
                  <div className='flex-1 space-y-1.5'>
                    <Skeleton className='h-3 w-3/4' />
                    <Skeleton className='h-2.5 w-full' />
                    <Skeleton className='h-2 w-1/3' />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-2 py-10 text-center'>
              <Bell className='h-8 w-8 text-muted-foreground/40' />
              <p className='text-sm text-muted-foreground'>
                You&apos;re all caught up!
              </p>
              <p className='text-xs text-muted-foreground/70'>
                No unread notifications
              </p>
            </div>
          ) : (
            <div className='p-2 space-y-0.5'>
              {notifications.map(n => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onMarkRead={id => markRead(id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className='border-t border-border/50 px-4 py-2.5'>
            <Button
              variant='ghost'
              size='sm'
              className='w-full text-xs h-7 text-muted-foreground hover:text-foreground'
              onClick={() => markAllRead()}
              disabled={markingAll || unreadCount === 0}
            >
              Clear all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
