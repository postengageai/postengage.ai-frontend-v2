import React, { useState, useEffect } from 'react';
import {
  useInboxConversations,
  useInboxActions,
  useSelectedConversationId,
  useInboxFilters,
} from '@/lib/inbox/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Search, Filter } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { InboxConversationStatus } from '@/lib/types/inbox';

export function ConversationList() {
  const conversations = useInboxConversations();
  const selectedId = useSelectedConversationId();
  const { selectConversation, setFilters } = useInboxActions();
  const filters = useInboxFilters();

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Sync debounced search to store
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch, filters, setFilters]);

  const handleStatusChange = (status: string) => {
    setFilters({ ...filters, status: status as InboxConversationStatus });
  };

  return (
    <div className='w-80 border-r flex flex-col bg-background'>
      <div className='p-4 border-b space-y-3'>
        <div className='flex items-center justify-between'>
          <h2 className='font-semibold'>Inbox</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <Filter className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuRadioGroup
                value={filters.status || InboxConversationStatus.OPEN}
                onValueChange={handleStatusChange}
              >
                <DropdownMenuRadioItem value={InboxConversationStatus.OPEN}>
                  Open
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={InboxConversationStatus.CLOSED}>
                  Closed
                </DropdownMenuRadioItem>
                {/* <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem> */}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='relative'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search...'
            className='pl-8'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className='flex-1'>
        <div className='flex flex-col gap-0'>
          {conversations.length === 0 ? (
            <div className='p-8 text-center text-muted-foreground text-sm'>
              No conversations found.
            </div>
          ) : (
            conversations.map(conversation => (
              <button
                key={conversation._id}
                onClick={() => selectConversation(conversation._id)}
                className={cn(
                  'flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors border-b',
                  selectedId === conversation._id && 'bg-muted'
                )}
              >
                <Avatar>
                  <AvatarImage src={conversation.lead?.profile_picture} />
                  <AvatarFallback>
                    {conversation.lead?.full_name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 overflow-hidden'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='font-medium truncate text-sm'>
                      {conversation.lead?.full_name ||
                        conversation.participants[0]?.username ||
                        'Unknown'}
                    </span>
                    <span className='text-xs text-muted-foreground whitespace-nowrap ml-2'>
                      {conversation.last_message?.timestamp &&
                        formatDistanceToNow(
                          new Date(conversation.last_message.timestamp),
                          { addSuffix: true }
                        )}
                    </span>
                  </div>
                  <p className='text-sm text-muted-foreground truncate'>
                    {conversation.last_message?.content.text ||
                      'Sent an attachment'}
                  </p>
                </div>
                {conversation.unread_count > 0 && (
                  <Badge
                    variant='default'
                    className='ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center'
                  >
                    {conversation.unread_count}
                  </Badge>
                )}
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
