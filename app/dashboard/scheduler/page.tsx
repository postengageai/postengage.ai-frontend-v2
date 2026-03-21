'use client';

import { useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentCalendar } from '@/components/scheduler/content-calendar';
import { BestTimePanel } from '@/components/scheduler/best-time-panel';
import { BestTimeHeatmap } from '@/components/scheduler/BestTimeHeatmap';
import { BulkScheduleUploader } from '@/components/scheduler/BulkScheduleUploader';
import { SchedulePostModal } from '@/components/scheduler/schedule-post-modal';
import { usePublishingLimit } from '@/lib/hooks';
import type {
  BestTimeRecommendation,
  ScheduledPost,
} from '@/lib/api/scheduler';
import { cn } from '@/lib/utils';

// ── Publishing limit bar ───────────────────────────────────────────────────────

function PublishingLimitBar() {
  const { data } = usePublishingLimit();
  if (!data) return null;

  const pct = Math.min((data.quota_usage / data.quota_total) * 100, 100);
  const isNearLimit = pct >= 80;

  return (
    <div className='flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3'>
      {isNearLimit && (
        <AlertTriangle className='h-4 w-4 text-warning shrink-0' />
      )}
      <div className='flex-1 space-y-1'>
        <div className='flex items-center justify-between'>
          <span className='text-xs font-medium text-foreground'>
            Instagram Publishing Quota
          </span>
          <span
            className={cn(
              'text-xs font-semibold',
              isNearLimit ? 'text-warning' : 'text-muted-foreground'
            )}
          >
            {data.quota_usage} / {data.quota_total} used
          </span>
        </div>
        <div className='h-1.5 w-full rounded-full bg-muted overflow-hidden'>
          <div
            className={cn(
              'h-full rounded-full transition-all',
              isNearLimit ? 'bg-warning' : 'bg-primary'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className='text-xs text-muted-foreground shrink-0'>
        {data.remaining} remaining
      </span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SchedulerPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();

  const handleDayClick = (day: Date) => {
    setDefaultDate(day);
    setModalOpen(true);
  };

  const handlePostClick = (_post: ScheduledPost) => {
    // Future: open post detail drawer
  };

  const handleBestTimePick = (_rec: BestTimeRecommendation) => {
    setModalOpen(true);
  };

  return (
    <main className='p-4 sm:p-6 lg:p-8 space-y-6 max-w-screen-2xl mx-auto'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>
            Content Scheduler
          </h1>
          <p className='text-sm text-muted-foreground mt-0.5'>
            Plan and schedule your Instagram posts for maximum reach.
          </p>
        </div>
        <Button
          onClick={() => {
            setDefaultDate(undefined);
            setModalOpen(true);
          }}
          className='bg-primary text-white hover:bg-primary/90 gap-2'
        >
          <Plus className='h-4 w-4' />
          Schedule Post
        </Button>
      </div>

      {/* Publishing limit */}
      <PublishingLimitBar />

      {/* Main layout: calendar + sidebar */}
      <div className='grid gap-6 xl:grid-cols-[1fr_280px]'>
        <ContentCalendar
          onDayClick={handleDayClick}
          onPostClick={handlePostClick}
        />

        <aside className='space-y-4'>
          <BestTimePanel onSelectTime={handleBestTimePick} />
          <BestTimeHeatmap />
          <BulkScheduleUploader />
        </aside>
      </div>

      {/* Schedule modal */}
      <SchedulePostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultDate={defaultDate}
      />
    </main>
  );
}
