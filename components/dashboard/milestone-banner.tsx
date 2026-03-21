'use client';

import { Trophy, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMilestones } from '@/lib/hooks';
import type { MilestoneAchievementResponse } from '@/lib/api/value-analytics';

// ── Milestone icon map ─────────────────────────────────────────────────────────

const MILESTONE_ICON: Record<string, string> = {
  first_reply: '🤖',
  first_lead: '🎯',
  replies_10: '💬',
  replies_100: '🔥',
  replies_500: '⚡',
  conversations_1000: '🚀',
  conversations_5000: '🌟',
  leads_10: '🎯',
  leads_100: '💎',
  one_week_active: '📅',
  one_month_active: '🏅',
  three_months_active: '🏆',
};

function getMilestoneIcon(milestoneId: string) {
  return MILESTONE_ICON[milestoneId] ?? '✨';
}

// ── Achieved milestone row ────────────────────────────────────────────────────

interface AchievedRowProps {
  readonly milestone: MilestoneAchievementResponse;
}

function AchievedRow({ milestone }: AchievedRowProps) {
  const date = new Date(milestone.achieved_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className='flex items-center gap-3 py-2.5'>
      <span className='text-base w-6 text-center shrink-0'>
        {getMilestoneIcon(milestone.milestone_id)}
      </span>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-foreground leading-snug'>
          {milestone.title}
        </p>
        <p className='text-xs text-muted-foreground leading-snug mt-0.5'>
          {milestone.description}
        </p>
      </div>
      <span className='text-xs text-muted-foreground shrink-0'>{date}</span>
    </div>
  );
}

// ── Locked milestone row ──────────────────────────────────────────────────────

// We only have what the API tells us — locked milestones are simply not in the
// achieved list. We display a couple of "next milestone" hints if few achieved.
// For now this section renders a placeholder.

// ── Milestone Banner ──────────────────────────────────────────────────────────

export function MilestoneBanner() {
  const { data, isLoading } = useMilestones();
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <Card className='overflow-hidden'>
        <CardHeader className='pb-2'>
          <Skeleton className='h-5 w-32' />
        </CardHeader>
        <CardContent className='space-y-3'>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className='flex items-center gap-3'>
              <Skeleton className='h-6 w-6 rounded shrink-0' />
              <div className='flex-1 space-y-1'>
                <Skeleton className='h-3.5 w-48' />
                <Skeleton className='h-3 w-64' />
              </div>
              <Skeleton className='h-3 w-12 shrink-0' />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card className='overflow-hidden'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base font-semibold flex items-center gap-2'>
            <Trophy className='h-4 w-4 text-warning' />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-3 py-2 text-muted-foreground'>
            <Lock className='h-4 w-4 shrink-0' />
            <p className='text-sm'>
              Activate your first automation to start unlocking achievements.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const MAX_VISIBLE = 3;
  const visible = showAll ? data : data.slice(0, MAX_VISIBLE);
  const hasMore = data.length > MAX_VISIBLE;

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-1'>
        <CardTitle className='text-base font-semibold flex items-center gap-2'>
          <Trophy className='h-4 w-4 text-warning' />
          Achievements
          <span
            className={cn(
              'ml-auto text-xs font-normal px-2 py-0.5 rounded-full',
              'bg-primary/10 text-primary'
            )}
          >
            {data.length} unlocked
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className='pb-2'>
        <div className='divide-y divide-border/60'>
          {visible.map(m => (
            <AchievedRow key={m.milestone_id} milestone={m} />
          ))}
        </div>

        {hasMore && (
          <Button
            variant='ghost'
            size='sm'
            className='mt-1 w-full h-8 text-xs text-muted-foreground hover:text-foreground'
            onClick={() => setShowAll(prev => !prev)}
          >
            {showAll ? (
              <>
                <ChevronUp className='h-3.5 w-3.5 mr-1' />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className='h-3.5 w-3.5 mr-1' />
                {data.length - MAX_VISIBLE} more achievements
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
