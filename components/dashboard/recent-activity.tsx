'use client';

import type React from 'react';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Instagram,
  Zap,
  CreditCard,
  Settings,
  TrendingUp,
  Shield,
  Wrench,
  Sparkles,
  Megaphone,
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  Filter,
  Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  Notification,
  NotificationTypeType,
  NotificationPriorityType,
} from '@/lib/types/notifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { socketService } from '@/lib/socket/socket.service';

interface RecentActivityProps {
  notifications: Notification[];
  isLoading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onNewNotification?: (notification: Notification) => void;
}

type FilterType = 'all' | 'unread';

export function RecentActivity({
  notifications,
  isLoading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onNewNotification,
}: RecentActivityProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationTypeType | 'all'>(
    'all'
  );
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(
    notifications || []
  );

  // Sync with parent notifications
  useEffect(() => {
    setLocalNotifications(notifications || []);
  }, [notifications]);

  // Subscribe to real-time notification updates
  useEffect(() => {
    const handleNewNotification = (newNotification: Notification) => {
      // Add new notification to the top of the list
      setLocalNotifications(prev => [newNotification, ...prev]);

      // Call parent callback if provided
      onNewNotification?.(newNotification);

      // Flash UI indicator or show toast (optional)
      console.log('New notification received:', newNotification);
    };

    // Connect to socket and subscribe to notification updates
    const socket = socketService.connect();
    if (socket) {
      socketService.subscribeToNotifications(handleNewNotification);
    }

    return () => {
      if (socket) {
        socketService.unsubscribeFromNotifications(handleNewNotification);
      }
    };
  }, [onNewNotification]);

  const filteredNotifications = useMemo(() => {
    if (!localNotifications) return [];
    return localNotifications.filter(n => {
      if (filter === 'unread' && n.status !== 'unread') return false;
      if (typeFilter !== 'all' && n.type !== typeFilter) return false;
      return true;
    });
  }, [localNotifications, filter, typeFilter]);

  const unreadCount = localNotifications
    ? localNotifications.filter(n => n.status === 'unread').length
    : 0;

  const getTypeIcon = (type: NotificationTypeType) => {
    const iconClass = 'h-4 w-4';
    switch (type) {
      case 'social':
        return <Instagram className={iconClass} />;
      case 'automation':
        return <Zap className={iconClass} />;
      case 'billing':
        return <CreditCard className={iconClass} />;
      case 'system':
        return <Settings className={iconClass} />;
      case 'usage':
        return <TrendingUp className={iconClass} />;
      case 'security':
        return <Shield className={iconClass} />;
      case 'performance':
        return <TrendingUp className={iconClass} />;
      case 'maintenance':
        return <Wrench className={iconClass} />;
      case 'new_feature':
        return <Sparkles className={iconClass} />;
      case 'announcement':
        return <Megaphone className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getTypeColor = (type: NotificationTypeType) => {
    switch (type) {
      case 'social':
        return 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 text-pink-400';
      case 'automation':
        return 'bg-primary/15 text-primary';
      case 'billing':
        return 'bg-emerald-500/15 text-emerald-400';
      case 'system':
        return 'bg-muted text-muted-foreground';
      case 'usage':
        return 'bg-amber-500/15 text-amber-400';
      case 'security':
        return 'bg-red-500/15 text-red-400';
      case 'performance':
        return 'bg-blue-500/15 text-blue-400';
      case 'maintenance':
        return 'bg-orange-500/15 text-orange-400';
      case 'new_feature':
        return 'bg-violet-500/15 text-violet-400';
      case 'announcement':
        return 'bg-cyan-500/15 text-cyan-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityBadge = (priority: NotificationPriorityType) => {
    switch (priority) {
      case 'urgent':
        return (
          <Badge
            variant='outline'
            className='text-[10px] px-1.5 py-0 border-red-500/50 text-red-400 bg-red-500/10'
          >
            Urgent
          </Badge>
        );
      case 'high':
        return (
          <Badge
            variant='outline'
            className='text-[10px] px-1.5 py-0 border-amber-500/50 text-amber-400 bg-amber-500/10'
          >
            High
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const typeLabels: Record<NotificationTypeType, string> = {
    social: 'Social',
    automation: 'Automation',
    billing: 'Billing',
    system: 'System',
    usage: 'Usage',
    security: 'Security',
    performance: 'Performance',
    maintenance: 'Maintenance',
    new_feature: 'Features',
    announcement: 'Announcements',
  };

  if (isLoading) {
    return <RecentActivitySkeleton />;
  }

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-lg font-semibold'>
              Recent Activity
            </CardTitle>
            <p className='text-sm text-muted-foreground mt-0.5'>
              Latest events across your account
            </p>
          </div>
          {unreadCount > 0 && onMarkAllAsRead && (
            <Button
              variant='ghost'
              size='sm'
              onClick={onMarkAllAsRead}
              className='text-xs text-muted-foreground hover:text-foreground'
            >
              <CheckCheck className='h-3.5 w-3.5 mr-1.5' />
              Mark all read
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className='flex items-center gap-2 mt-3'>
          {/* All/Unread Toggle */}
          <div className='flex items-center bg-secondary/50 rounded-lg p-0.5'>
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                filter === 'all'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5',
                filter === 'unread'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Unread
              {unreadCount > 0 && (
                <span className='bg-primary text-primary-foreground text-[10px] px-1.5 rounded-full'>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='h-7 text-xs gap-1.5 bg-transparent'
              >
                <Filter className='h-3 w-3' />
                {typeFilter === 'all' ? 'All types' : typeLabels[typeFilter]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-40'>
              <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                <Check
                  className={cn(
                    'h-3.5 w-3.5 mr-2',
                    typeFilter === 'all' ? 'opacity-100' : 'opacity-0'
                  )}
                />
                All types
              </DropdownMenuItem>
              {(Object.keys(typeLabels) as NotificationTypeType[]).map(type => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => setTypeFilter(type)}
                >
                  <Check
                    className={cn(
                      'h-3.5 w-3.5 mr-2',
                      typeFilter === type ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {typeLabels[type]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        {filteredNotifications.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className='max-h-[400px] overflow-y-auto -mx-2 px-2 space-y-0.5'>
            {filteredNotifications.map(notification => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                getTypeIcon={getTypeIcon}
                getTypeColor={getTypeColor}
                getPriorityBadge={getPriorityBadge}
                formatTime={formatTime}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        )}

        {/* View all link */}
        {filteredNotifications.length > 0 && (
          <div className='mt-4 pt-3 border-t border-border'>
            <Link
              href='/dashboard/activity'
              className='text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1'
            >
              View all activity
              <ChevronRight className='h-3.5 w-3.5' />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface NotificationRowProps {
  notification: Notification;
  getTypeIcon: (type: NotificationTypeType) => React.ReactNode;
  getTypeColor: (type: NotificationTypeType) => string;
  getPriorityBadge: (priority: NotificationPriorityType) => React.ReactNode;
  formatTime: (dateString: string) => string;
  onMarkAsRead?: (id: string) => void;
}

function NotificationRow({
  notification,
  getTypeIcon,
  getTypeColor,
  getPriorityBadge,
  formatTime,
  onMarkAsRead,
}: NotificationRowProps) {
  const isUnread = notification.status === 'unread';

  const content = (
    <div
      className={cn(
        'group flex items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer',
        'hover:bg-secondary/60',
        isUnread && 'bg-secondary/30'
      )}
      onClick={() => isUnread && onMarkAsRead?.(notification.id)}
    >
      {/* Unread indicator */}
      <div className='flex-shrink-0 w-1.5 self-stretch flex items-center'>
        {isUnread && <div className='w-1.5 h-1.5 rounded-full bg-primary' />}
      </div>

      {/* Icon */}
      <div
        className={cn(
          'p-2 rounded-lg flex-shrink-0',
          getTypeColor(notification.type)
        )}
      >
        {getTypeIcon(notification.type)}
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-start justify-between gap-2'>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <p
                className={cn(
                  'text-sm truncate',
                  isUnread ? 'font-semibold' : 'font-medium'
                )}
              >
                {notification.title}
              </p>
              {getPriorityBadge(notification.priority)}
            </div>
            <p className='text-xs text-muted-foreground mt-0.5 line-clamp-1'>
              {notification.message}
            </p>
          </div>
          <span className='text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0'>
            {formatTime(notification.created_at)}
          </span>
        </div>

        {/* Hover action */}
        {notification.action_label && (
          <div className='mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity'>
            <span className='text-xs text-primary font-medium flex items-center gap-1'>
              {notification.action_label}
              <ChevronRight className='h-3 w-3' />
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (notification.action_url) {
    return <Link href={notification.action_url}>{content}</Link>;
  }

  return content;
}

function EmptyState({ filter }: { filter: FilterType }) {
  return (
    <div className='py-12 text-center'>
      <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
        <Inbox className='h-6 w-6 text-muted-foreground' />
      </div>
      <h3 className='mt-4 font-medium text-foreground'>
        {filter === 'unread' ? 'All caught up!' : 'No recent activity'}
      </h3>
      <p className='mt-1 text-sm text-muted-foreground max-w-xs mx-auto'>
        {filter === 'unread'
          ? "You've read all your notifications. Nice work."
          : 'New events will appear here in real time.'}
      </p>
    </div>
  );
}

function RecentActivitySkeleton() {
  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div>
            <Skeleton className='h-5 w-32' />
            <Skeleton className='h-4 w-48 mt-1' />
          </div>
        </div>
        <div className='flex items-center gap-2 mt-3'>
          <Skeleton className='h-7 w-24' />
          <Skeleton className='h-7 w-24' />
        </div>
      </CardHeader>
      <CardContent className='pt-0 space-y-2'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex items-start gap-3 p-3'>
            <Skeleton className='h-8 w-8 rounded-lg' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
            </div>
            <Skeleton className='h-3 w-12' />
            <Skeleton className='h-3 w-12' />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
