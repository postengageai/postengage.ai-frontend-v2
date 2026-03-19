'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MessageCircle,
  Mail,
  CreditCard,
  Instagram,
  Settings,
  Send,
  Clock,
  Lightbulb,
  AlertCircle,
  Plus,
  ChevronRight,
  Circle,
  Tag,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { parseApiError } from '@/lib/http/errors';
import {
  SupportApi,
  type SupportTicket,
  type TicketCategory,
  type TicketStatus,
} from '@/lib/api/support';

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const faqItems = [
  {
    question: 'How do credits work?',
    answer:
      'Credits are consumed only when AI generates a reply. Manual actions (simple replies, DMs) are free (0 credits). AI-generated replies cost between 6-13 credits depending on complexity. If you use your own API key (BYOM), AI actions cost only 1 credit for infrastructure.',
  },
  {
    question: "Why isn't my automation triggering?",
    answer:
      "There are a few common reasons: 1) Make sure your automation is set to 'Active' status. 2) Check that your Instagram account is still connected. 3) Verify your trigger conditions - the keywords might not match the incoming comments/DMs. 4) Ensure you have sufficient credits in your account.",
  },
  {
    question: 'How do I connect my Instagram account?',
    answer:
      "Go to Settings > Social Accounts and click 'Connect Instagram'. You'll need a Business or Creator account. Follow the Instagram authorization flow to grant PostEngageAI the necessary permissions.",
  },
  {
    question: 'What happens when I run out of credits?',
    answer:
      "When your credits reach zero, your automations will be paused automatically. You'll receive a notification before this happens. Simply purchase more credits to resume.",
  },
  {
    question: 'Can I use AI for my automated replies?',
    answer:
      "Yes! When creating an automation, toggle on 'AI-Generated Reply'. The AI will generate contextual responses based on the incoming message. You can set the tone to match your brand voice.",
  },
  {
    question: 'Is my Instagram account data secure?',
    answer:
      'Absolutely. We use OAuth 2.0 for Instagram authentication — we never store your password. All data is encrypted in transit and at rest.',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string }> = {
  open: { label: 'Open', color: 'text-amber-500' },
  in_progress: { label: 'In Progress', color: 'text-blue-500' },
  waiting_user: { label: 'Waiting on You', color: 'text-orange-500' },
  resolved: { label: 'Resolved', color: 'text-emerald-500' },
  closed: { label: 'Closed', color: 'text-muted-foreground' },
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  technical: 'Technical Issue',
  billing: 'Billing & Credits',
  account: 'Account & Login',
  instagram: 'Instagram Integration',
  feature: 'Feature Request',
  other: 'Other',
};

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Ticket Row ───────────────────────────────────────────────────────────────

function TicketRow({ ticket }: { ticket: SupportTicket }) {
  const router = useRouter();
  const cfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
  const ticketId = ticket._id || ticket.id;

  return (
    <div
      className='flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors'
      onClick={() => router.push(`/dashboard/help/${ticketId}`)}
    >
      <Circle
        className={`h-2.5 w-2.5 flex-shrink-0 fill-current ${cfg.color}`}
      />
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 mb-0.5 flex-wrap'>
          <span className='text-xs font-mono text-muted-foreground'>
            {ticket.ticket_number}
          </span>
          <Badge variant='outline' className='text-xs px-1.5 py-0'>
            {CATEGORY_LABELS[ticket.category] ?? ticket.category}
          </Badge>
          {ticket.unread_count > 0 && (
            <Badge className='text-xs px-1.5 py-0 bg-primary text-primary-foreground'>
              {ticket.unread_count} new
            </Badge>
          )}
        </div>
        <p className='font-medium text-sm truncate'>{ticket.subject}</p>
        {ticket.last_message_preview && (
          <p className='text-xs text-muted-foreground truncate mt-0.5'>
            {ticket.last_message_preview}
          </p>
        )}
      </div>
      <div className='flex-shrink-0 flex flex-col items-end gap-1'>
        <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
        <span className='text-xs text-muted-foreground'>
          {timeAgo(ticket.last_message_at || ticket.created_at)}
        </span>
      </div>
      <ChevronRight className='h-4 w-4 text-muted-foreground flex-shrink-0' />
    </div>
  );
}

// ─── New Ticket Form ──────────────────────────────────────────────────────────

function NewTicketForm({
  onSuccess,
}: {
  onSuccess: (ticket: SupportTicket) => void;
}) {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<TicketCategory | ''>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    setSubmitting(true);
    try {
      const ticket = await SupportApi.createTicket({
        category: category as TicketCategory,
        subject,
        message,
      });
      toast({
        title: 'Ticket created',
        description: `${ticket.ticket_number} has been submitted. We'll get back to you shortly.`,
      });
      onSuccess(ticket);
    } catch (err) {
      const parsed = parseApiError(err);
      toast({
        title: parsed.title,
        description: parsed.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='new-category'>Category</Label>
        <Select
          value={category}
          onValueChange={v => setCategory(v as TicketCategory)}
        >
          <SelectTrigger id='new-category'>
            <SelectValue placeholder='Select a category' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='technical'>Technical Issue</SelectItem>
            <SelectItem value='billing'>Billing & Credits</SelectItem>
            <SelectItem value='account'>Account & Login</SelectItem>
            <SelectItem value='instagram'>Instagram Integration</SelectItem>
            <SelectItem value='feature'>Feature Request</SelectItem>
            <SelectItem value='other'>Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-2'>
        <Label htmlFor='new-subject'>Subject</Label>
        <Input
          id='new-subject'
          placeholder='Brief description of your issue'
          value={subject}
          onChange={e => setSubject(e.target.value)}
          required
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='new-message'>Message</Label>
        <Textarea
          id='new-message'
          placeholder='Please describe your issue in detail. Include any error messages or steps to reproduce.'
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={5}
          required
        />
      </div>
      <Button
        type='submit'
        className='w-full'
        disabled={submitting || !category || !subject || !message}
      >
        {submitting ? (
          <>
            <div className='h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2' />
            Submitting...
          </>
        ) : (
          <>
            <Send className='mr-2 h-4 w-4' />
            Submit Ticket
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HelpSupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);

  useEffect(() => {
    SupportApi.listTickets()
      .then(tickets => setTickets(Array.isArray(tickets) ? tickets : []))
      .catch(err => {
        console.error('[Help] Failed to load tickets:', err);
        setTickets([]);
      })
      .finally(() => setLoadingTickets(false));
  }, []);

  const handleNewTicket = (ticket: SupportTicket) => {
    setShowNewTicket(false);
    setTickets(prev => [ticket, ...prev]);
    router.push(`/dashboard/help/${ticket._id || ticket.id}`);
  };

  const activeTickets = tickets.filter(t =>
    ['open', 'in_progress', 'waiting_user'].includes(t.status)
  );
  const closedTickets = tickets.filter(t =>
    ['resolved', 'closed'].includes(t.status)
  );

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(
      t => t.status === 'in_progress' || t.status === 'waiting_user'
    ).length,
    resolved: tickets.filter(
      t => t.status === 'resolved' || t.status === 'closed'
    ).length,
    unread: tickets.reduce((sum, t) => sum + (t.unread_count ?? 0), 0),
  };

  return (
    <div className='min-h-screen pb-20 md:pb-0'>
      <div className='px-4 py-8 md:py-12'>
        <div className='mx-auto max-w-6xl space-y-12'>
          {/* Tickets section */}
          <section>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
                  <MessageCircle className='h-5 w-5 text-primary' />
                </div>
                <div>
                  <h2 className='text-xl md:text-2xl font-semibold'>
                    My Support Tickets
                  </h2>
                  <p className='text-sm text-muted-foreground'>
                    Tap a ticket to continue the conversation
                  </p>
                </div>
              </div>
              <Button size='sm' onClick={() => setShowNewTicket(v => !v)}>
                <Plus className='mr-2 h-4 w-4' />
                New Ticket
              </Button>
            </div>

            {/* Stats strip — only when there are tickets */}
            {!loadingTickets && tickets.length > 0 && (
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6'>
                <div className='rounded-xl border bg-card p-4 flex flex-col gap-1'>
                  <span className='text-xs text-muted-foreground'>Total</span>
                  <span className='text-2xl font-bold'>{stats.total}</span>
                </div>
                <div className='rounded-xl border bg-amber-500/5 border-amber-500/20 p-4 flex flex-col gap-1'>
                  <span className='text-xs text-amber-500'>Open</span>
                  <span className='text-2xl font-bold text-amber-500'>
                    {stats.open}
                  </span>
                </div>
                <div className='rounded-xl border bg-blue-500/5 border-blue-500/20 p-4 flex flex-col gap-1'>
                  <span className='text-xs text-blue-500'>In Progress</span>
                  <span className='text-2xl font-bold text-blue-500'>
                    {stats.in_progress}
                  </span>
                </div>
                <div className='rounded-xl border bg-emerald-500/5 border-emerald-500/20 p-4 flex flex-col gap-1'>
                  <span className='text-xs text-emerald-500'>Resolved</span>
                  <span className='text-2xl font-bold text-emerald-500'>
                    {stats.resolved}
                  </span>
                </div>
              </div>
            )}

            {showNewTicket && (
              <Card className='mb-6 border-primary/30'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <Tag className='h-4 w-4 text-primary' />
                    Submit a Support Ticket
                  </CardTitle>
                  <CardDescription>
                    Describe your issue and our team will respond as quickly as
                    possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NewTicketForm onSuccess={handleNewTicket} />
                </CardContent>
              </Card>
            )}

            {loadingTickets ? (
              <div className='space-y-3'>
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className='h-20 rounded-lg border bg-muted animate-pulse'
                  />
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <Card>
                <CardContent className='py-12 text-center'>
                  <div className='mx-auto h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4'>
                    <MessageCircle className='h-7 w-7 text-muted-foreground' />
                  </div>
                  <p className='font-medium mb-1'>No support tickets yet</p>
                  <p className='text-sm text-muted-foreground mb-4'>
                    Got an issue? Hit "New Ticket" and our team will help you
                    out.
                  </p>
                  <Button
                    variant='outline'
                    onClick={() => setShowNewTicket(true)}
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Create First Ticket
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className='space-y-2'>
                {activeTickets.length > 0 && (
                  <>
                    <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide px-1'>
                      Active ({activeTickets.length})
                    </p>
                    {activeTickets.map(t => (
                      <TicketRow key={t._id || t.id} ticket={t} />
                    ))}
                  </>
                )}
                {closedTickets.length > 0 && (
                  <>
                    <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide px-1 pt-4'>
                      Closed ({closedTickets.length})
                    </p>
                    {closedTickets.map(t => (
                      <TicketRow key={t._id || t.id} ticket={t} />
                    ))}
                  </>
                )}
              </div>
            )}
          </section>

          {/* FAQ */}
          <section id='faq'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10'>
                <Lightbulb className='h-5 w-5 text-amber-500' />
              </div>
              <h2 className='text-xl md:text-2xl font-semibold'>
                Frequently Asked Questions
              </h2>
            </div>
            <Card>
              <CardContent className='p-4 md:p-6'>
                <Accordion type='single' collapsible className='w-full'>
                  {faqItems.map((item, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className='text-left hover:no-underline hover:text-primary'>
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className='text-muted-foreground'>
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>

          {/* Contact cards */}
          <section>
            <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              <Card>
                <CardContent className='p-5 flex items-center gap-4'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10'>
                    <Mail className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <p className='font-medium text-sm'>Email</p>
                    <a
                      href='mailto:support@postengage.ai'
                      className='text-xs text-primary hover:underline'
                    >
                      support@postengage.ai
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-5 flex items-center gap-4'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10'>
                    <Clock className='h-5 w-5 text-emerald-500' />
                  </div>
                  <div>
                    <p className='font-medium text-sm'>Response Time</p>
                    <p className='text-xs text-muted-foreground'>
                      Usually within a few hours
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-primary/5 border-primary/20'>
                <CardContent className='p-5 flex items-center gap-4'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10'>
                    <AlertCircle className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <p className='font-medium text-sm'>Urgent Issues</p>
                    <p className='text-xs text-muted-foreground'>
                      Add "URGENT" in your subject
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='p-5'>
                  <p className='font-medium text-sm mb-2'>Quick Links</p>
                  <div className='space-y-1.5'>
                    <Link
                      href='/dashboard/settings'
                      className='flex items-center gap-2 text-xs text-muted-foreground hover:text-primary'
                    >
                      <Settings className='h-3.5 w-3.5' />
                      Account Settings
                    </Link>
                    <Link
                      href='/dashboard/credits'
                      className='flex items-center gap-2 text-xs text-muted-foreground hover:text-primary'
                    >
                      <CreditCard className='h-3.5 w-3.5' />
                      Manage Credits
                    </Link>
                    <Link
                      href='/dashboard/settings/social-accounts'
                      className='flex items-center gap-2 text-xs text-muted-foreground hover:text-primary'
                    >
                      <Instagram className='h-3.5 w-3.5' />
                      Social Accounts
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
