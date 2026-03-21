'use client';

import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useBestTimes } from '@/lib/hooks';
import type { BestTimeRecommendation } from '@/lib/api/scheduler';

// ── Helpers ────────────────────────────────────────────────────────────────────

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function formatHour(hourUtc: number): string {
  // Display in local-ish 12h format (UTC label clarifies)
  const period = hourUtc < 12 ? 'AM' : 'PM';
  const h = hourUtc % 12 || 12;
  return `${h}:00 ${period} UTC`;
}

const CONFIDENCE_STYLE: Record<
  BestTimeRecommendation['confidence_level'],
  { badge: string; label: string }
> = {
  high: { badge: 'bg-success/15 text-success', label: 'High confidence' },
  medium: { badge: 'bg-warning/15 text-warning', label: 'Medium confidence' },
  low: { badge: 'bg-muted text-muted-foreground', label: 'Low confidence' },
};

// ── Sub-component ──────────────────────────────────────────────────────────────

interface BestTimeRowProps {
  readonly rec: BestTimeRecommendation;
  readonly rank: number;
  readonly onSelect?: (rec: BestTimeRecommendation) => void;
}

function BestTimeRow({ rec, rank, onSelect }: BestTimeRowProps) {
  const conf = CONFIDENCE_STYLE[rec.confidence_level];
  const scorePercent = Math.round(rec.engagement_score_normalized * 100);

  return (
    <button
      type='button'
      onClick={() => onSelect?.(rec)}
      className={cn(
        'w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors',
        onSelect ? 'hover:bg-muted/50 cursor-pointer' : 'cursor-default'
      )}
    >
      {/* Rank */}
      <span className='mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary'>
        {rank}
      </span>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='text-sm font-semibold text-foreground'>
            {DAY_NAMES[rec.day_of_week]}s · {formatHour(rec.hour_utc)}
          </span>
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              conf.badge
            )}
          >
            {conf.label}
          </span>
        </div>

        {/* Score bar */}
        <div className='mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden'>
          <div
            className='h-full rounded-full bg-primary transition-all'
            style={{ width: `${scorePercent}%` }}
          />
        </div>

        <p className='mt-1 text-xs text-muted-foreground line-clamp-2'>
          {rec.reasoning}
        </p>
        <p className='mt-0.5 text-xs text-muted-foreground/70'>
          Based on {rec.based_on_post_count} post
          {rec.based_on_post_count !== 1 ? 's' : ''}
        </p>
      </div>
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface BestTimePanelProps {
  readonly onSelectTime?: (rec: BestTimeRecommendation) => void;
  readonly maxItems?: number;
}

export function BestTimePanel({
  onSelectTime,
  maxItems = 3,
}: BestTimePanelProps) {
  const { data, isLoading } = useBestTimes();

  const top = data?.slice(0, maxItems) ?? [];

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
          <Clock className='h-4 w-4 text-primary' />
          Best Times to Post
        </CardTitle>
      </CardHeader>

      <CardContent className='pb-3 space-y-1'>
        {isLoading ? (
          <>
            {Array.from({ length: maxItems }).map((_, i) => (
              <Skeleton key={i} className='h-16 w-full rounded-lg' />
            ))}
          </>
        ) : top.length === 0 ? (
          <p className='py-4 text-center text-xs text-muted-foreground'>
            Keep posting — recommendations will appear once you have enough
            data.
          </p>
        ) : (
          top.map((rec, i) => (
            <BestTimeRow
              key={`${rec.day_of_week}-${rec.hour_utc}`}
              rec={rec}
              rank={i + 1}
              onSelect={onSelectTime}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
