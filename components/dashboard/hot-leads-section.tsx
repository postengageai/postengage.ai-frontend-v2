'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Flame,
  ExternalLink,
  MessageCircle,
  ShoppingBag,
  Tag,
  HelpCircle,
  ChevronRight,
  Inbox,
  MessagesSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { analytics } from '@/lib/analytics';
import { IntelligenceApi } from '@/lib/api/intelligence';
import type { HotLead } from '@/lib/types/intelligence';
import { IntentLabel } from '@/lib/types/intelligence';
import { formatDistanceToNow } from 'date-fns';

// ─── Intent display config ────────────────────────────────────────────────────

const INTENT_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  [IntentLabel.PURCHASE_INTENT]: {
    label: 'Buying Intent',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <ShoppingBag className='h-3 w-3' />,
  },
  [IntentLabel.PRICING_INQUIRY]: {
    label: 'Price Inquiry',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <Tag className='h-3 w-3' />,
  },
  [IntentLabel.HIGH_VALUE_LEAD]: {
    label: 'High Value',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: <Flame className='h-3 w-3' />,
  },
  [IntentLabel.TRUST_CONCERN]: {
    label: 'Trust Concern',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <HelpCircle className='h-3 w-3' />,
  },
};

// Build an Instagram DM link. Prefer username-based deep link; fall back to
// user-id-based link (Instagram supports ig.me/m/<id> for numeric IDs too).
function buildInstagramLink(lead: HotLead): string {
  if (lead.platform_username) {
    return `https://ig.me/m/${lead.platform_username}`;
  }
  // platform_user_id is the numeric Instagram user ID — ig.me/m/<id> works
  return `https://ig.me/m/${lead.platform_user_id}`;
}

// ─── Single Lead Card ─────────────────────────────────────────────────────────

function LeadCard({ lead }: { lead: HotLead }) {
  const intentCfg = INTENT_CONFIG[lead.intent.label] ?? {
    label: lead.intent.label,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: <MessageCircle className='h-3 w-3' />,
  };

  const displayName = lead.platform_username
    ? `@${lead.platform_username}`
    : `User ${lead.platform_user_id.slice(-6)}`;

  const instagramLink = buildInstagramLink(lead);

  const timeAgo = formatDistanceToNow(new Date(lead.created_at), {
    addSuffix: true,
  });

  const messageCount = lead.message_count ?? 1;

  return (
    <div className='flex flex-col gap-2 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors'>
      {/* Header row */}
      <div className='flex items-start justify-between gap-2'>
        <div className='flex items-center gap-2 min-w-0'>
          <div className='h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center text-white text-xs font-bold shrink-0'>
            {displayName[0].toUpperCase()}
          </div>
          <div className='min-w-0'>
            <div className='flex items-center gap-1.5'>
              <p className='text-sm font-medium text-foreground truncate'>
                {displayName}
              </p>
              {messageCount > 1 && (
                <span className='inline-flex items-center gap-0.5 text-xs text-muted-foreground'>
                  <MessagesSquare className='h-3 w-3' />
                  {messageCount}
                </span>
              )}
            </div>
            <p className='text-xs text-muted-foreground'>{timeAgo}</p>
          </div>
        </div>
        <Badge
          variant='outline'
          className={cn(
            'flex items-center gap-1 text-xs shrink-0',
            intentCfg.color
          )}
        >
          {intentCfg.icon}
          {intentCfg.label}
        </Badge>
      </div>

      {/* User message */}
      <p className='text-sm text-foreground bg-muted/50 rounded px-2.5 py-1.5 line-clamp-2'>
        &ldquo;{lead.message_text}&rdquo;
      </p>

      {/* Bot reply (if any) */}
      {lead.bot_reply && (
        <p className='text-xs text-muted-foreground line-clamp-2'>
          <span className='font-medium text-foreground'>Bot:</span>{' '}
          {lead.bot_reply}
        </p>
      )}

      {/* Follow-up CTA */}
      <div className='flex justify-end'>
        <Button
          variant='ghost'
          size='sm'
          className='h-7 text-xs gap-1 text-pink-600 hover:text-pink-700 hover:bg-pink-50 px-2'
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
            Follow up on Instagram
            <ExternalLink className='h-3 w-3' />
          </a>
        </Button>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LeadSkeleton() {
  return (
    <div className='flex flex-col gap-2 p-3 rounded-lg border border-border'>
      <div className='flex items-center gap-2'>
        <Skeleton className='h-8 w-8 rounded-full' />
        <div className='flex-1 space-y-1'>
          <Skeleton className='h-3 w-24' />
          <Skeleton className='h-2.5 w-16' />
        </div>
        <Skeleton className='h-5 w-20 rounded-full' />
      </div>
      <Skeleton className='h-8 w-full rounded' />
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function HotLeadsSection() {
  const [leads, setLeads] = useState<HotLead[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await IntelligenceApi.getHotLeads({ limit: 20 });
        setLeads(res.data.data);
        setTotal(res.data.total);
      } catch {
        // silent fail — not critical
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const visibleLeads = showAll ? leads : leads.slice(0, 5);

  return (
    <Card className='flex flex-col'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Flame className='h-4 w-4 text-orange-500' />
            Hot Leads
            {total > 0 && (
              <Badge
                variant='secondary'
                className='ml-1 text-xs bg-orange-100 text-orange-700'
              >
                {total}
              </Badge>
            )}
          </CardTitle>
          {total > 0 && (
            <p className='text-xs text-muted-foreground'>
              {total} unique {total === 1 ? 'person' : 'people'} detected
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className='flex-1 space-y-2'>
        {isLoading ? (
          <>
            <LeadSkeleton />
            <LeadSkeleton />
            <LeadSkeleton />
          </>
        ) : leads.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <Inbox className='h-8 w-8 text-muted-foreground/50 mb-2' />
            <p className='text-sm font-medium text-muted-foreground'>
              No hot leads yet
            </p>
            <p className='text-xs text-muted-foreground/70 mt-1'>
              Your bot will surface buying intent and pricing inquiries here
            </p>
          </div>
        ) : (
          <>
            {visibleLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} />
            ))}

            {leads.length > 5 && (
              <Button
                variant='ghost'
                size='sm'
                className='w-full text-xs text-muted-foreground hover:text-foreground gap-1'
                onClick={() => setShowAll(v => !v)}
              >
                {showAll ? 'Show less' : `Show ${leads.length - 5} more`}
                <ChevronRight
                  className={cn(
                    'h-3 w-3 transition-transform',
                    showAll && 'rotate-90'
                  )}
                />
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
