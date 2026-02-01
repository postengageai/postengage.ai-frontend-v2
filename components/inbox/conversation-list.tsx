import React, { useState, useEffect } from 'react';
import {
  useInboxConversations,
  useInboxActions,
  useSelectedConversationId,
  useInboxFilters,
} from '@/lib/inbox/store';
import { inboxApi } from '@/lib/api/inbox';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Search, Instagram, Facebook } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { InboxConversationStatus, SocialPlatform } from '@/lib/types/inbox';

export function ConversationList() {
  const conversations = useInboxConversations();
  const selectedId = useSelectedConversationId();
  const {
    selectConversation,
    setFilters,
    setConversations,
    setLoadingConversations,
  } = useInboxActions();
  const filters = useInboxFilters();

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Sync debounced search to store
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch, filters, setFilters]);

  // Fetch conversations when filters change
  useEffect(() => {
    const fetchConversations = async () => {
      setLoadingConversations(true);
      try {
        const apiFilters = { ...filters };
        // Don't send 'all' status to API as it expects 'open' | 'closed' or undefined
        if (apiFilters.status === InboxConversationStatus.ALL) {
          delete apiFilters.status;
        }
        const response = await inboxApi.getConversations(apiFilters);
        setConversations(response.data);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [filters, setConversations, setLoadingConversations]);

  const handleStatusChange = (value: string) => {
    setFilters({ ...filters, status: value as InboxConversationStatus });
  };

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case SocialPlatform.INSTAGRAM:
        return <Instagram className='h-3 w-3 text-pink-600' />;
      case SocialPlatform.FACEBOOK:
        return <Facebook className='h-3 w-3 text-blue-600' />;
      default:
        return null;
    }
  };

  return (
    <div className='w-80 border-r flex flex-col bg-background h-full'>
      <div className='p-4 border-b space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='font-bold text-xl tracking-tight'>Inbox</h2>
          <Badge
            variant='outline'
            className='text-xs font-normal text-muted-foreground'
          >
            {conversations.length} chats
          </Badge>
        </div>

        <div className='relative'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search messages...'
            className='pl-9 bg-muted/40 border-none shadow-none focus-visible:ring-1 transition-all'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs
          value={filters.status || InboxConversationStatus.ALL}
          onValueChange={handleStatusChange}
          className='w-full'
        >
          <TabsList className='grid w-full grid-cols-3 h-9 bg-muted/50 p-1'>
            <TabsTrigger
              value={InboxConversationStatus.ALL}
              className='text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm'
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value={InboxConversationStatus.OPEN}
              className='text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm'
            >
              Open
            </TabsTrigger>
            <TabsTrigger
              value={InboxConversationStatus.CLOSED}
              className='text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm'
            >
              Closed
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className='flex-1'>
        <div className='flex flex-col'>
          {conversations.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-40 p-8 text-center text-muted-foreground'>
              <Search className='h-8 w-8 mb-2 opacity-20' />
              <p className='text-sm font-medium'>No conversations found</p>
              <p className='text-xs mt-1 opacity-70'>
                Try adjusting your filters
              </p>
            </div>
          ) : (
            conversations.map(conversation => {
              const isActive = selectedId === conversation._id;
              const hasUnread = (conversation.unread_count || 0) > 0;
              // Determine display name: use lead name, or participant name (excluding own account)
              const leadName =
                conversation.lead?.full_name ||
                conversation.lead?.username ||
                conversation.participants.find(
                  p => p.id !== conversation.social_account_id
                )?.username ||
                'Unknown User';

              const lastMsgText =
                conversation.last_message?.content?.text ||
                (conversation.last_message?.content?.attachments?.length
                  ? 'Sent an attachment'
                  : 'No messages yet');

              return (
                <button
                  key={conversation._id}
                  onClick={() => selectConversation(conversation._id)}
                  className={cn(
                    'group flex items-start gap-3 p-4 text-left hover:bg-muted/40 transition-all border-b border-border/40 relative',
                    isActive &&
                      'bg-muted/60 hover:bg-muted/70 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary'
                  )}
                >
                  <div className='relative shrink-0'>
                    <Avatar className='h-10 w-10 border shadow-sm'>
                      <AvatarImage
                        src={conversation.lead?.profile_picture}
                        alt={leadName}
                      />
                      <AvatarFallback className='bg-primary/10 text-primary text-xs'>
                        {leadName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm border border-border/50'>
                      {getPlatformIcon(conversation.platform)}
                    </div>
                  </div>

                  <div className='flex-1 min-w-0 space-y-1'>
                    <div className='flex justify-between items-center gap-2'>
                      <span
                        className={cn(
                          'font-medium text-sm truncate text-foreground/90',
                          hasUnread && 'font-bold text-foreground'
                        )}
                      >
                        {leadName}
                      </span>
                      {conversation.last_message?.timestamp && (
                        <span
                          className={cn(
                            'text-[10px] text-muted-foreground whitespace-nowrap tabular-nums',
                            hasUnread && 'text-primary font-medium'
                          )}
                        >
                          {new Date(
                            conversation.last_message.timestamp
                          ).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    <div className='flex justify-between items-start gap-2'>
                      <p
                        className={cn(
                          'text-xs text-muted-foreground truncate line-clamp-1 w-full',
                          hasUnread && 'text-foreground font-medium'
                        )}
                      >
                        {lastMsgText}
                      </p>
                      {hasUnread && (
                        <Badge
                          variant='default'
                          className='h-5 min-w-5 px-1.5 flex justify-center items-center rounded-full text-[10px] shadow-none animate-in zoom-in'
                        >
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
