'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  MessageCircle,
  MousePointerClick,
  Clock,
  Info,
} from 'lucide-react';
import type { PerformanceMetrics as IPerformanceMetrics } from '@/lib/types/dashboard';
import { cn } from '@/lib/utils';

interface PerformanceMetricsProps {
  metrics: IPerformanceMetrics;
}

type Threshold = 'good' | 'fair' | 'low' | 'none';

function getThreshold(value: number, good: number, fair: number): Threshold {
  if (value === 0) return 'none';
  if (value >= good) return 'good';
  if (value >= fair) return 'fair';
  return 'low';
}

const thresholdStyles: Record<
  Threshold,
  { value: string; badge: string; bar: string }
> = {
  good: {
    value: 'text-success',
    badge: 'bg-success/10 text-success border-success/20',
    bar: 'bg-success',
  },
  fair: {
    value: 'text-warning',
    badge: 'bg-warning/10 text-warning border-warning/20',
    bar: 'bg-warning',
  },
  low: {
    value: 'text-destructive',
    badge: 'bg-destructive/10 text-destructive border-destructive/20',
    bar: 'bg-destructive',
  },
  none: {
    value: 'text-muted-foreground',
    badge: 'bg-muted text-muted-foreground border-border',
    bar: 'bg-muted-foreground/30',
  },
};

const thresholdLabels: Record<Threshold, string> = {
  good: 'Great',
  fair: 'Fair',
  low: 'Low',
  none: 'No data',
};

interface MetricCardProps {
  title: string;
  rawValue: number;
  displayValue: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  description: string;
  hint: string;
  threshold: Threshold;
  /** 0–100 for the progress bar; pass null to hide it */
  progress: number | null;
}

function MetricCard({
  title,
  displayValue,
  icon: Icon,
  iconColor,
  iconBg,
  description,
  hint,
  threshold,
  progress,
}: MetricCardProps) {
  const styles = thresholdStyles[threshold];

  return (
    <div className='flex flex-col gap-3 p-4 rounded-xl border border-border bg-card/50 hover:bg-card/80 transition-colors'>
      {/* Header */}
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <div className={cn('p-2 rounded-lg', iconBg)}>
            <Icon className={cn('h-4 w-4', iconColor)} />
          </div>
          <span className='text-sm font-medium text-muted-foreground'>
            {title}
          </span>
        </div>
        <span
          className={cn(
            'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
            styles.badge
          )}
        >
          {thresholdLabels[threshold]}
        </span>
      </div>

      {/* Value */}
      <div>
        <p className={cn('text-3xl font-bold tracking-tight', styles.value)}>
          {displayValue}
        </p>
        <p className='text-xs text-muted-foreground mt-0.5'>{description}</p>
      </div>

      {/* Progress bar (only for percentage metrics) */}
      {progress !== null && (
        <div className='space-y-1'>
          <div className='h-1.5 w-full rounded-full bg-secondary overflow-hidden'>
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                styles.bar
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Contextual hint */}
      <div className='flex items-start gap-1.5'>
        <Info className='h-3 w-3 text-muted-foreground/60 shrink-0 mt-0.5' />
        <p className='text-[11px] text-muted-foreground/70 leading-snug'>
          {hint}
        </p>
      </div>
    </div>
  );
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  const engagementThreshold = getThreshold(metrics.engagement_rate, 3, 1);
  const replyThreshold = getThreshold(metrics.reply_rate, 10, 3);
  const conversionThreshold = getThreshold(metrics.conversion_rate, 5, 1);

  // For response time: lower is better — treat 0 as none, <3s as good, <10s as fair, else low
  const responseThreshold: Threshold = (() => {
    if (metrics.average_response_time === 0) return 'none';
    if (metrics.average_response_time < 3) return 'good';
    if (metrics.average_response_time < 10) return 'fair';
    return 'low';
  })();

  const items: MetricCardProps[] = [
    {
      title: 'Engagement Rate',
      rawValue: metrics.engagement_rate,
      displayValue: `${metrics.engagement_rate}%`,
      icon: TrendingUp,
      iconColor: 'text-info',
      iconBg: 'bg-info/10',
      description: 'Interactions per impression',
      hint:
        metrics.engagement_rate === 0
          ? 'Connect Instagram Insights to track reach & engagement data.'
          : metrics.engagement_rate < 3
            ? 'Instagram average is 1–5%. More Reel posts typically boost this.'
            : 'Above average! Keep posting consistently to maintain momentum.',
      threshold: engagementThreshold,
      progress: Math.min(metrics.engagement_rate * 10, 100),
    },
    {
      title: 'Reply Rate',
      rawValue: metrics.reply_rate,
      displayValue: `${metrics.reply_rate}%`,
      icon: MessageCircle,
      iconColor: 'text-success',
      iconBg: 'bg-success/10',
      description: 'Auto-replies to eligible comments',
      hint:
        metrics.reply_rate === 0
          ? 'Activate an automation — every triggered comment will raise this.'
          : metrics.reply_rate < 10
            ? 'Expand your keyword triggers to capture more conversations.'
            : 'Strong reply coverage. Review fallback logs to catch edge cases.',
      threshold: replyThreshold,
      progress: Math.min(metrics.reply_rate * 2, 100),
    },
    {
      title: 'Conversion Rate',
      rawValue: metrics.conversion_rate,
      displayValue: `${metrics.conversion_rate}%`,
      icon: MousePointerClick,
      iconColor: 'text-chart-4',
      iconBg: 'bg-chart-4/10',
      description: 'Leads captured from DM conversations',
      hint:
        metrics.conversion_rate === 0
          ? 'Add a lead-capture step to your DM automation to start tracking.'
          : metrics.conversion_rate < 5
            ? 'Try a stronger CTA in your DM replies (e.g. "Tap to get the link").'
            : 'Great conversion! A/B test different reply messages to go higher.',
      threshold: conversionThreshold,
      progress: Math.min(metrics.conversion_rate * 5, 100),
    },
    {
      title: 'Avg Response Time',
      rawValue: metrics.average_response_time,
      displayValue:
        metrics.average_response_time === 0
          ? '—'
          : metrics.average_response_time < 60
            ? `${metrics.average_response_time}s`
            : `${Math.round(metrics.average_response_time / 60)}m`,
      icon: Clock,
      iconColor: 'text-chart-5',
      iconBg: 'bg-chart-5/10',
      description: 'Time from trigger to auto-reply',
      hint:
        metrics.average_response_time === 0
          ? 'Will populate once your first automation fires.'
          : metrics.average_response_time < 3
            ? 'Near-instant replies keep conversations alive.'
            : metrics.average_response_time < 10
              ? 'Good speed. Avoid adding unnecessary API delay steps.'
              : 'Slower than ideal — check for queued or blocked automations.',
      threshold: responseThreshold,
      progress: null,
    },
  ];

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between flex-wrap gap-2'>
          <div>
            <CardTitle className='text-lg font-semibold'>Performance</CardTitle>
            <p className='text-xs text-muted-foreground mt-0.5'>
              How your bot is performing across key actions
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          {items.map(item => (
            <MetricCard key={item.title} {...item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
