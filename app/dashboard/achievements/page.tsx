'use client';

import { format } from 'date-fns';
import { Trophy, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useMilestones } from '@/lib/hooks';
import type { MilestoneAchievementResponse } from '@/lib/api/value-analytics';

// ── Milestone icon map ─────────────────────────────────────────────────────────

const MILESTONE_ICON: Record<string, string> = {
  first_automation: '🤖',
  first_reply: '💬',
  ten_replies: '🔥',
  hundred_replies: '💯',
  first_lead: '🎯',
  ten_leads: '🏆',
  fifty_leads: '🥇',
  first_follower_gained: '👥',
  hundred_followers: '📈',
  week_streak: '📅',
  month_streak: '🗓️',
};

function getMilestoneIcon(milestoneId: string): string {
  return MILESTONE_ICON[milestoneId] ?? '✅';
}

const CELEBRATION_BADGE: Record<
  MilestoneAchievementResponse['celebration'],
  string
> = {
  confetti: 'bg-primary/10 text-primary',
  badge: 'bg-success/10 text-success',
  toast: 'bg-muted text-muted-foreground',
};

const CELEBRATION_LABEL: Record<
  MilestoneAchievementResponse['celebration'],
  string
> = {
  confetti: 'Major milestone',
  badge: 'Achievement',
  toast: 'Milestone',
};

// ── Milestone card ─────────────────────────────────────────────────────────────

interface MilestoneCardProps {
  readonly milestone: MilestoneAchievementResponse;
}

function MilestoneCard({ milestone }: MilestoneCardProps) {
  const badge = CELEBRATION_BADGE[milestone.celebration];
  const label = CELEBRATION_LABEL[milestone.celebration];

  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-4 flex items-start gap-4'>
        {/* Icon */}
        <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl'>
          {getMilestoneIcon(milestone.milestone_id)}
        </div>

        {/* Content */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <p className='text-sm font-semibold text-foreground'>
              {milestone.title}
            </p>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                badge
              )}
            >
              {label}
            </span>
          </div>
          <p className='mt-0.5 text-xs text-muted-foreground'>
            {milestone.description}
          </p>
          <p className='mt-1.5 text-xs text-muted-foreground/70'>
            Achieved {format(new Date(milestone.achieved_at), 'MMM d, yyyy')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Empty / locked state ───────────────────────────────────────────────────────

function LockedState() {
  return (
    <div className='col-span-full flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 py-16 px-8 text-center'>
      <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-muted'>
        <Lock className='h-8 w-8 text-muted-foreground' />
      </div>
      <div>
        <h3 className='text-lg font-semibold text-foreground'>
          No achievements yet
        </h3>
        <p className='mt-1 text-sm text-muted-foreground max-w-sm'>
          Activate an automation and start engaging with your audience — your
          first milestone will appear here automatically.
        </p>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AchievementsPage() {
  const { data, isLoading } = useMilestones();

  return (
    <main className='p-4 sm:p-6 lg:p-8 space-y-6 max-w-screen-xl mx-auto'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10'>
          <Trophy className='h-5 w-5 text-primary' />
        </div>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>Achievements</h1>
          <p className='text-sm text-muted-foreground'>
            Milestones you&apos;ve unlocked with PostEngage.
          </p>
        </div>
        {!isLoading && !!data?.length && (
          <span className='ml-auto inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-white'>
            {data.length}
          </span>
        )}
      </div>

      {/* Grid */}
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className='h-24 rounded-xl' />
          ))
        ) : !data?.length ? (
          <LockedState />
        ) : (
          data.map(m => <MilestoneCard key={m.milestone_id} milestone={m} />)
        )}
      </div>
    </main>
  );
}
