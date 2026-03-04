'use client';

import { Message } from '@/lib/types/conversations';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isFromCurrentUser: boolean;
  previousMessage?: Message;
}

export function MessageBubble({
  message,
  isFromCurrentUser,
}: MessageBubbleProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className={cn(
        'flex gap-2',
        isFromCurrentUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {!isFromCurrentUser && (
        <Avatar className='h-8 w-8 flex-shrink-0'>
          <AvatarImage src={undefined} alt='User' />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'flex flex-col gap-1',
          isFromCurrentUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'px-3 py-2 rounded-lg max-w-xs lg:max-w-md break-words',
            isFromCurrentUser
              ? 'bg-primary text-primary-foreground rounded-br-none'
              : 'bg-muted text-muted-foreground rounded-bl-none'
          )}
        >
          <p className='text-sm'>{message.text}</p>

          {message.attachments && message.attachments.length > 0 && (
            <div className='mt-2 space-y-1'>
              {message.attachments.map((attachment, idx) => (
                <a
                  key={idx}
                  href={attachment.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-xs underline hover:opacity-80 block'
                >
                  {attachment.name || attachment.type}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className='flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground'>
          <span>{formatTime(message.timestamp)}</span>
          {isFromCurrentUser && (
            <>
              {message.is_read ? (
                <CheckCheck className='h-3 w-3 text-primary' />
              ) : (
                <Check className='h-3 w-3' />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
