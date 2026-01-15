'use client';

import type React from 'react';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  ChevronLeft,
  Search,
  Trash2,
  Archive,
  MoreHorizontal,
  Inbox,
  Filter,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  Notification,
  NotificationTypeType,
  NotificationPriorityType,
  NotificationStatusType,
} from '@/lib/types/notifications';
import { notificationsApi } from '@/lib/api/notifications';
import { socketService } from '@/lib/socket/socket.service';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FilterType = 'all' | 'unread' | 'read' | 'archived';

export default function ActivityPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationTypeType | 'all'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await notificationsApi.getNotifications();
        setNotifications(response.data || []);
      } catch (err) {
        setError('Failed to load notifications');
        console.error('Error fetching notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Subscribe to real-time notification updates
  useEffect(() => {
    const handleNewNotification = (newNotification: Notification) => {
      // Add new notification to the top of the list
      setNotifications(prev => [newNotification, ...prev]);

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
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // Status filter
      if (filter === 'unread' && n.status !== 'unread') return false;
      if (filter === 'read' && n.status !== 'read') return false;
      if (filter === 'archived' && n.status !== 'archived') return false;
      if (filter === 'all' && n.status === 'archived') return false; // Hide archived in "all"

      // Type filter
      if (typeFilter !== 'all' && n.type !== typeFilter) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [notifications, filter, typeFilter, searchQuery]);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const archivedCount = notifications.filter(
    n => n.status === 'archived'
  ).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n =>
          n.id === id
            ? {
                ...n,
                status: 'read' as NotificationStatusType,
                read_at: new Date().toISOString(),
              }
            : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(n =>
          n.status === 'unread'
            ? {
                ...n,
                status: 'read' as NotificationStatusType,
                read_at: new Date().toISOString(),
              }
            : n
        )
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleArchive = (id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id
          ? {
              ...n,
              status: 'archived' as NotificationStatusType,
              archived_at: new Date().toISOString(),
            }
          : n
      )
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleBulkAction = (action: 'read' | 'archive' | 'delete') => {
    if (action === 'read') {
      setNotifications(prev =>
        prev.map(n =>
          selectedIds.has(n.id)
            ? {
                ...n,
                status: 'read' as NotificationStatusType,
                read_at: new Date().toISOString(),
              }
            : n
        )
      );
    } else if (action === 'archive') {
      setNotifications(prev =>
        prev.map(n =>
          selectedIds.has(n.id)
            ? {
                ...n,
                status: 'archived' as NotificationStatusType,
                archived_at: new Date().toISOString(),
              }
            : n
        )
      );
    } else if (action === 'delete') {
      setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
    }
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
    }
  };

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
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

  return (
    <div className='min-h-screen'>
      {/* Header */}
      <div className='border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10'>
        <div className='px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center gap-3 mb-4'>
            <Link
              href='/dashboard'
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              <ChevronLeft className='h-5 w-5' />
            </Link>
            <div>
              <h1 className='text-xl sm:text-2xl font-bold'>Activity</h1>
              <p className='text-sm text-muted-foreground'>
                All notifications and events across your account
              </p>
            </div>
          </div>

          {/* Filters Row */}
          <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
            {/* Search */}
            <div className='relative flex-1 max-w-md'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search notifications...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-9 bg-secondary/50'
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  <X className='h-4 w-4' />
                </button>
              )}
            </div>

            <div className='flex items-center gap-2 flex-wrap'>
              {/* Status Filter Tabs */}
              <div className='flex items-center bg-secondary/50 rounded-lg p-0.5'>
                {(['all', 'unread', 'read', 'archived'] as FilterType[]).map(
                  f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize flex items-center gap-1.5',
                        filter === f
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {f}
                      {f === 'unread' && unreadCount > 0 && (
                        <span className='bg-primary text-primary-foreground text-[10px] px-1.5 rounded-full'>
                          {unreadCount}
                        </span>
                      )}
                      {f === 'archived' && archivedCount > 0 && (
                        <span className='bg-muted-foreground/30 text-[10px] px-1.5 rounded-full'>
                          {archivedCount}
                        </span>
                      )}
                    </button>
                  )
                )}
              </div>

              {/* Type Filter */}
              <Select
                value={typeFilter}
                onValueChange={v =>
                  setTypeFilter(v as NotificationTypeType | 'all')
                }
              >
                <SelectTrigger className='w-[140px] h-8 text-xs bg-secondary/50'>
                  <Filter className='h-3 w-3 mr-1.5' />
                  <SelectValue placeholder='All types' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All types</SelectItem>
                  {(Object.keys(typeLabels) as NotificationTypeType[]).map(
                    type => (
                      <SelectItem key={type} value={type}>
                        {typeLabels[type]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              {/* Mark All Read */}
              {unreadCount > 0 && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleMarkAllAsRead}
                  className='h-8 text-xs bg-transparent'
                >
                  <CheckCheck className='h-3.5 w-3.5 mr-1.5' />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className='border-b border-border bg-primary/5 px-4 sm:px-6 lg:px-8 py-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <Checkbox
                checked={selectedIds.size === filteredNotifications.length}
                onCheckedChange={toggleSelectAll}
              />
              <span className='text-sm font-medium'>
                {selectedIds.size} selected
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleBulkAction('read')}
                className='h-8 text-xs'
              >
                <Check className='h-3.5 w-3.5 mr-1.5' />
                Mark read
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleBulkAction('archive')}
                className='h-8 text-xs'
              >
                <Archive className='h-3.5 w-3.5 mr-1.5' />
                Archive
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleBulkAction('delete')}
                className='h-8 text-xs text-destructive hover:text-destructive'
              >
                <Trash2 className='h-3.5 w-3.5 mr-1.5' />
                Delete
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSelectedIds(new Set())}
                className='h-8 text-xs'
              >
                <X className='h-3.5 w-3.5 mr-1.5' />
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className='px-4 sm:px-6 lg:px-8 py-4'>
        {isLoading ? (
          <div className='space-y-1'>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className='flex items-start gap-3 p-4 rounded-xl bg-secondary/30 animate-pulse'
              >
                <div className='w-4 h-4 bg-muted rounded mt-1' />
                <div className='w-1.5 h-1.5 bg-muted rounded-full' />
                <div className='w-10 h-10 bg-muted rounded-lg' />
                <div className='flex-1 space-y-2'>
                  <div className='h-4 bg-muted rounded w-1/3' />
                  <div className='h-3 bg-muted rounded w-2/3' />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className='text-center py-16'>
            <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10'>
              <X className='h-7 w-7 text-destructive' />
            </div>
            <h3 className='mt-4 text-lg font-medium text-foreground'>
              Failed to load notifications
            </h3>
            <p className='mt-1 text-sm text-muted-foreground'>{error}</p>
            <Button
              variant='outline'
              size='sm'
              className='mt-4'
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState filter={filter} searchQuery={searchQuery} />
        ) : (
          <div className='space-y-1'>
            {filteredNotifications.map(notification => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                isSelected={selectedIds.has(notification.id)}
                onToggleSelect={() => toggleSelect(notification.id)}
                getTypeIcon={getTypeIcon}
                getTypeColor={getTypeColor}
                getPriorityBadge={getPriorityBadge}
                formatTime={formatTime}
                onMarkAsRead={handleMarkAsRead}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface NotificationRowProps {
  notification: Notification;
  isSelected: boolean;
  onToggleSelect: () => void;
  getTypeIcon: (type: NotificationTypeType) => React.ReactNode;
  getTypeColor: (type: NotificationTypeType) => string;
  getPriorityBadge: (priority: NotificationPriorityType) => React.ReactNode;
  formatTime: (dateString: string) => string;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationRow({
  notification,
  isSelected,
  onToggleSelect,
  getTypeIcon,
  getTypeColor,
  getPriorityBadge,
  formatTime,
  onMarkAsRead,
  onArchive,
  onDelete,
}: NotificationRowProps) {
  const isUnread = notification.status === 'unread';
  const isArchived = notification.status === 'archived';

  return (
    <div
      className={cn(
        'group flex items-start gap-3 p-4 rounded-xl transition-all duration-200',
        'hover:bg-secondary/60 border border-transparent',
        isUnread && 'bg-secondary/30',
        isSelected && 'border-primary/50 bg-primary/5',
        isArchived && 'opacity-60'
      )}
    >
      {/* Checkbox */}
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggleSelect}
        className='mt-1'
      />

      {/* Unread indicator */}
      <div className='flex-shrink-0 w-1.5 self-stretch flex items-center'>
        {isUnread && <div className='w-1.5 h-1.5 rounded-full bg-primary' />}
      </div>

      {/* Icon */}
      <div
        className={cn(
          'p-2.5 rounded-lg flex-shrink-0',
          getTypeColor(notification.type)
        )}
      >
        {getTypeIcon(notification.type)}
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2 flex-wrap'>
              <p
                className={cn(
                  'text-sm',
                  isUnread ? 'font-semibold' : 'font-medium'
                )}
              >
                {notification.title}
              </p>
              {getPriorityBadge(notification.priority)}
              {isArchived && (
                <Badge variant='outline' className='text-[10px] px-1.5 py-0'>
                  Archived
                </Badge>
              )}
            </div>
            <p className='text-sm text-muted-foreground mt-0.5 line-clamp-2'>
              {notification.message}
            </p>

            {/* Action button */}
            {notification.action_label && notification.action_url && (
              <Link
                href={notification.action_url}
                className='inline-flex items-center gap-1 text-xs text-primary font-medium mt-2 hover:underline'
              >
                {notification.action_label}
                <ChevronRight className='h-3 w-3' />
              </Link>
            )}
          </div>

          <div className='flex items-center gap-2 flex-shrink-0'>
            <span className='text-xs text-muted-foreground whitespace-nowrap'>
              {formatTime(notification.created_at)}
            </span>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity'
                >
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-40'>
                {isUnread && (
                  <DropdownMenuItem
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <Check className='h-3.5 w-3.5 mr-2' />
                    Mark as read
                  </DropdownMenuItem>
                )}
                {!isArchived && (
                  <DropdownMenuItem onClick={() => onArchive(notification.id)}>
                    <Archive className='h-3.5 w-3.5 mr-2' />
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(notification.id)}
                  className='text-destructive focus:text-destructive'
                >
                  <Trash2 className='h-3.5 w-3.5 mr-2' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  filter,
  searchQuery,
}: {
  filter: FilterType;
  searchQuery: string;
}) {
  let title = 'No notifications';
  let description = 'New events will appear here.';

  if (searchQuery) {
    title = 'No results found';
    description = `No notifications match "${searchQuery}"`;
  } else if (filter === 'unread') {
    title = 'All caught up!';
    description = "You've read all your notifications. Nice work.";
  } else if (filter === 'archived') {
    title = 'No archived notifications';
    description = 'Archived notifications will appear here.';
  }

  return (
    <div className='py-16 text-center'>
      <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted'>
        <Inbox className='h-7 w-7 text-muted-foreground' />
      </div>
      <h3 className='mt-4 text-lg font-medium text-foreground'>{title}</h3>
      <p className='mt-1 text-sm text-muted-foreground max-w-sm mx-auto'>
        {description}
      </p>
      {searchQuery && (
        <Button
          variant='outline'
          size='sm'
          className='mt-4 bg-transparent'
          onClick={() => {}}
        >
          Clear search
        </Button>
      )}
    </div>
  );
}
