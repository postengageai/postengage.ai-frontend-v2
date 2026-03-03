'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notificationsApi } from '@/lib/api/notifications';
import { Notification } from '@/lib/types/notifications';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationsApi.getNotifications({
          limit: 5,
        });

        if (response && Array.isArray(response)) {
          setNotifications(response);
        }
      } catch (_error) {
        // Error handled silently - notifications will remain empty
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchNotifications();
    }
  }, [open]);

  const handleMarkAsRead = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? {
                ...n,
                is_read: true,
                read_at: new Date().toISOString(),
              }
            : n
        )
      );
    } catch (_error) {
      // Error handled silently - notification state remains unchanged
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative h-9 w-9'
          aria-label='Notifications'
        >
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute top-0 right-0 h-5 w-5 flex items-center justify-center p-0 text-xs'
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-80'>
        {isLoading ? (
          <div className='p-4 text-center text-sm text-muted-foreground'>
            Loading notifications...
          </div>
        ) : notifications.length > 0 ? (
          <>
            <div className='p-2 space-y-1 max-h-96 overflow-y-auto'>
              {notifications.map(notification => (
                <button
                  key={notification.id}
                  onClick={e => {
                    if (!notification.is_read) {
                      handleMarkAsRead(e, notification.id);
                    }
                  }}
                  className='w-full text-left p-2 rounded-md hover:bg-accent transition-colors'
                >
                  <div className='flex items-start gap-2'>
                    {!notification.is_read && (
                      <div className='h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0' />
                    )}
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium truncate'>
                        {notification.title}
                      </p>
                      <p className='text-xs text-muted-foreground line-clamp-2 mt-1'>
                        {notification.message}
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        {formatDistanceToNow(
                          new Date(notification.created_at),
                          { addSuffix: true }
                        )}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href='/dashboard/notifications' className='cursor-pointer'>
                View All Notifications
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <div className='p-4 text-center text-sm text-muted-foreground'>
            No notifications
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
