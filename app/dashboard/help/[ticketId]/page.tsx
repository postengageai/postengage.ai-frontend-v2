'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { parseApiError } from '@/lib/http/errors';
import { socketService } from '@/lib/socket/socket.service';
import {
  SupportApi,
  type SupportTicket,
  type SupportMessage,
  type TicketStatus,
  type TicketCategory,
} from '@/lib/api/support';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; color: string; bg: string }
> = {
  open: {
    label: 'Open',
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
  },
  waiting_user: {
    label: 'Waiting on You',
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
  },
  resolved: {
    label: 'Resolved',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
  closed: { label: 'Closed', color: 'text-muted-foreground', bg: 'bg-muted' },
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  technical: 'Technical Issue',
  billing: 'Billing & Credits',
  account: 'Account & Login',
  instagram: 'Instagram Integration',
  feature: 'Feature Request',
  other: 'Other',
};

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return (
    d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  msg: SupportMessage;
  showName: boolean;
}

function MessageBubble({ msg, showName }: MessageBubbleProps) {
  const isUser = msg.sender_type === 'user';
  const isSystem = msg.sender_type === 'system';

  if (isSystem) {
    return (
      <div className='flex justify-center my-3'>
        <div className='flex items-center gap-2 bg-muted rounded-full px-4 py-1.5 text-xs text-muted-foreground max-w-sm text-center'>
          <AlertCircle className='h-3 w-3 shrink-0' />
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col mb-1', isUser ? 'items-end' : 'items-start')}
    >
      {showName && (
        <span className='text-xs text-muted-foreground mb-1 px-1'>
          {isUser ? 'You' : msg.sender_name}
        </span>
      )}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm'
        )}
      >
        {msg.content}
      </div>
      <span className='text-[10px] text-muted-foreground mt-1 px-1'>
        {formatTime(msg.created_at)}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TicketChatPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  /** True after the first socket connect — used to detect reconnects vs initial connect. */
  const hasConnectedRef = useRef(false);

  const isClosed = ticket?.status === 'resolved' || ticket?.status === 'closed';

  // ── Load initial data ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!ticketId) return;

    SupportApi.getTicket(ticketId)
      .then(({ ticket: t, messages: m }) => {
        setTicket(t);
        setMessages(m);
      })
      .catch(err => {
        const parsed = parseApiError(err);
        toast({
          title: parsed.title,
          description: parsed.message,
          variant: 'destructive',
        });
        router.push('/dashboard/help');
      })
      .finally(() => setLoading(false));
  }, [ticketId, router, toast]);

  // ── Scroll to bottom whenever messages change ──────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Real-time: incoming support messages ────────────────────────────────────
  const handleIncomingMessage = useCallback(
    (payload: {
      id: string;
      ticket_id: string;
      sender_type: string;
      sender_id: string;
      sender_name: string;
      content: string;
      created_at: string;
    }) => {
      if (payload.ticket_id !== ticketId) return;

      setMessages(prev => {
        // Deduplicate
        if (prev.some(m => m.id === payload.id || m._id === payload.id))
          return prev;
        return [
          ...prev,
          {
            id: payload.id,
            _id: payload.id,
            ticket_id: payload.ticket_id,
            sender_type: payload.sender_type as SupportMessage['sender_type'],
            sender_id: payload.sender_id,
            sender_name: payload.sender_name,
            content: payload.content,
            read: true,
            created_at: payload.created_at,
          },
        ];
      });
    },
    [ticketId]
  );

  // ── Real-time: ticket resolved / closed ─────────────────────────────────────
  const handleTicketResolved = useCallback(
    (data: { ticketId: string }) => {
      if (data.ticketId !== ticketId) return;
      setTicket(prev => (prev ? { ...prev, status: 'resolved' } : prev));
    },
    [ticketId]
  );

  useEffect(() => {
    socketService.subscribeToSupportMessage(handleIncomingMessage);
    socketService.subscribeToSupportTicketResolved(handleTicketResolved);

    // Re-fetch messages on socket reconnect so we don't miss any sent during disconnect
    const socket = socketService.getSocket();
    const handleReconnect = () => {
      if (!hasConnectedRef.current) {
        // First connect — mark as connected, initial data already loaded via REST
        hasConnectedRef.current = true;
        return;
      }
      // Reconnect — re-fetch to catch messages missed while offline
      SupportApi.getTicket(ticketId)
        .then(({ messages: m }) => {
          setMessages(prev => {
            // Merge: keep existing + add any new ones by id
            const existingIds = new Set(prev.map(msg => msg._id || msg.id));
            const newMsgs = m.filter(
              (msg: SupportMessage) => !existingIds.has(msg._id || msg.id)
            );
            return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
          });
        })
        .catch(() => {});
    };

    if (socket) {
      socket.on('connect', handleReconnect);
      // If already connected when this effect runs, mark initial connect
      if (socket.connected) hasConnectedRef.current = true;
    }

    return () => {
      socketService.unsubscribeFromSupportMessage(handleIncomingMessage);
      socketService.unsubscribeFromSupportTicketResolved(handleTicketResolved);
      socket?.off('connect', handleReconnect);
    };
  }, [handleIncomingMessage, handleTicketResolved, ticketId]);

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending || isClosed) return;

    setSending(true);
    setInput('');

    // Optimistic add
    const optimisticId = `opt-${Date.now()}`;
    const optimistic: SupportMessage = {
      id: optimisticId,
      _id: optimisticId,
      ticket_id: ticketId,
      sender_type: 'user',
      sender_id: 'me',
      sender_name: 'You',
      content,
      read: true,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const saved = await SupportApi.sendMessage(ticketId, content);
      // Replace optimistic with real
      setMessages(prev =>
        prev.map(m =>
          m.id === optimisticId
            ? {
                ...saved,
                id: saved.id || saved._id,
                _id: saved._id || saved.id,
              }
            : m
        )
      );
    } catch (err) {
      // Remove optimistic on error
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
      setInput(content);
      const parsed = parseApiError(err);
      toast({
        title: parsed.title,
        description: parsed.message,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // ── Close ticket ────────────────────────────────────────────────────────────
  const handleClose = async () => {
    if (!ticket || isClosed || closing) return;
    setClosing(true);
    try {
      await SupportApi.closeTicket(ticketId);
      setTicket(prev => (prev ? { ...prev, status: 'closed' } : prev));
      toast({
        title: 'Ticket closed',
        description: 'Feel free to open a new ticket if you need help.',
      });
    } catch (err) {
      const parsed = parseApiError(err);
      toast({
        title: parsed.title,
        description: parsed.message,
        variant: 'destructive',
      });
    } finally {
      setClosing(false);
    }
  };

  // ─── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className='flex h-[calc(100vh-4rem)] items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (!ticket) return null;

  const statusCfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className='flex flex-col h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)]'>
      {/* Header */}
      <div className='flex-shrink-0 border-b bg-background px-4 py-3'>
        <div className='mx-auto max-w-3xl flex items-center gap-3'>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 shrink-0'
            onClick={() => router.push('/dashboard/help')}
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>

          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='text-xs font-mono text-muted-foreground'>
                {ticket.ticket_number}
              </span>
              <Badge variant='outline' className='text-xs px-1.5 py-0 shrink-0'>
                {CATEGORY_LABELS[ticket.category] ?? ticket.category}
              </Badge>
              <span className={cn('text-xs font-medium', statusCfg.color)}>
                {statusCfg.label}
              </span>
            </div>
            <p className='font-semibold text-sm truncate mt-0.5'>
              {ticket.subject}
            </p>
          </div>

          {!isClosed && (
            <Button
              variant='outline'
              size='sm'
              className='shrink-0 text-xs'
              onClick={handleClose}
              disabled={closing}
            >
              {closing ? (
                <Loader2 className='h-3 w-3 animate-spin mr-1' />
              ) : (
                <X className='h-3 w-3 mr-1' />
              )}
              Close Ticket
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className='flex-1 overflow-y-auto'>
        <div className='mx-auto max-w-3xl px-4 py-4 space-y-0.5'>
          {messages.length === 0 && (
            <div className='text-center py-8 text-sm text-muted-foreground'>
              No messages yet. Our support team will respond shortly.
            </div>
          )}

          {messages.map((msg, idx) => {
            const prev = messages[idx - 1];
            const showName =
              !prev ||
              prev.sender_type !== msg.sender_type ||
              new Date(msg.created_at).getTime() -
                new Date(prev.created_at).getTime() >
                5 * 60 * 1000;

            return (
              <MessageBubble
                key={msg.id || msg._id}
                msg={msg}
                showName={showName}
              />
            );
          })}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className='flex-shrink-0 border-t bg-background px-4 py-3'>
        <div className='mx-auto max-w-3xl'>
          {isClosed ? (
            <div
              className={cn(
                'rounded-lg px-4 py-3 flex items-center gap-3',
                statusCfg.bg
              )}
            >
              <CheckCircle2
                className={cn('h-4 w-4 shrink-0', statusCfg.color)}
              />
              <div>
                <p className={cn('text-sm font-medium', statusCfg.color)}>
                  {ticket.status === 'resolved'
                    ? 'Ticket resolved'
                    : 'Ticket closed'}
                </p>
                <p className='text-xs text-muted-foreground'>
                  Need more help?{' '}
                  <button
                    className='text-primary underline'
                    onClick={() => router.push('/dashboard/help')}
                  >
                    Open a new ticket
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className='flex gap-2 items-end'>
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Type a message… (Enter to send, Shift+Enter for new line)'
                className='min-h-[44px] max-h-32 resize-none flex-1 text-sm'
                rows={1}
                disabled={sending}
              />
              <Button
                size='icon'
                className='h-11 w-11 shrink-0'
                onClick={() => void handleSend()}
                disabled={!input.trim() || sending}
              >
                {sending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Send className='h-4 w-4' />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
