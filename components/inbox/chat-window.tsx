import React, { useState, useEffect, useRef } from 'react';
import {
  useInboxMessages,
  useSelectedConversationId,
  useInboxActions,
  useInboxConversations,
} from '@/lib/inbox/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Send,
  Paperclip,
  MoreVertical,
  Smile,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInHours, parseISO } from 'date-fns';
import { inboxApi } from '@/lib/api/inbox';
import { toast } from 'sonner';

export function ChatWindow() {
  const selectedId = useSelectedConversationId();
  const conversations = useInboxConversations();
  const messages = useInboxMessages(selectedId || '');
  const { addMessage, setMessages, setLoadingMessages } = useInboxActions();

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [useHumanAgent, setUseHumanAgent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find(c => c._id === selectedId);

  // Fetch messages and mark as read when selected conversation changes
  useEffect(() => {
    if (!selectedId) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const response = await inboxApi.getMessages(selectedId);
        setMessages(selectedId, response.data);

        // Mark as read
        if (conversation?.unread_count && conversation.unread_count > 0) {
          await inboxApi.markRead(selectedId);
          // TODO: Update local unread count in store
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedId, setMessages, setLoadingMessages, conversation?.unread_count]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 24h Window Logic
  const lastUserMessage = [...messages].reverse().find(m => m.is_from_user);
  const hoursSinceLastUserMessage = lastUserMessage
    ? differenceInHours(new Date(), parseISO(lastUserMessage.timestamp))
    : 0;

  // If no user message, assume open (or handle differently).
  // Usually for Instagram, we need a user interaction.
  // If > 24h, window is closed.
  const isWindowClosed = lastUserMessage && hoursSinceLastUserMessage >= 24;

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedId) return;

    setIsSending(true);
    const tempId = Date.now().toString();
    const content = inputText;

    // Optimistic update
    const optimisticMessage = {
      _id: tempId,
      conversation_id: selectedId,
      sender_id: 'me',
      content: { text: content },
      timestamp: new Date().toISOString(),
      is_from_user: false,
      is_read: true,
      status: 'sent' as const,
    };

    addMessage(selectedId, optimisticMessage);
    setInputText('');

    try {
      const tag = isWindowClosed && useHumanAgent ? 'HUMAN_AGENT' : undefined;
      await inboxApi.sendMessage(selectedId, { text: content }, tag);
      // In a real app, we might replace the temp message with the real one from response
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      // TODO: Mark message as failed in store
    } finally {
      setIsSending(false);
    }
  };

  if (!selectedId || !conversation) {
    return (
      <div className='flex-1 flex items-center justify-center bg-muted/20'>
        <div className='text-center text-muted-foreground'>
          <p>Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 flex flex-col h-full'>
      {/* Header */}
      <div className='p-4 border-b flex items-center justify-between bg-background'>
        <div className='flex items-center gap-3'>
          <Avatar>
            <AvatarImage src={conversation.lead?.profile_picture} />
            <AvatarFallback>
              {conversation.lead?.full_name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className='font-semibold'>
              {conversation.lead?.full_name || 'Unknown User'}
            </h3>
            <p className='text-xs text-muted-foreground'>
              @{conversation.lead?.username}
            </p>
          </div>
        </div>
        <Button variant='ghost' size='icon'>
          <MoreVertical className='h-5 w-5' />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className='flex-1 p-4'>
        <div className='flex flex-col gap-4'>
          {messages.map(msg => (
            <div
              key={msg._id}
              className={cn(
                'flex max-w-[70%]',
                msg.is_from_user ? 'self-start' : 'self-end'
              )}
            >
              <div
                className={cn(
                  'p-3 rounded-lg text-sm',
                  msg.is_from_user
                    ? 'bg-muted text-foreground rounded-tl-none'
                    : 'bg-primary text-primary-foreground rounded-tr-none'
                )}
              >
                {msg.content.text}
                <span className='text-[10px] opacity-70 block text-right mt-1'>
                  {format(parseISO(msg.timestamp), 'h:mm a')}
                </span>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* 24h Window Warning */}
      {isWindowClosed && (
        <div className='px-4 py-2 bg-yellow-500/10 border-t border-yellow-500/20 flex items-center justify-between'>
          <div className='flex items-center gap-2 text-yellow-600 text-sm'>
            <AlertTriangle className='h-4 w-4' />
            <span>
              24h window closed ({hoursSinceLastUserMessage}h ago). Standard
              replies may fail.
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Checkbox
              id='human-agent'
              checked={useHumanAgent}
              onCheckedChange={c => setUseHumanAgent(!!c)}
            />
            <Label htmlFor='human-agent' className='text-sm cursor-pointer'>
              Use Human Agent Tag
            </Label>
          </div>
        </div>
      )}

      {/* Input */}
      <div className='p-4 border-t bg-background'>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='icon'>
            <Paperclip className='h-5 w-5' />
          </Button>
          <Input
            placeholder='Type a message...'
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            className='flex-1'
            disabled={isSending}
          />
          <Button variant='ghost' size='icon'>
            <Smile className='h-5 w-5' />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isSending}
          >
            <Send className='h-5 w-5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
