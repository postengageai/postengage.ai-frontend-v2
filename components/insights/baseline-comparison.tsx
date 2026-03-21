'use client';

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useBaselineComparison } from '@/lib/hooks';
import type {
  ValueDelta,
  AttributionConfidence,
} from '@/lib/api/value-analytics';

// ── Confidence dot ────────────────────────────────────────────────────────────

const CONFIDENCE_STYLE: Record<
  AttributionConfidence,
  { dot: string; label: string }
> = {
  high: { dot: 'bg-success', label: 'High confidence attribution' },
  medium: { dot: 'bg-warning', label: 'Medium confidence attribution' },
  low: { dot: 'bg-muted-foreground', label: 'Low confidence attribution' },
};

interface ConfidenceDotProps {
  readonly confidence: AttributionConfidence;
  readonly reason: string;
}

function ConfidenceDot({ confidence, reason }: ConfidenceDotProps) {
  const style = CONFIDENCE_STYLE[confidence];
  return (
    <span
      title={`${style.label}: ${reason}`}
      className={cn(
        'inline-block h-2 w-2 rounded-full shrink-0 cursor-help',
        style.dot
      )}
    />
  );
}

// ── Metric label formatter ────────────────────────────────────────────────────

const METRIC_LABELS: Record<string, string> = {
  followers: 'Followers',
  following: 'Following',
  engagement_rate: 'Engagement Rate',
  avg_likes_per_post: 'Avg Likes / Post',
  avg_comments_per_post: 'Avg Comments / Post',
  avg_saves_per_post: 'Avg Saves / Post',
  avg_reach_per_post: 'Avg Reach / Post',
  avg_impressions_per_post: 'Avg Impressions / Post',
  avg_story_views: 'Avg Story Views',
  profile_views: 'Profile Views (30d)',
};

function metricLabel(metric: string) {
  return (
    METRIC_LABELS[metric] ??
    metric.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  );
}

function formatValue(metric: string, value: number) {
  if (metric.includes('rate') || metric.includes('engagement')) {
    return `${value.toFixed(2)}%`;
  }
  return value.toLocaleString();
}

// ── Delta row ─────────────────────────────────────────────────────────────────

interface DeltaRowProps {
  readonly delta: ValueDelta;
  readonly baselineDate: string;
}

function DeltaRow({ delta, baselineDate: _baselineDate }: DeltaRowProps) {
  const isPositive = delta.delta > 0;
  const isZero = delta.delta === 0;

  const DeltaIcon = isZero ? Minus : isPositive ? ArrowUp : ArrowDown;
  const deltaColor = isZero
    ? 'text-muted-foreground'
    : isPositive
      ? 'text-success'
      : 'text-destructive';

  return (
    <tr className='border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors'>
      {/* Metric name */}
      <td className='py-2.5 pr-3 text-xs text-muted-foreground whitespace-nowrap'>
        <div className='flex items-center gap-1.5'>
          <ConfidenceDot
            confidence={delta.attribution_confidence}
            reason={delta.attribution_reason}
          />
          <span>{metricLabel(delta.metric)}</span>
        </div>
      </td>

      {/* Baseline */}
      <td className='py-2.5 px-3 text-xs text-muted-foreground text-right tabular-nums'>
        {formatValue(delta.metric, delta.baseline_value)}
      </td>

      {/* Current */}
      <td className='py-2.5 px-3 text-xs font-semibold text-foreground text-right tabular-nums'>
        {formatValue(delta.metric, delta.current_value)}
      </td>

      {/* Delta */}
      <td
        className={cn(
          'py-2.5 pl-3 text-xs font-semibold text-right tabular-nums',
          deltaColor
        )}
      >
        <div className='flex items-center justify-end gap-0.5'>
          <DeltaIcon className='h-3 w-3' />
          <span>
            {isPositive ? '+' : ''}
            {formatValue(delta.metric, delta.delta)}
          </span>
          {!isZero && (
            <span className='text-muted-foreground font-normal ml-0.5'>
              ({isPositive ? '+' : ''}
              {delta.delta_percent.toFixed(1)}%)
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Baseline Comparison Table ─────────────────────────────────────────────────

export function BaselineComparisonTable() {
  const { data, isLoading } = useBaselineComparison();

  const baselineDate = data?.baseline_captured_at
    ? new Date(data.baseline_captured_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—';

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base font-semibold'>
          Your Growth Since Using PostEngage
        </CardTitle>
        {!isLoading && data && (
          <p className='text-xs text-muted-foreground mt-0.5'>
            Baseline captured {baselineDate} · updated daily
          </p>
        )}
      </CardHeader>

      <CardContent className='pb-3'>
        {isLoading ? (
          <div className='space-y-2.5 mt-1'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-7 w-full' />
            ))}
          </div>
        ) : !data?.deltas.length ? (
          <p className='text-sm text-muted-foreground py-4 text-center'>
            Connect Instagram and activate an automation — your baseline will be
            captured automatically.
          </p>
        ) : (
          <div className='overflow-x-auto -mx-1 px-1'>
            <table className='w-full min-w-[480px]'>
              <thead>
                <tr className='border-b border-border/60'>
                  <th className='pb-2 text-left text-xs font-medium text-muted-foreground'>
                    Metric
                  </th>
                  <th className='pb-2 text-right text-xs font-medium text-muted-foreground pr-3'>
                    {baselineDate}
                  </th>
                  <th className='pb-2 text-right text-xs font-medium text-muted-foreground px-3'>
                    Today
                  </th>
                  <th className='pb-2 text-right text-xs font-medium text-muted-foreground pl-3'>
                    Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.deltas.map(d => (
                  <DeltaRow
                    key={d.metric}
                    delta={d}
                    baselineDate={baselineDate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Confidence legend */}
        {!isLoading && !!data?.deltas.length && (
          <div className='flex items-center gap-4 mt-3 pt-2 border-t border-border/40'>
            {(['high', 'medium', 'low'] as AttributionConfidence[]).map(c => (
              <div
                key={c}
                className='flex items-center gap-1.5 text-xs text-muted-foreground'
              >
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    CONFIDENCE_STYLE[c].dot
                  )}
                />
                <span className='capitalize'>{c} attribution</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
