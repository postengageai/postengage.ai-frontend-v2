'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Flame,
  ExternalLink,
  MessageCircle,
  ShoppingBag,
  Tag,
  HelpCircle,
  Search,
  RefreshCw,
  Inbox,
  MessagesSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { analytics } from '@/lib/analytics';
import { IntelligenceApi } from '@/lib/api/intelligence';
import type { HotLead } from '@/lib/types/intelligence';
import { IntentLabel } from '@/lib/types/intelligence';
import { formatDistanceToNow, format } from 'date-fns';

// ─── Intent config ────────────────────────────────────────────────────────────

const INTENT_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  [IntentLabel.PURCHASE_INTENT]: {
    label: 'Buying Intent',
    color:
      'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    icon: <ShoppingBag className='h-3 w-3' />,
  },
  [IntentLabel.PRICING_INQUIRY]: {
    label: 'Price Inquiry',
    color:
      'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    icon: <Tag className='h-3 w-3' />,
  },
  [IntentLabel.HIGH_VALUE_LEAD]: {
    label: 'High Value',
    color:
      'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    icon: <Flame className='h-3 w-3' />,
  },
  [IntentLabel.TRUST_CONCERN]: {
    label: 'Trust Concern',
    color:
      'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    icon: <HelpCircle className='h-3 w-3' />,
  },
};

const INTENT_OPTIONS = [
  { value: 'all', label: 'All intents' },
  { value: IntentLabel.PURCHASE_INTENT, label: 'Buying Intent' },
  { value: IntentLabel.PRICING_INQUIRY, label: 'Price Inquiry' },
  { value: IntentLabel.HIGH_VALUE_LEAD, label: 'High Value' },
  { value: IntentLabel.TRUST_CONCERN, label: 'Trust Concern' },
];

// ─── Lead row ─────────────────────────────────────────────────────────────────

