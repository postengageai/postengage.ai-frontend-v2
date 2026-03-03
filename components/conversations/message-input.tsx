'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  isLoading = false,
  placeholder = 'Type a message...',
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await onSend(message);
      setMessage('');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = !message.trim();

  return (
    <div className='border-t border-border bg-background p-4 space-y-3'>
      <div className='flex gap-2'>
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9'
          disabled={isLoading || isSending}
        >
          <Paperclip className='h-4 w-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9'
          disabled={isLoading || isSending}
        >
          <Smile className='h-4 w-4' />
        </Button>
      </div>

      <div className='flex gap-2'>
        <Input
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || isSending}
          className='flex-1'
        />
        <Button
          onClick={handleSend}
          disabled={isEmpty || isLoading || isSending}
          size='icon'
          className='h-9 w-9'
        >
          {isSending ? (
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
          ) : (
            <Send className='h-4 w-4' />
          )}
        </Button>
      </div>
    </div>
  );
}
