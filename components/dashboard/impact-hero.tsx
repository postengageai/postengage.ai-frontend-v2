'use client';

import { Users, TrendingUp, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency } from '@/lib/utils';
import type { ImpactSummaryResponse } from '@/lib/api/value-analytics';

// ── ImpactStatCard ────────────────────────────────────────────────────────────

interface ImpactStatCardProps {
  readonly value: string;
  readonly label: string;
  readonly subtext: string;
  readonly icon: React.ReactNode;
  readonly accentClass: string;
  readonly isLoading: boolean;
}

function ImpactStatCard({
  value,
  label,
  subtext,
  icon,
  accentClass,
  isLoading,
}: ImpactStatCardProps) {
  if (isLoading) {
    return (
      <div className='flex flex-col gap-2 p-4'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-8 w-28' />
        <Skeleton className='h-3 w-36' />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-1.5 p-4'>
      <div
        className={cn(
          'flex items-center gap-1.5 text-xs font-medium',
          accentClass
        )}
      >
        {icon}
        <span>{label}</span>
      </div>
      <p className='text-2xl font-bold text-foreground tracking-tight leading-none'>
        {value}
      </p>
      <p className='text-xs text-muted-foreground leading-snug'>{subtext}</p>
    </div>
  );
}

// ── ImpactHero ────────────────────────────────────────────────────────────────

interface ImpactHeroProps {
  readonly data: ImpactSummaryResponse | undefined;
  readonly isLoading: boolean;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays < 30) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ImpactHero({ data, isLoading }: ImpactHeroProps) {
  const sinceLabel = data?.baseline_date
    ? `since ${formatDate(data.baseline_date)}`
    : '';

  return (
    <div className='rounded-2xl border border-border bg-card overflow-hidden'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 pt-4 pb-2 border-b border-border/60'>
        <div className='flex items-center gap-2'>
          <div className='h-2 w-2 rounded-full bg-primary animate-pulse' />
          <span className='text-sm font-semibold text-foreground'>
            PostEngage Impact
          </span>
        </div>
        {!isLoading && sinceLabel && (
          <span className='text-xs text-muted-foreground'>{sinceLabel}</span>
        )}
        {isLoading && <Skeleton className='h-3 w-24' />}
      </div>

      {/* Stat grid */}
      <div className='grid grid-cols-1 sm:grid-cols-3 divide-x divide-y sm:divide-y-0 divide-border/60'>
        <ImpactStatCard
          isLoading={isLoading}
          icon={<Users className='h-3 w-3' />}
          label='Followers gained'
          value={data ? `+${data.follower_growth.value.toLocaleString()}` : '—'}
          subtext={
            data
              ? `+${data.follower_growth.percent}% from when you connected`
              : ''
          }
          accentClass='text-info'
        />
        <ImpactStatCard
          isLoading={isLoading}
          icon={<TrendingUp className='h-3 w-3' />}
          label='Engagement rate'
          value={data ? `${data.engagement_rate_growth.after}%` : '—'}
          subtext={
            data
              ? `+${data.engagement_rate_growth.delta_percent}% from ${data.engagement_rate_growth.before}% baseline`
              : ''
          }
          accentClass='text-success'
        />
        <ImpactStatCard
          isLoading={isLoading}
          icon={<Clock className='h-3 w-3' />}
          label='Value delivered'
          value={data ? formatCurrency(data.dollar_value_saved) : '—'}
          subtext={
            data
              ? `${data.total_hours_saved.toFixed(1)} hrs saved · ${data.automation_handle_rate}% handle rate`
              : ''
          }
          accentClass='text-warning'
        />
      </div>
    </div>
  );
}
