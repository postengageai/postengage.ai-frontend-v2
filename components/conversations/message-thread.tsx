'use client';

import { useEffect, useRef } from 'react';
import { Message, Conversation } from '@/lib/types/conversations';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  Archive,
  X,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageThreadProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string) => Promise<void>;
  onArchive?: () => void;
  onClose?: () => void;
  isLoading?: boolean;
}

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  whatsapp: MessageCircle,
};

const platformColors = {
  instagram: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
  facebook: 'bg-blue-600',
  twitter: 'bg-sky-500',
  whatsapp: 'bg-emerald-500',
};

export function MessageThread({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onArchive,
  onClose,
  isLoading = false,
}: MessageThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const PlatformIcon = platformIcons[conversation.platform];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (content: string) => {
    await onSendMessage(content);
  };

  return (
    <div className='flex flex-col h-full bg-background'>
      {/* Header */}
      <div className='border-b border-border bg-background/95 backdrop-blur-sm p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className={cn(
                'h-10 w-10 rounded-full flex items-center justify-center text-white',
                platformColors[conversation.platform]
              )}
            >
              {PlatformIcon && <PlatformIcon className='h-5 w-5' />}
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h2 className='font-semibold text-foreground'>
                  {conversation.participant.name}
                </h2>
                {conversation.participant.is_verified && (
                  <span className='text-blue-500 text-xs' title='Verified'>
                    ✓
                  </span>
                )}
              </div>
              <p className='text-xs text-muted-foreground'>
                @{conversation.participant.username}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='icon' className='h-8 w-8'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {onArchive && (
                  <DropdownMenuItem onClick={onArchive}>
                    <Archive className='h-4 w-4 mr-2' />
                    Archive
                  </DropdownMenuItem>
                )}
                {onClose && (
                  <DropdownMenuItem
                    className='text-destructive'
                    onClick={onClose}
                  >
                    <X className='h-4 w-4 mr-2' />
                    Close
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className='flex-1'>
        <div ref={scrollRef} className='p-4 space-y-4'>
          {messages.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full text-center py-8'>
              <MessageCircle className='h-12 w-12 text-muted-foreground/30 mb-3' />
              <p className='text-sm text-muted-foreground'>
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map(message => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <MessageInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
