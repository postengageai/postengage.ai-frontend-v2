'use client';

import { useEffect, useCallback, useState } from 'react';
import {
  Bell,
  CheckCheck,
  Zap,
  AlertTriangle,
  Info,
  Megaphone,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
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

// ─── Noise filter ──────────────────────────────────────────────────────────
// Bot replies fire once per message — at scale that's thousands of
// low-signal notifications. The Activity page still shows them.
// The bell only surfaces things that need the user's attention.
const NOISY_TAGS = new Set(['bot_reply', 'automation_triggered', 'automation']);

function isImportant(n: Notification): boolean {
  if (n.tags?.some(t => NOISY_TAGS.has(t))) {
    // Allow through if it's HIGH/URGENT priority (e.g. bot rate-limit hit)
    return (
      n.priority === NotificationPriority.HIGH ||
      n.priority === NotificationPriority.URGENT
    );
  }
  return true;
}

// ─── Icon resolver ─────────────────────────────────────────────────────────

function NotifIcon({ n }: { n: Notification }) {
  const base = 'h-4 w-4 shrink-0';

  if (
    n.priority === NotificationPriority.URGENT ||
    n.priority === NotificationPriority.HIGH
  ) {
    return <AlertTriangle className={cn(base, 'text-destructive')} />;
  }

  switch (n.type) {
    case NotificationType.BILLING:
    case NotificationType.USAGE:
      return <Zap className={cn(base, 'text-amber-500')} />;
    case NotificationType.AUTOMATION:
      return <Zap className={cn(base, 'text-primary')} />;
    case NotificationType.ANNOUNCEMENT:
    case NotificationType.NEW_FEATURE:
      return <Megaphone className={cn(base, 'text-violet-500')} />;
    default:
      return <Info className={cn(base, 'text-muted-foreground')} />;
  }
}

// ─── Single row ────────────────────────────────────────────────────────────

function NotifRow({
  n,
  onClose,
  onMarkRead,
}: {
  n: Notification;
  onClose: () => void;
  onMarkRead: (id: string) => void;
}) {
  const router = useRouter();
  const isUnread = n.status === 'unread';
  const actionLabel =
    (n.metadata?.action_label as string | undefined) ?? null;

  function handleClick() {
    if (isUnread) onMarkRead(n.id);
    if (n.action_url) {
      router.push(n.action_url);
      onClose();
    }
  }

  return (
    <div
      onClick={handleClick}
      role='button'
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      className={cn(
        'group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer',
        isUnread ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'
      )}
    >
      {/* Icon */}
      <div className='mt-0.5'>
        <NotifIcon n={n} />
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <p
          className={cn(
            'text-sm leading-snug',
            isUnread
              ? 'font-semibold text-foreground'
              : 'font-medium text-muted-foreground'
          )}
        >
          {n.title}
        </p>
        {n.message && (
          <p className='text-xs text-muted-foreground mt-0.5 line-clamp-2'>
            {n.message}
          </p>
        )}
        <div className='flex items-center gap-2 mt-1'>
          <span className='text-[11px] text-muted-foreground/60'>
            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
          </span>
          {n.action_url && actionLabel && (
            <span className='text-[11px] text-primary flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity'>
              {actionLabel}
              <ArrowRight className='h-2.5 w-2.5' />
            </span>
          )}
        </div>
      </div>

      {/* Unread dot */}
      {isUnread && (
        <span className='mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0' />
      )}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function NotificationBell() {
  const qc = useQueryClient();
  const router = useRouter();

  // Unread count — background poll every 60s
  const { data: countData } = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => NotificationsApi.getUnreadCount(),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const unreadCount = countData?.data?.count ?? 0;

  // Notification list — fetched immediately and kept fresh
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () =>
      NotificationsApi.getNotifications({ limit: 30, status: 'unread' }),
    staleTime: 30_000,
  });

  // Filter noisy bot-reply events — they're visible in the Activity page
  const allNotifications: Notification[] = notificationsData?.data ?? [];
  const notifications = allNotifications.filter(isImportant);

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

  // Live refresh via Socket.IO
  const handleSocketNotif = useCallback(() => {
    qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    qc.invalidateQueries({ queryKey: queryKeys.notifications.list() });
  }, [qc]);

  useEffect(() => {
    socketService.subscribeToNotifications(handleSocketNotif);
    return () => socketService.unsubscribeFromNotifications(handleSocketNotif);
  }, [handleSocketNotif]);

  // We need a controlled state to close the popover after navigation
  // Radix Popover doesn't expose close from children; use open state trick
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className='relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors'
          aria-label='Notifications'
        >
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <span className='absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side='right'
        align='end'
        sideOffset={12}
        className='w-[340px] p-0 shadow-xl'
      >
        {/* Header */}
        <div className='flex items-center justify-between px-4 py-3 border-b border-border/60'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-semibold'>Notifications</span>
            {notifications.length > 0 && (
              <Badge variant='secondary' className='text-xs px-1.5 py-0 h-4'>
                {notifications.length}
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
        <ScrollArea className='max-h-[380px]'>
          {isLoading ? (
            <div className='p-3 space-y-1'>
              {[1, 2, 3].map(i => (
                <div key={i} className='flex items-start gap-3 p-2'>
                  <Skeleton className='h-4 w-4 rounded-full mt-0.5 shrink-0' />
                  <div className='flex-1 space-y-1.5'>
                    <Skeleton className='h-3 w-3/4' />
                    <Skeleton className='h-2.5 w-full' />
                    <Skeleton className='h-2 w-1/4' />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-2 py-10 text-center px-4'>
              <Bell className='h-8 w-8 text-muted-foreground/30' />
              <p className='text-sm font-medium text-muted-foreground'>
                You&apos;re all caught up!
              </p>
              <p className='text-xs text-muted-foreground/60'>
                No important unread notifications
              </p>
            </div>
          ) : (
            <div className='p-2 space-y-0.5'>
              {notifications.map(n => (
                <NotifRow
                  key={n.id}
                  n={n}
                  onClose={() => setOpen(false)}
                  onMarkRead={id => markRead(id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer — View all activity */}
        <div className='border-t border-border/60 px-4 py-2.5'>
          <button
            onClick={() => {
              router.push('/dashboard/activity');
              setOpen(false);
            }}
            className='flex w-full items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors'
          >
            <span>View all activity</span>
            <ExternalLink className='h-3 w-3' />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
