'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import { IntelligenceApi } from '@/lib/api/intelligence';
import { AnalyticsPeriod, IntelligenceLogItem } from '@/lib/types/analytics';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/http/errors';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DECISION_LABELS: Record<string, string> = {
  auto_reply: 'Auto Reply',
  hold_for_approval: 'Hold for Approval',
  escalate_to_human: 'Escalate',
  ask_clarification: 'Clarification',
  do_nothing: 'Do Nothing',
};

const DECISION_COLORS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  auto_reply: 'default',
  hold_for_approval: 'secondary',
  escalate_to_human: 'destructive',
  ask_clarification: 'outline',
  do_nothing: 'secondary',
};

const MSG_TYPE_LABELS: Record<string, string> = {
  comment: 'Comment',
  dm: 'DM',
  story_reply: 'Story Reply',
  mention: 'Mention',
};

const periodOptions: { value: AnalyticsPeriod; label: string }[] = [
  { value: AnalyticsPeriod.LAST_7_DAYS, label: 'Last 7 days' },
  { value: AnalyticsPeriod.LAST_30_DAYS, label: 'Last 30 days' },
  { value: AnalyticsPeriod.TODAY, label: 'Today' },
  { value: AnalyticsPeriod.YESTERDAY, label: 'Yesterday' },
  { value: AnalyticsPeriod.THIS_MONTH, label: 'This month' },
  { value: AnalyticsPeriod.LAST_MONTH, label: 'Last month' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function buildInstagramUrl(item: IntelligenceLogItem): string | null {
  if (item.platform !== 'instagram') return null;
  if (item.platform_username) {
    return `https://www.instagram.com/${item.platform_username}/`;
  }
  // Fallback: direct message inbox (no deep-link without thread ID)
  return `https://www.instagram.com/direct/inbox/`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LogCard({ item }: { item: IntelligenceLogItem }) {
  const igUrl = buildInstagramUrl(item);
  const decisionLabel =
    DECISION_LABELS[item.decision_action] ?? item.decision_action;
  const decisionVariant = DECISION_COLORS[item.decision_action] ?? 'outline';
  const msgTypeLabel = MSG_TYPE_LABELS[item.message_type] ?? item.message_type;
  const confidencePct = Math.round(item.intent_confidence * 100);

  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-0'>
        {/* Top row — user + meta */}
        <div className='flex items-start gap-3 p-4 pb-3'>
          {/* Avatar placeholder */}
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
            <User className='h-4 w-4' />
          </div>

          {/* Name + time */}
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='text-sm font-semibold'>
                {item.platform_username
                  ? `@${item.platform_username}`
                  : item.platform_user_id}
              </span>
              <Badge variant='outline' className='text-[10px] px-1.5 py-0'>
                {msgTypeLabel}
              </Badge>
              <Badge
                variant={decisionVariant}
                className='text-[10px] px-1.5 py-0'
              >
                {decisionLabel}
              </Badge>
            </div>
            <p className='mt-0.5 text-[11px] text-muted-foreground'>
              {formatDate(item.created_at)} · {timeAgo(item.created_at)}
            </p>
          </div>

          {/* Follow-up button */}
          {igUrl && (
            <Button
              size='sm'
              variant='outline'
              className='shrink-0 h-8 gap-1.5 text-xs font-medium'
              onClick={() =>
                window.open(igUrl, '_blank', 'noopener,noreferrer')
              }
            >
              <ExternalLink className='h-3 w-3' />
              Follow up
            </Button>
          )}
        </div>

        {/* Message text */}
        <div className='px-4 pb-3'>
          <p className='rounded-md border border-border/40 bg-muted/30 px-3 py-2.5 text-sm leading-relaxed'>
            &ldquo;{item.message_text}&rdquo;
          </p>
        </div>

        {/* Stats row */}
        <div className='flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/30 px-4 py-2.5 text-[11px] text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <ShieldAlert className='h-3 w-3' />
            Confidence:{' '}
            <strong className='text-foreground'>{confidencePct}%</strong>
          </span>
          {item.risk_score > 0 && (
            <span className='flex items-center gap-1'>
              Risk:{' '}
              <strong className='text-foreground'>
                {item.risk_score.toFixed(2)}
              </strong>
            </span>
          )}
          {item.risk_flags.length > 0 && (
            <span className='flex items-center gap-1'>
              Flags:{' '}
              {item.risk_flags.map(f => (
                <Badge
                  key={f}
                  variant='destructive'
                  className='text-[9px] px-1 py-0'
                >
                  {f}
                </Badge>
              ))}
            </span>
          )}
          {item.intent_reasoning && (
            <span className='truncate max-w-xs'>
              Reasoning: <em>{item.intent_reasoning}</em>
            </span>
          )}
        </div>

        {/* AI response (if any) */}
        {item.response_text && (
          <div className='border-t border-border/30 bg-primary/5 px-4 py-2.5'>
            <p className='mb-1 text-[10px] font-semibold uppercase tracking-wide text-primary/70'>
              AI Reply
            </p>
            <p className='text-xs leading-relaxed text-foreground/80'>
              {item.response_text}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LogCardSkeleton() {
  return (
    <Card>
      <CardContent className='p-4 space-y-3'>
        <div className='flex items-start gap-3'>
          <Skeleton className='h-9 w-9 rounded-full' />
          <div className='flex-1 space-y-1.5'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-24' />
          </div>
          <Skeleton className='h-8 w-24' />
        </div>
        <Skeleton className='h-12 w-full rounded-md' />
        <Skeleton className='h-3 w-48' />
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function IntentDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const label = decodeURIComponent(params.label as string);
  const initialPeriod =
    (searchParams.get('period') as AnalyticsPeriod) ??
    AnalyticsPeriod.LAST_7_DAYS;

  const [period, setPeriod] = useState<AnalyticsPeriod>(initialPeriod);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<IntelligenceLogItem[]>([]);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await IntelligenceApi.getLogsByIntent({
        intent: label,
        period,
        page,
        limit: PAGE_SIZE,
      });
      setItems(res.data?.items ?? []);
      setTotal(res.data?.total ?? 0);
    } catch (err) {
      const parsed = parseApiError(err);
      toast({
        variant: 'destructive',
        title: parsed.title,
        description: parsed.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [label, period, page, toast]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to page 1 when period changes
  useEffect(() => {
    setPage(1);
  }, [period]);

  return (
    <div className='space-y-5 p-4 sm:p-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-3 min-w-0'>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 shrink-0'
            onClick={() => router.push('/dashboard/intelligence/analytics')}
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div className='min-w-0'>
            <div className='flex items-center gap-2 flex-wrap'>
              <h1 className='text-xl sm:text-2xl font-bold tracking-tight capitalize'>
                {label.replace(/_/g, ' ')}
              </h1>
              <Badge variant='secondary' className='text-xs'>
                <MessageSquare className='mr-1 h-3 w-3' />
                Intent
              </Badge>
            </div>
            <p className='mt-0.5 text-sm text-muted-foreground'>
              {isLoading ? '…' : `${total.toLocaleString()} messages`} matching
              this intent
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className='flex shrink-0 items-center gap-2'>
          <Select
            value={period}
            onValueChange={(v: AnalyticsPeriod) => setPeriod(v)}
          >
            <SelectTrigger className='w-[150px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant='outline'
            size='icon'
            onClick={load}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </div>

      {/* Summary strip */}
      {!isLoading && items.length > 0 && (
        <div className='flex flex-wrap gap-3'>
          {/* avg confidence */}
          {(() => {
            const avg =
              items.reduce((a, i) => a + i.intent_confidence, 0) / items.length;
            return (
              <div className='flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm'>
                <Zap className='h-3.5 w-3.5 text-amber-500' />
                <span className='text-muted-foreground'>Avg. confidence</span>
                <span className='font-bold'>{(avg * 100).toFixed(1)}%</span>
              </div>
            );
          })()}
          {/* decision breakdown */}
          {(() => {
            const counts: Record<string, number> = {};
            items.forEach(i => {
              counts[i.decision_action] = (counts[i.decision_action] ?? 0) + 1;
            });
            return Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([action, cnt]) => (
                <div
                  key={action}
                  className='flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm'
                >
                  <span className='text-muted-foreground'>
                    {DECISION_LABELS[action] ?? action}
                  </span>
                  <span className='font-bold'>{cnt}</span>
                </div>
              ));
          })()}
        </div>
      )}

      {/* Message list */}
      <div className='space-y-3'>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <LogCardSkeleton key={i} />)
        ) : items.length === 0 ? (
          <div className='flex h-[300px] items-center justify-center rounded-lg border border-dashed text-muted-foreground'>
            No messages found for &ldquo;{label}&rdquo; in this period
          </div>
        ) : (
          items.map(item => <LogCard key={item._id} item={item} />)
        )}
      </div>

      {/* Pagination */}
      {!isLoading && total > PAGE_SIZE && (
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            Page {page} of {totalPages} · {total.toLocaleString()} total
          </p>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className='h-4 w-4' />
              Prev
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
