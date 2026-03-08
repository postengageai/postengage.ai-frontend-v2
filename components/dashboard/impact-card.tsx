'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Clock,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardImpact } from '@/lib/api/dashboard';

interface ImpactCardProps {
  impact: DashboardImpact;
  isFirstDay?: boolean;
}

export function ImpactCard({ impact, isFirstDay = false }: ImpactCardProps) {
  const {
    replies_handled_today,
    hours_saved_today,
    hot_leads_today,
    weekly_replies,
    weekly_replies_growth_pct,
  } = impact;

  const hasActivity = replies_handled_today > 0;

  if (isFirstDay || !hasActivity) {
    return (
      <Card className='border-dashed border-2 border-muted bg-muted/20'>
        <CardContent className='flex items-center gap-4 py-4 px-5'>
          <div className='h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
            <MessageSquare className='h-4 w-4 text-primary' />
          </div>
          <div>
            <p className='text-sm font-medium text-foreground'>
              Your bot is ready — first reply will appear here
            </p>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Impact stats update in real-time once automations start running
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hoursText =
    hours_saved_today >= 1
      ? `~${hours_saved_today}h`
      : `~${Math.round(hours_saved_today * 60)}m`;

  const growthIcon =
    weekly_replies_growth_pct > 0 ? (
      <TrendingUp className='h-3 w-3 text-green-500' />
    ) : weekly_replies_growth_pct < 0 ? (
      <TrendingDown className='h-3 w-3 text-red-500' />
    ) : (
      <Minus className='h-3 w-3 text-muted-foreground' />
    );

  const growthColor =
    weekly_replies_growth_pct > 0
      ? 'text-green-600'
      : weekly_replies_growth_pct < 0
        ? 'text-red-600'
        : 'text-muted-foreground';

  return (
    <Card className='bg-gradient-to-r from-primary/5 via-background to-background border-primary/20'>
      <CardContent className='py-4 px-5'>
        {/* Headline sentence */}
        <p className='text-sm font-medium text-foreground mb-3'>
          Today, your bot handled{' '}
          <span className='text-primary font-semibold'>
            {replies_handled_today} comment
            {replies_handled_today !== 1 ? 's' : ''}
          </span>
          {hours_saved_today > 0 && (
            <>
              , saved you{' '}
              <span className='text-primary font-semibold'>{hoursText}</span>
            </>
          )}
          {hot_leads_today > 0 && (
            <>
              , and surfaced{' '}
              <span className='text-orange-600 font-semibold'>
                {hot_leads_today} hot lead{hot_leads_today !== 1 ? 's' : ''}
              </span>
            </>
          )}
          .
        </p>

        {/* Stat pills */}
        <div className='flex flex-wrap gap-2'>
          <StatPill
            icon={<MessageSquare className='h-3 w-3' />}
            value={`${replies_handled_today}`}
            label='today'
            className='bg-blue-50 text-blue-700 border-blue-200'
          />
          {hours_saved_today > 0 && (
            <StatPill
              icon={<Clock className='h-3 w-3' />}
              value={hoursText}
              label='saved'
              className='bg-violet-50 text-violet-700 border-violet-200'
            />
          )}
          {hot_leads_today > 0 && (
            <StatPill
              icon={<Flame className='h-3 w-3' />}
              value={`${hot_leads_today}`}
              label='hot leads'
              className='bg-orange-50 text-orange-700 border-orange-200'
            />
          )}
          {weekly_replies > 0 && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border',
                'bg-gray-50 border-gray-200'
              )}
            >
              {growthIcon}
              <span className={cn('font-medium', growthColor)}>
                {weekly_replies_growth_pct > 0 ? '+' : ''}
                {weekly_replies_growth_pct}% vs last week
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatPill({
  icon,
  value,
  label,
  className,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <Badge
      variant='outline'
      className={cn('flex items-center gap-1 text-xs px-2 py-0.5', className)}
    >
      {icon}
      <span className='font-semibold'>{value}</span>
      <span className='opacity-70'>{label}</span>
    </Badge>
  );
}
