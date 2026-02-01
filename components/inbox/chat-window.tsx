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
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  Paperclip,
  MoreVertical,
  Smile,
  AlertTriangle,
  MessageSquare,
  Instagram,
  Facebook,
  Check,
  CheckCheck,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInHours, parseISO } from 'date-fns';
import { inboxApi } from '@/lib/api/inbox';
import { MediaApi } from '@/lib/api/media';
import { toast } from 'sonner';
import { SocialPlatform } from '@/lib/types/inbox';

export function ChatWindow() {
  const selectedId = useSelectedConversationId();
  const conversations = useInboxConversations();
  const messages = useInboxMessages(selectedId);
  const {
    addMessage,
    setMessages,
    setLoadingMessages,
    updateConversation,
    updateMessage,
  } = useInboxActions();

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          // Update local unread count in store
          updateConversation(selectedId, { unread_count: 0 });
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
  }, [
    selectedId,
    setMessages,
    setLoadingMessages,
    conversation?.unread_count,
    updateConversation,
  ]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  // 24h Window Logic
  const lastUserMessage = [...messages].reverse().find(m => m.is_from_user);
  const hoursSinceLastUserMessage = lastUserMessage
    ? differenceInHours(new Date(), parseISO(lastUserMessage.timestamp))
    : 0;

  const isWindowClosed = lastUserMessage && hoursSinceLastUserMessage >= 24;

  const handleSendMessage = async () => {
    if ((!inputText.trim() && attachments.length === 0) || !selectedId) return;

    setIsSending(true);
    const content = inputText.trim();
    const currentAttachments = [...attachments];

    // Clear input immediately
    setInputText('');
    setAttachments([]);

    try {
      // 1. Send Attachments (one per message)
      for (const url of currentAttachments) {
        const tempId = Date.now().toString() + Math.random().toString();

        // Optimistic update for attachment
        addMessage(selectedId, {
          _id: tempId,
          conversation_id: selectedId,
          sender_id: 'me',
          content: {
            attachments: [{ type: 'image', url }],
          },
          timestamp: new Date().toISOString(),
          is_from_user: false,
          is_read: true,
          status: 'sent',
        });

        try {
          const response = await inboxApi.sendMessage(selectedId, {
            attachments: [url],
          });

          updateMessage(selectedId, tempId, {
            _id: response._id,
            status: 'delivered',
          });
        } catch (error) {
          console.error('Failed to send attachment:', error);
          toast.error('Failed to send attachment');
          updateMessage(selectedId, tempId, { status: 'failed' });
        }
      }

      // 2. Send Text
      if (content) {
        const tempId = Date.now().toString();

        // Optimistic update for text
        addMessage(selectedId, {
          _id: tempId,
          conversation_id: selectedId,
          sender_id: 'me',
          content: { text: content },
          timestamp: new Date().toISOString(),
          is_from_user: false,
          is_read: true,
          status: 'sent',
        });

        try {
          const response = await inboxApi.sendMessage(selectedId, {
            text: content,
          });

          updateMessage(selectedId, tempId, {
            _id: response._id,
            status: 'delivered',
          });
        } catch (error) {
          console.error('Failed to send text:', error);
          toast.error('Failed to send text');
          updateMessage(selectedId, tempId, { status: 'failed' });
        }
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG and GIF are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    setIsUploading(true);
    try {
      const response = await MediaApi.upload(file);
      if (response.data && response.data.url) {
        setAttachments(prev => [...prev, response.data.url]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedId || !conversation) {
    return (
      <div className='flex-1 flex flex-col items-center justify-center bg-muted/5 text-muted-foreground p-8 h-full'>
        <div className='bg-muted/20 p-6 rounded-full mb-6 ring-1 ring-border'>
          <MessageSquare className='h-12 w-12 opacity-40' />
        </div>
        <h3 className='text-xl font-semibold text-foreground tracking-tight'>
          No conversation selected
        </h3>
        <p className='text-sm mt-2 max-w-xs text-center text-muted-foreground/80'>
          Select a conversation from the list to start messaging
        </p>
      </div>
    );
  }

  const leadName =
    conversation.lead?.full_name ||
    conversation.lead?.username ||
    'Unknown User';
  const platformIcon =
    conversation.platform === SocialPlatform.INSTAGRAM ? (
      <Instagram className='h-4 w-4 text-pink-600' />
    ) : (
      <Facebook className='h-4 w-4 text-blue-600' />
    );

  return (
    <div className='flex-1 flex flex-col bg-background h-full overflow-hidden'>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-3 border-b shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10 border shadow-sm'>
            <AvatarImage src={conversation.lead?.profile_picture} />
            <AvatarFallback className='bg-primary/10 text-primary'>
              {leadName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='font-semibold text-sm leading-none'>{leadName}</h3>
              {conversation.lead?.tags?.map(tag => (
                <span
                  key={tag}
                  className='text-[10px] px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground font-medium'
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className='text-xs text-muted-foreground mt-1 flex items-center gap-1.5'>
              {platformIcon}
              <span className='opacity-80'>
                @{conversation.lead?.username || 'username'}
              </span>
            </p>
          </div>
        </div>

        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-muted-foreground hover:text-foreground'
          >
            <MoreVertical className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className='flex-1 bg-muted/5 p-4'>
        <div className='flex flex-col gap-6 max-w-3xl mx-auto py-4'>
          {messages.length === 0 ? (
            <div className='text-center py-10 text-muted-foreground text-sm'>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const showAvatar =
                !msg.is_from_user ||
                (index > 0 &&
                  messages[index - 1].is_from_user !== msg.is_from_user);

              return (
                <div
                  key={msg._id}
                  className={cn(
                    'flex gap-3 max-w-[85%] group',
                    msg.is_from_user ? 'mr-auto' : 'ml-auto flex-row-reverse'
                  )}
                >
                  <div className='w-8 shrink-0 flex flex-col items-center'>
                    {showAvatar && !msg.is_from_user ? (
                      <Avatar className='h-8 w-8 border bg-primary/10'>
                        <AvatarFallback className='text-xs'>ME</AvatarFallback>
                      </Avatar>
                    ) : showAvatar && msg.is_from_user ? (
                      <Avatar className='h-8 w-8 border'>
                        <AvatarImage src={conversation.lead?.profile_picture} />
                        <AvatarFallback className='text-[10px]'>
                          {leadName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className='w-8' />
                    )}
                  </div>

                  <div
                    className={cn(
                      'flex flex-col gap-1 min-w-0',
                      msg.is_from_user ? 'items-start' : 'items-end'
                    )}
                  >
                    <div
                      className={cn(
                        'px-4 py-2.5 text-sm shadow-sm break-words whitespace-pre-wrap',
                        msg.is_from_user
                          ? 'bg-background border rounded-2xl rounded-tl-none text-foreground'
                          : 'bg-primary text-primary-foreground rounded-2xl rounded-tr-none'
                      )}
                    >
                      {msg.content.text}
                      {msg.content.attachments?.map((att, i) => (
                        <div key={i} className='mt-2 rounded overflow-hidden'>
                          {/* Basic attachment placeholder */}
                          <div className='bg-black/10 p-2 text-xs flex items-center gap-2 rounded'>
                            <Paperclip className='h-3 w-3' />
                            <span>Attachment</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      className={cn(
                        'flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity px-1',
                        msg.status === 'failed' && 'opacity-100'
                      )}
                    >
                      <span className='text-[10px] text-muted-foreground tabular-nums'>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {!msg.is_from_user && (
                        <>
                          {msg.status === 'failed' ? (
                            <span className='text-[10px] text-destructive font-medium flex items-center gap-0.5'>
                              <AlertTriangle className='h-3 w-3' /> Failed
                            </span>
                          ) : msg.status === 'read' ? (
                            <CheckCheck className='h-3 w-3 text-primary' />
                          ) : (
                            <Check className='h-3 w-3 text-muted-foreground' />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className='p-4 border-t bg-background'>
        <div className='max-w-3xl mx-auto space-y-3'>
          {isWindowClosed && (
            <div className='flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-xs rounded-md border border-amber-200 dark:border-amber-900'>
              <AlertTriangle className='h-4 w-4 shrink-0' />
              <p>
                Cannot reply: 24h window closed. The user must message you
                first.
              </p>
            </div>
          )}

          {/* Attachment Preview */}
          {attachments.length > 0 && (
            <div className='flex gap-2 p-2 overflow-x-auto'>
              {attachments.map((url, i) => (
                <div key={i} className='relative group shrink-0'>
                  <img
                    src={url}
                    alt='Attachment'
                    className='h-20 w-20 object-cover rounded-lg border'
                  />
                  <button
                    onClick={() => handleRemoveAttachment(i)}
                    className='absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className='relative rounded-xl border shadow-sm bg-background focus-within:ring-1 focus-within:ring-ring transition-all'>
            <Textarea
              placeholder={
                isWindowClosed ? 'Reply unavailable' : 'Type a message...'
              }
              className='min-h-[60px] w-full resize-none border-0 bg-transparent p-3 focus-visible:ring-0 text-sm'
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isWindowClosed || isSending || isUploading}
            />

            <input
              type='file'
              ref={fileInputRef}
              className='hidden'
              accept='image/jpeg,image/png,image/gif'
              onChange={handleFileSelect}
            />

            <div className='flex items-center justify-between p-2 border-t bg-muted/10'>
              <div className='flex items-center gap-1'>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-muted-foreground hover:text-foreground'
                  disabled={isWindowClosed || isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Paperclip className='h-4 w-4' />
                  )}
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-muted-foreground hover:text-foreground'
                  disabled={isWindowClosed}
                >
                  <Smile className='h-4 w-4' />
                </Button>
              </div>

              <Button
                size='sm'
                onClick={handleSendMessage}
                disabled={
                  (!inputText.trim() && attachments.length === 0) ||
                  isSending ||
                  isWindowClosed ||
                  isUploading
                }
                className='h-8 px-4'
              >
                {isSending ? 'Sending...' : 'Send'}
                <Send className='ml-2 h-3 w-3' />
              </Button>
            </div>
          </div>

          <div className='text-center'>
            <span className='text-[10px] text-muted-foreground'>
              Press <kbd className='font-sans border rounded px-1'>Enter</kbd>{' '}
              to send,{' '}
              <kbd className='font-sans border rounded px-1'>Shift+Enter</kbd>{' '}
              for new line
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
