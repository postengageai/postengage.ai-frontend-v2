'use client';

import { useState, useCallback } from 'react';
import { Pencil, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useRoiSummary } from '@/lib/hooks';
import { ValueAnalyticsApi } from '@/lib/api/value-analytics';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useEffect } from 'react';

// ── Time constants ────────────────────────────────────────────────────────────

const TIME_PER_COMMENT_MIN = 1.5;
const TIME_PER_DM_MIN = 3.0;
const TIME_PER_STORY_MIN = 2.0;

// ── ROI progress bar ──────────────────────────────────────────────────────────

interface RoiBarProps {
  readonly multiple: number;
}

function RoiBar({ multiple }: RoiBarProps) {
  const MAX_VISUAL = 30;
  const pct = Math.min((multiple / MAX_VISUAL) * 100, 100);
  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between text-xs'>
        <span className='text-muted-foreground'>ROI this week</span>
        <span className='font-bold text-success text-sm'>{multiple}x</span>
      </div>
      <div className='h-2 w-full rounded-full bg-muted overflow-hidden'>
        <div
          className='h-full rounded-full bg-gradient-to-r from-success/70 to-success transition-all duration-500'
          style={{ width: `${pct}%` }}
        />
      </div>
      {multiple >= MAX_VISUAL && (
        <p className='text-xs text-muted-foreground'>(chart capped at 30x)</p>
      )}
    </div>
  );
}

// ── Stat row ──────────────────────────────────────────────────────────────────

interface StatRowProps {
  readonly label: string;
  readonly count: number;
  readonly minPerAction: number;
  readonly total: number;
}

function StatRow({ label, count, minPerAction, total }: StatRowProps) {
  return (
    <div className='grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 text-xs'>
      <span className='text-muted-foreground truncate'>
        <strong className='text-foreground font-semibold'>
          {count.toLocaleString()}
        </strong>{' '}
        {label}
      </span>
      <span className='text-muted-foreground'>×</span>
      <span className='text-muted-foreground'>{minPerAction} min</span>
      <span className='text-foreground font-semibold tabular-nums text-right'>
        ={total.toFixed(1)} min
      </span>
    </div>
  );
}

// ── ROI Calculator ────────────────────────────────────────────────────────────

export function ROICalculatorWidget() {
  const { data, isLoading } = useRoiSummary();

  // Editable hourly rate — start from server value, allow local override
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Sync once server data arrives (only on first load)
  useEffect(() => {
    if (data && hourlyRate === null) {
      setHourlyRate(data.user_hourly_rate);
    }
  }, [data, hourlyRate]);

  const effectiveRate = hourlyRate ?? data?.user_hourly_rate ?? 50;
  const currSymbol = data?.currency_symbol ?? '$';

  // Client-side recomputation when hourly rate changes
  const totalMinutes =
    (data?.weekly_stats.comment_replies_automated ?? 0) * TIME_PER_COMMENT_MIN +
    (data?.weekly_stats.dms_automated ?? 0) * TIME_PER_DM_MIN +
    (data?.weekly_stats.story_replies_automated ?? 0) * TIME_PER_STORY_MIN;

  const totalHours = totalMinutes / 60;
  const dollarSaved = totalHours * effectiveRate;
  const weeklyCost = data?.weekly_plan_cost ?? 0;
  const roiMultiple = weeklyCost > 0 ? Math.round(dollarSaved / weeklyCost) : 0;

  // Debounced save
  const debouncedRate = useDebounce(effectiveRate, 1_000);
  useEffect(() => {
    if (hourlyRate === null) return;
    ValueAnalyticsApi.updateHourlyRate(debouncedRate).catch(() => {
      /* silent */
    });
  }, [debouncedRate, hourlyRate]);

  const handleRateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseInt(e.target.value, 10);
      if (!isNaN(v) && v > 0) setHourlyRate(v);
    },
    []
  );

  const noActivity =
    !isLoading &&
    (data?.weekly_stats.comment_replies_automated ?? 0) === 0 &&
    (data?.weekly_stats.dms_automated ?? 0) === 0 &&
    (data?.weekly_stats.story_replies_automated ?? 0) === 0;

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between gap-2'>
          <CardTitle className='text-base font-semibold'>
            Time Saved This Week
          </CardTitle>

          {/* Hourly rate editor */}
          <div className='flex items-center gap-1'>
            {isEditing ? (
              <>
                <span className='text-xs text-muted-foreground'>
                  {currSymbol}
                </span>
                <input
                  type='number'
                  min={1}
                  value={effectiveRate}
                  onChange={handleRateChange}
                  className='w-16 text-xs bg-muted border border-border rounded-md px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary'
                  autoFocus
                />
                <span className='text-xs text-muted-foreground'>/hr</span>
                <button
                  onClick={() => setIsEditing(false)}
                  className='p-1 rounded-md hover:bg-muted text-success'
                >
                  <Check className='h-3.5 w-3.5' />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className='flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors'
              >
                <span>
                  {currSymbol}
                  {effectiveRate}/hr
                </span>
                <Pencil className='h-3 w-3' />
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {isLoading ? (
          <div className='space-y-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className='h-4 w-full' />
            ))}
            <Skeleton className='h-2 w-full rounded-full mt-4' />
          </div>
        ) : noActivity ? (
          <p className='text-sm text-muted-foreground py-4 text-center'>
            No automations fired this week yet — activate one to see your time
            savings.
          </p>
        ) : (
          <>
            {/* Breakdown */}
            <div className='space-y-2 pb-2 border-b border-border/60'>
              {(data?.weekly_stats.comment_replies_automated ?? 0) > 0 && (
                <StatRow
                  label='comment replies automated'
                  count={data!.weekly_stats.comment_replies_automated}
                  minPerAction={TIME_PER_COMMENT_MIN}
                  total={
                    data!.weekly_stats.comment_replies_automated *
                    TIME_PER_COMMENT_MIN
                  }
                />
              )}
              {(data?.weekly_stats.dms_automated ?? 0) > 0 && (
                <StatRow
                  label='DMs automated'
                  count={data!.weekly_stats.dms_automated}
                  minPerAction={TIME_PER_DM_MIN}
                  total={data!.weekly_stats.dms_automated * TIME_PER_DM_MIN}
                />
              )}
              {(data?.weekly_stats.story_replies_automated ?? 0) > 0 && (
                <StatRow
                  label='story replies automated'
                  count={data!.weekly_stats.story_replies_automated}
                  minPerAction={TIME_PER_STORY_MIN}
                  total={
                    data!.weekly_stats.story_replies_automated *
                    TIME_PER_STORY_MIN
                  }
                />
              )}
            </div>

            {/* Totals */}
            <div className='space-y-1 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Total time saved</span>
                <span className='font-semibold text-foreground'>
                  {totalHours.toFixed(1)} hours
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>
                  At {currSymbol}
                  {effectiveRate}/hr, PostEngage saved you
                </span>
                <span
                  className={cn(
                    'font-bold',
                    dollarSaved > 0 ? 'text-success' : 'text-foreground'
                  )}
                >
                  {currSymbol}
                  {Math.round(dollarSaved).toLocaleString()}
                </span>
              </div>
              {weeklyCost > 0 && (
                <div className='flex justify-between text-xs'>
                  <span className='text-muted-foreground'>
                    Plan cost this week
                  </span>
                  <span className='text-muted-foreground'>
                    {currSymbol}
                    {weeklyCost.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* ROI bar */}
            {roiMultiple > 0 && <RoiBar multiple={roiMultiple} />}
          </>
        )}
      </CardContent>
    </Card>
  );
}
