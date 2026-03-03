'use client';

import { format } from 'date-fns';
import { Message } from '@/lib/types/conversations';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Check, CheckCheck } from 'lucide-react';
import Image from 'next/image';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const initials = message.sender.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {!isOwn && (
        <Avatar className='h-8 w-8 shrink-0'>
          {message.sender.avatar_url && (
            <AvatarImage
              src={message.sender.avatar_url}
              alt={message.sender.name}
            />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      )}

      <div
        className={`flex flex-col gap-1 max-w-xs ${isOwn ? 'items-end' : ''}`}
      >
        {!isOwn && (
          <div className='flex items-center gap-2 px-3'>
            <span className='text-xs font-semibold text-foreground'>
              {message.sender.name}
            </span>
            {message.sender.is_verified && (
              <span className='text-blue-500' title='Verified'>
                ✓
              </span>
            )}
          </div>
        )}

        <div
          className={`rounded-lg px-4 py-2 word-wrap break-words ${
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-none'
              : 'bg-muted text-foreground rounded-bl-none'
          }`}
        >
          {message.attachments && message.attachments.length > 0 && (
            <div className='mb-2 space-y-1'>
              {message.attachments.map(attachment => (
                <div key={attachment.id}>
                  {attachment.type === 'image' && (
                    <Image
                      src={attachment.url}
                      alt='attachment'
                      width={320}
                      height={240}
                      className='max-w-xs rounded'
                    />
                  )}
                  {attachment.type === 'video' && (
                    <video
                      src={attachment.url}
                      controls
                      className='max-w-xs rounded'
                    />
                  )}
                  {attachment.type === 'file' && (
                    <a
                      href={attachment.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center gap-2 underline'
                    >
                      📎 Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
          <p className='whitespace-pre-wrap text-sm'>{message.content}</p>
        </div>

        <div
          className={`flex items-center gap-1 text-xs text-muted-foreground ${
            isOwn ? 'flex-row-reverse' : ''
          }`}
        >
          <span>{format(new Date(message.sent_at), 'HH:mm')}</span>
          {isOwn && (
            <>
              {message.read_at ? (
                <CheckCheck className='h-3 w-3' />
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
