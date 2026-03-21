'use client';

import { useState, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCalendar, useBestTimes } from '@/lib/hooks';
import {
  ScheduledPostStatus,
  type ScheduledPost,
  type BestTimeRecommendation,
} from '@/lib/api/scheduler';

// ── Status badge colours ───────────────────────────────────────────────────────

const STATUS_DOT: Record<ScheduledPost['status'], string> = {
  [ScheduledPostStatus.DRAFT]: 'bg-muted-foreground',
  [ScheduledPostStatus.SCHEDULED]: 'bg-primary',
  [ScheduledPostStatus.PUBLISHING]: 'bg-warning animate-pulse',
  [ScheduledPostStatus.PUBLISHED]: 'bg-success',
  [ScheduledPostStatus.FAILED]: 'bg-destructive',
  [ScheduledPostStatus.CANCELLED]: 'bg-muted-foreground/50',
};

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

// ── Helpers ────────────────────────────────────────────────────────────────────

function isBestTimeDay(
  day: Date,
  bestTimes: BestTimeRecommendation[]
): boolean {
  return bestTimes.some(
    rec => rec.day_of_week === day.getDay() && rec.confidence_level === 'high'
  );
}

function postsForDay(posts: ScheduledPost[], day: Date): ScheduledPost[] {
  return posts.filter(p => isSameDay(new Date(p.scheduled_at), day));
}

// ── Day cell ───────────────────────────────────────────────────────────────────

interface DayCellProps {
  readonly day: Date;
  readonly currentMonth: Date;
  readonly posts: ScheduledPost[];
  readonly isBestTime: boolean;
  readonly onDayClick: (day: Date) => void;
  readonly onPostClick: (post: ScheduledPost) => void;
}

function DayCell({
  day,
  currentMonth,
  posts,
  isBestTime,
  onDayClick,
  onPostClick,
}: DayCellProps) {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const dayPosts = postsForDay(posts, day);
  const isT = isToday(day);

  return (
    <div
      onClick={() => onDayClick(day)}
      className={cn(
        'min-h-[90px] p-1.5 border-b border-r border-border/40 cursor-pointer transition-colors',
        isCurrentMonth ? 'bg-background hover:bg-muted/30' : 'bg-muted/10',
        isT && 'ring-1 ring-inset ring-primary/40'
      )}
    >
      {/* Day number */}
      <div className='flex items-center justify-between mb-1'>
        <span
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
            isT
              ? 'bg-primary text-white'
              : isCurrentMonth
                ? 'text-foreground'
                : 'text-muted-foreground/50'
          )}
        >
          {format(day, 'd')}
        </span>
        {/* Best time indicator */}
        {isBestTime && isCurrentMonth && (
          <span
            title='High-confidence best time to post'
            className='h-1.5 w-1.5 rounded-full bg-success'
          />
        )}
      </div>

      {/* Posts */}
      <div className='space-y-0.5'>
        {dayPosts.slice(0, 3).map(post => (
          <button
            key={post.id}
            type='button'
            onClick={e => {
              e.stopPropagation();
              onPostClick(post);
            }}
            className='w-full flex items-center gap-1 rounded px-1 py-0.5 text-left hover:bg-muted transition-colors group'
          >
            <span
              className={cn(
                'h-1.5 w-1.5 shrink-0 rounded-full',
                STATUS_DOT[post.status]
              )}
            />
            <span className='truncate text-[11px] text-foreground group-hover:text-primary transition-colors'>
              {format(new Date(post.scheduled_at), 'h:mma')}
            </span>
          </button>
        ))}
        {dayPosts.length > 3 && (
          <p className='pl-1 text-[10px] text-muted-foreground'>
            +{dayPosts.length - 3} more
          </p>
        )}
      </div>
    </div>
  );
}

// ── Legend ─────────────────────────────────────────────────────────────────────

function CalendarLegend() {
  return (
    <div className='flex flex-wrap items-center gap-4 text-xs text-muted-foreground'>
      {[
        { dot: 'bg-primary', label: 'Scheduled' },
        { dot: 'bg-success', label: 'Published' },
        { dot: 'bg-warning animate-pulse', label: 'Publishing' },
        { dot: 'bg-destructive', label: 'Failed' },
        { dot: 'bg-muted-foreground', label: 'Draft' },
      ].map(({ dot, label }) => (
        <div key={label} className='flex items-center gap-1.5'>
          <span className={cn('h-2 w-2 rounded-full', dot)} />
          {label}
        </div>
      ))}
      <div className='flex items-center gap-1.5'>
        <span className='h-1.5 w-1.5 rounded-full bg-success' />
        Best day (high confidence)
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export interface ContentCalendarProps {
  readonly onDayClick?: (day: Date) => void;
  readonly onPostClick?: (post: ScheduledPost) => void;
}

export function ContentCalendar({
  onDayClick,
  onPostClick,
}: ContentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const from = format(startOfWeek(startOfMonth(currentMonth)), 'yyyy-MM-dd');
  const to = format(endOfWeek(endOfMonth(currentMonth)), 'yyyy-MM-dd');

  const { data: posts, isLoading } = useCalendar(from, to);
  const { data: bestTimes } = useBestTimes();

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const allPosts = posts ?? [];
  const allBestTimes = bestTimes ?? [];

  return (
    <div className='flex flex-col gap-3'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-foreground'>
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className='flex items-center gap-1'>
          <Button
            size='icon'
            variant='ghost'
            className='h-8 w-8'
            onClick={() => setCurrentMonth(m => subMonths(m, 1))}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            size='sm'
            variant='outline'
            className='h-8 text-xs'
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button
            size='icon'
            variant='ghost'
            className='h-8 w-8'
            onClick={() => setCurrentMonth(m => addMonths(m, 1))}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className='overflow-hidden rounded-xl border border-border'>
        {/* Day headers */}
        <div className='grid grid-cols-7 border-b border-border bg-muted/30'>
          {DAY_HEADERS.map(d => (
            <div
              key={d}
              className='py-2 text-center text-xs font-medium text-muted-foreground'
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        {isLoading ? (
          <div className='grid grid-cols-7'>
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className='h-[90px] rounded-none' />
            ))}
          </div>
        ) : (
          <div className='grid grid-cols-7'>
            {calendarDays.map(day => (
              <DayCell
                key={day.toISOString()}
                day={day}
                currentMonth={currentMonth}
                posts={allPosts}
                isBestTime={isBestTimeDay(day, allBestTimes)}
                onDayClick={onDayClick ?? (() => {})}
                onPostClick={onPostClick ?? (() => {})}
              />
            ))}
          </div>
        )}
      </div>

      <CalendarLegend />
    </div>
  );
}