function LeadRow({ lead }: { lead: HotLead }) {
  const intentCfg = INTENT_CONFIG[lead.intent.label] ?? {
    label: lead.intent.label,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: <MessageCircle className='h-3 w-3' />,
  };

  const displayName = lead.platform_username
    ? `@${lead.platform_username}`
    : `User ${lead.platform_user_id.slice(-6)}`;

  // ig.me/m/ works with both usernames and numeric Instagram user IDs
  const instagramLink = `https://ig.me/m/${lead.platform_username ?? lead.platform_user_id}`;
  const messageCount = lead.message_count ?? 1;

  const timeAgo = formatDistanceToNow(new Date(lead.created_at), {
    addSuffix: true,
  });
  const fullDate = format(new Date(lead.created_at), 'MMM d, yyyy h:mm a');

  return (
    <div className='flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/20 transition-colors'>
      {/* Avatar + name */}
      <div className='flex items-start gap-3 min-w-0 sm:w-48 shrink-0'>
        <div className='h-9 w-9 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-white text-sm font-bold shrink-0'>
          {displayName[0].toUpperCase()}
        </div>
        <div className='min-w-0'>
          <div className='flex items-center gap-1.5'>
            <p className='text-sm font-semibold text-foreground truncate'>
              {displayName}
            </p>
            {messageCount > 1 && (
              <span className='inline-flex items-center gap-0.5 text-xs text-muted-foreground shrink-0'>
                <MessagesSquare className='h-3 w-3' />
                {messageCount}
              </span>
            )}
          </div>
          <p
            className='text-xs text-muted-foreground truncate'
            title={fullDate}
          >
            {timeAgo}
          </p>
        </div>
      </div>

      {/* Message + reply */}
      <div className='flex-1 min-w-0 space-y-1.5'>
        <p className='text-sm text-foreground bg-muted/50 rounded px-2.5 py-1.5 line-clamp-2'>
          &ldquo;{lead.message_text}&rdquo;
        </p>
        {lead.bot_reply && (
          <p className='text-xs text-muted-foreground line-clamp-2 px-1'>
            <span className='font-medium text-foreground'>Bot replied:</span>{' '}
            {lead.bot_reply}
          </p>
        )}
      </div>

      {/* Intent badge + CTA */}
      <div className='flex sm:flex-col items-center sm:items-end gap-2 shrink-0'>
        <Badge
          variant='outline'
          className={cn(
            'flex items-center gap-1 text-xs whitespace-nowrap',
            intentCfg.color
          )}
        >
          {intentCfg.icon}
          {intentCfg.label}
        </Badge>
        <Button
          variant='outline'
          size='sm'
          className='h-7 text-xs gap-1 border-pink-200 text-pink-600 hover:text-pink-700 hover:bg-pink-50 px-2.5 whitespace-nowrap'
          asChild
        >
          <a
            href={instagramLink}
            target='_blank'
            rel='noopener noreferrer'
            onClick={() =>
              analytics.track('lead_card_clicked', {
                lead_id: lead.id,
                intent: lead.intent.label,
                username: lead.platform_username ?? undefined,
              })
            }
          >
            Follow up
            <ExternalLink className='h-3 w-3' />
          </a>
        </Button>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function LeadRowSkeleton() {
  return (
    <div className='flex gap-4 p-4 rounded-lg border border-border'>
      <Skeleton className='h-9 w-9 rounded-full shrink-0' />
      <div className='flex-1 space-y-2'>
        <Skeleton className='h-3 w-32' />
        <Skeleton className='h-8 w-full rounded' />
      </div>
      <Skeleton className='h-6 w-24 rounded-full shrink-0' />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const [leads, setLeads] = useState<HotLead[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [intentFilter, setIntentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const fetchLeads = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await IntelligenceApi.getHotLeads({ limit: 100 });
      setLeads(res.data.data);
      setTotal(res.data.total);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Filter + search client-side
  const filtered = leads.filter(lead => {
    const matchesIntent =
      intentFilter === 'all' || lead.intent.label === intentFilter;
    const matchesSearch =
      !search ||
      lead.message_text.toLowerCase().includes(search.toLowerCase()) ||
      (lead.platform_username ?? '')
        .toLowerCase()
        .includes(search.toLowerCase());
    return matchesIntent && matchesSearch;
  });

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  // Intent summary counts
  const intentCounts = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.intent.label] = (acc[lead.intent.label] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className='p-4 sm:p-6 lg:p-8 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2'>
            <Flame className='h-7 w-7 text-orange-500' />
            Hot Leads
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            High-intent DMs detected by your bots — ready for follow-up.
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => fetchLeads(true)}
          disabled={isRefreshing}
          className='gap-2 self-start sm:self-auto'
        >
          <RefreshCw
            className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
          />
          Refresh
        </Button>
      </div>

      {/* Intent summary pills */}
      {!isLoading && total > 0 && (
        <div className='flex flex-wrap gap-2'>
          {Object.entries(intentCounts).map(([label, count]) => {
            const cfg = INTENT_CONFIG[label];
            if (!cfg) return null;
            return (
              <Badge
                key={label}
                variant='outline'
                className={cn(
                  'flex items-center gap-1.5 text-xs cursor-pointer transition-opacity',
                  cfg.color,
                  intentFilter !== 'all' &&
                    intentFilter !== label &&
                    'opacity-40'
                )}
                onClick={() =>
                  setIntentFilter(prev => (prev === label ? 'all' : label))
                }
              >
                {cfg.icon}
                {cfg.label}
                <span className='font-bold'>{count}</span>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className='pt-4 pb-4'>
          <div className='flex flex-col sm:flex-row gap-3'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search by username or message...'
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className='pl-9'
              />
            </div>
            <Select
              value={intentFilter}
              onValueChange={v => {
                setIntentFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className='w-full sm:w-44'>
                <SelectValue placeholder='Filter by intent' />
              </SelectTrigger>
              <SelectContent>
                {INTENT_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads list */}
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base'>
              {isLoading
                ? 'Loading leads...'
                : `${filtered.length} lead${filtered.length !== 1 ? 's' : ''}${intentFilter !== 'all' || search ? ' (filtered)' : ''}`}
            </CardTitle>
            {total > 0 && (
              <CardDescription>{total} total captured</CardDescription>
            )}
          </div>
        </CardHeader>
        <CardContent className='space-y-3'>
          {isLoading ? (
            <>
              <LeadRowSkeleton />
              <LeadRowSkeleton />
              <LeadRowSkeleton />
              <LeadRowSkeleton />
              <LeadRowSkeleton />
            </>
          ) : filtered.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <Inbox className='h-10 w-10 text-muted-foreground/40 mb-3' />
              <p className='text-sm font-medium text-muted-foreground'>
                {total === 0
                  ? 'No hot leads yet'
                  : 'No leads match your filter'}
              </p>
              <p className='text-xs text-muted-foreground/70 mt-1 max-w-xs'>
                {total === 0
                  ? 'Your bots will surface high-intent DMs here as they reply'
                  : 'Try adjusting your search or intent filter'}
              </p>
            </div>
          ) : (
            <>
              {paginated.map(lead => (
                <LeadRow key={lead.id} lead={lead} />
              ))}
              {hasMore && (
                <div className='pt-2 flex justify-center'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(p => p + 1)}
                    className='gap-2'
                  >
                    Load more leads
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
