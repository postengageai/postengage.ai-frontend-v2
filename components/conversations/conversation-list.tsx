'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Conversation } from '@/lib/types/conversations';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  Archive,
} from 'lucide-react';

// Alias for platform usage
const WhatsAppIcon = MessageCircle;
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  filter?: 'all' | 'unread' | 'archived';
}

const platformIcons: Record<string, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  whatsapp: WhatsAppIcon,
};

const platformColors: Record<string, string> = {
  instagram: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
  facebook: 'bg-blue-600',
  twitter: 'bg-sky-500',
  whatsapp: 'bg-emerald-500',
};

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onSearch,
  isLoading = false,
  filter = 'all',
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'unread') return conv.unread_count > 0;
    return true;
  });

  const initials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className='flex flex-col h-full border-r border-border bg-background'>
      {/* Search */}
      <div className='border-b border-border p-4 space-y-3'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search conversations...'
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className='pl-9 bg-background/50'
          />
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className='flex-1'>
        <div className='divide-y divide-border'>
          {isLoading ? (
            <div className='flex justify-center items-center h-40'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-40 text-center'>
              <MessageCircle className='h-12 w-12 text-muted-foreground/30 mb-3' />
              <p className='text-sm text-muted-foreground'>No conversations</p>
            </div>
          ) : (
            filteredConversations.map(conversation => {
              const PlatformIcon =
                platformIcons[conversation.platform.toLowerCase()] ||
                MessageCircle;
              const isSelected = selectedId === conversation.id;
              const lastMessageTime = formatDistanceToNow(
                new Date(conversation.last_message_at),
                { addSuffix: false }
              );

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelect(conversation.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors duration-200 flex gap-3',
                    isSelected && 'bg-muted'
                  )}
                >
                  <div className='flex-shrink-0'>
                    <Avatar className='h-10 w-10'>
                      <AvatarFallback>
                        {conversation.platform_conversation_id
                          ?.slice(0, 2)
                          .toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between gap-2 mb-1'>
                      <div className='flex items-center gap-2 min-w-0'>
                        <h3 className='font-semibold text-sm truncate'>
                          Conversation {conversation.id?.slice(0, 8)}
                        </h3>
                      </div>
                      <span className='text-xs text-muted-foreground flex-shrink-0'>
                        {lastMessageTime}
                      </span>
                    </div>

                    <p className='text-xs text-muted-foreground truncate'>
                      {conversation.platform} conversation
                    </p>

                    <div className='flex items-center gap-2 mt-2'>
                      {conversation.tags.length > 0 && (
                        <Badge variant='secondary' className='text-[10px]'>
                          {conversation.tags[0]}
                        </Badge>
                      )}
                      {conversation.unread_count > 0 && (
                        <Badge className='bg-primary text-primary-foreground text-[10px]'>
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
