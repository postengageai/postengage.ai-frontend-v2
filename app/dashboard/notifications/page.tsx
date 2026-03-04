'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, CheckCheck, AlertCircle, Info, Zap } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { notificationsApi } from '@/lib/api/notifications';
import { Notification, NotificationType } from '@/lib/types/notifications';

export default function NotificationsPage() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [_page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async (isLoadMore = false) => {
    if (!isLoadMore) {
      setIsLoading(true);
      setPage(1);
    }

    try {
      const unreadOnly =
        activeTab === 'unread'
          ? true
          : activeTab === 'read'
            ? false
            : undefined;
      const response = await notificationsApi.getNotifications({
        unread_only: unreadOnly,
        limit: 20,
        cursor: undefined,
      });

      if (response && Array.isArray(response.data)) {
        if (isLoadMore) {
          setNotifications(prev => [...prev, ...response.data]);
        } else {
          setNotifications(response.data);
        }
        setHasMore(response.data.length === 20);
        if (isLoadMore) {
          setPage(p => p + 1);
        }
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load notifications',
      });
    } finally {
      if (!isLoadMore) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchNotifications(false);
  }, [activeTab]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n =>
          n.id === id
            ? {
                ...n,
                status: 'read' as const,
                read_at: new Date().toISOString(),
              }
            : n
        )
      );
      toast({
        title: 'Marked as read',
      });
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark notification as read',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(n =>
          n.status !== 'read'
            ? {
                ...n,
                status: 'read' as const,
                read_at: new Date().toISOString(),
              }
            : n
        )
      );
      toast({
        title: 'All marked as read',
      });
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark all as read',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case NotificationType.AUTOMATION:
        return <Zap className='h-5 w-5 text-blue-500' />;
      case NotificationType.SECURITY:
        return <AlertCircle className='h-5 w-5 text-red-500' />;
      case NotificationType.BILLING:
        return <Info className='h-5 w-5 text-amber-500' />;
      default:
        return <Bell className='h-5 w-5 text-gray-500' />;
    }
  };

  const unreadCount = notifications.filter(n => n.status !== 'read').length;

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='p-6 border-b border-border'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold mb-1'>Notifications</h1>
            <p className='text-muted-foreground'>
              Stay updated on your automations and account activity
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant='outline' onClick={handleMarkAllAsRead}>
              <CheckCheck className='h-4 w-4 mr-2' />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className='px-6 pt-6 border-b border-border'>
        <Tabs
          value={activeTab}
          onValueChange={val => setActiveTab(val as 'all' | 'unread' | 'read')}
        >
          <TabsList>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='unread'>
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value='read'>Read</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-6'>
        {isLoading ? (
          <div className='flex justify-center items-center h-40'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        ) : notifications.length > 0 ? (
          <div className='space-y-4'>
            {notifications.map(notification => (
              <Card
                key={notification.id}
                className={
                  notification.status !== 'read'
                    ? 'border-primary/50 bg-primary/5'
                    : ''
                }
              >
                <CardContent className='p-4'>
                  <div className='flex gap-4'>
                    {/* Icon */}
                    <div className='flex-shrink-0 mt-1'>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1'>
                          <h3 className='font-semibold text-sm'>
                            {notification.title}
                          </h3>
                          <p className='text-sm text-muted-foreground mt-1'>
                            {notification.message}
                          </p>
                        </div>

                        {notification.status !== 'read' && (
                          <div className='h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1' />
                        )}
                      </div>

                      {/* Metadata */}
                      <div className='flex items-center gap-2 mt-3 text-xs text-muted-foreground'>
                        <span>
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='flex gap-2 flex-shrink-0'>
                      {notification.status !== 'read' && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleMarkAsRead(notification.id)}
                          title='Mark as read'
                          className='h-8 w-8 p-0'
                        >
                          <Check className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {hasMore && (
              <div className='flex justify-center pt-4'>
                <Button
                  variant='outline'
                  onClick={() => fetchNotifications(true)}
                  className='w-full sm:w-auto'
                >
                  Load More Notifications
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-64 text-center'>
            <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4'>
              <Bell className='h-8 w-8 text-muted-foreground' />
            </div>
            <h3 className='font-semibold mb-2'>No notifications</h3>
            <p className='text-sm text-muted-foreground'>
              {activeTab === 'unread'
                ? 'All caught up!'
                : 'You have no notifications in this category'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
