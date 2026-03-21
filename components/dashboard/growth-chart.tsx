'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGrowthChart } from '@/lib/hooks';
import type {
  GrowthChartMetric,
  GrowthChartPoint,
} from '@/lib/api/value-analytics';

// ── Constants ─────────────────────────────────────────────────────────────────

const METRICS = [
  { id: 'followers' as GrowthChartMetric, label: 'Followers' },
  { id: 'engagement_rate' as GrowthChartMetric, label: 'Engagement Rate' },
  { id: 'reach' as GrowthChartMetric, label: 'Reach' },
] as const;

const DATE_RANGES = [
  { days: 7 as const, label: '7d' },
  { days: 30 as const, label: '30d' },
  { days: 90 as const, label: '90d' },
] as const;

// ── Tooltip ───────────────────────────────────────────────────────────────────

interface ChartTooltipProps {
  readonly active?: boolean;
  readonly value?: number;
  readonly label?: string;
  readonly metric: GrowthChartMetric;
  readonly isPostEngageActive?: boolean;
}

function ChartTooltip({
  active,
  value,
  label,
  metric,
  isPostEngageActive,
}: ChartTooltipProps) {
  if (!active || value === undefined) return null;
  const formatted =
    metric === 'engagement_rate'
      ? `${value.toFixed(2)}%`
      : value.toLocaleString();

  return (
    <div className='bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs shadow-xl shadow-black/30 min-w-[160px]'>
      <p className='text-muted-foreground mb-1.5 font-medium'>{label}</p>
      <p className='text-foreground font-bold text-sm'>{formatted}</p>
      {isPostEngageActive !== undefined && (
        <p
          className={cn(
            'mt-1 font-medium',
            isPostEngageActive ? 'text-success' : 'text-muted-foreground'
          )}
        >
          {isPostEngageActive ? '● PostEngage active' : '○ Before PostEngage'}
        </p>
      )}
    </div>
  );
}

// ── Growth Chart ──────────────────────────────────────────────────────────────

interface ChartDataPoint extends GrowthChartPoint {
  dateLabel: string;
}

function formatAxisDate(dateStr: string, days: number) {
  const d = new Date(dateStr);
  if (days <= 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  if (days <= 30)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function GrowthChart() {
  const [metric, setMetric] = useState<GrowthChartMetric>('followers');
  const [days, setDays] = useState<7 | 30 | 90>(30);

  const { data, isLoading } = useGrowthChart(metric, days);

  // Find first point where PostEngage becomes active
  const activationDate = data?.find(p => p.is_postengage_active)?.date;

  const chartData: ChartDataPoint[] =
    data?.map(p => ({ ...p, dateLabel: formatAxisDate(p.date, days) })) ?? [];

  const isEmpty = !isLoading && chartData.length < 3;

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-2'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <CardTitle className='text-base font-semibold'>
            Growth — Before vs After
          </CardTitle>

          <div className='flex items-center gap-2 flex-wrap'>
            {/* Metric tabs */}
            <div className='flex items-center bg-secondary/60 rounded-lg p-0.5 border border-border/50'>
              {METRICS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMetric(m.id)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150',
                    metric === m.id
                      ? 'bg-card text-foreground shadow-sm border border-border/60'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Date range */}
            <div className='flex items-center bg-secondary/60 rounded-lg p-0.5 border border-border/50'>
              {DATE_RANGES.map(r => (
                <button
                  key={r.days}
                  onClick={() => setDays(r.days)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150',
                    days === r.days
                      ? 'bg-card text-foreground shadow-sm border border-border/60'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        {isLoading ? (
          <Skeleton className='h-[260px] w-full rounded-lg mt-2' />
        ) : isEmpty ? (
          <div className='h-[260px] flex flex-col items-center justify-center text-center gap-3'>
            <div className='h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center'>
              <BarChart2 className='h-6 w-6 text-primary/60' />
            </div>
            <div>
              <p className='text-sm font-medium text-foreground'>
                Building your growth chart
              </p>
              <p className='text-xs text-muted-foreground mt-1 max-w-xs'>
                Keep PostEngage active — your chart builds over the next few
                days.
              </p>
            </div>
          </div>
        ) : (
          <div className='mt-2'>
            <ResponsiveContainer width='100%' height={260}>
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id='growthGradBefore'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='0%' stopColor='#6b7280' stopOpacity={0.15} />
                    <stop offset='85%' stopColor='#6b7280' stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient
                    id='growthGradAfter'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop offset='0%' stopColor='#6c47ff' stopOpacity={0.3} />
                    <stop offset='85%' stopColor='#6c47ff' stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='hsl(var(--border))'
                  vertical={false}
                  opacity={0.6}
                />
                <XAxis
                  dataKey='dateLabel'
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={metric === 'engagement_rate'}
                  width={36}
                  tickFormatter={v =>
                    metric === 'engagement_rate' ? `${v}%` : v.toLocaleString()
                  }
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltip
                      active={active}
                      value={
                        typeof payload?.[0]?.value === 'number'
                          ? payload[0].value
                          : undefined
                      }
                      label={
                        typeof label === 'string' ? label : String(label ?? '')
                      }
                      metric={metric}
                      isPostEngageActive={
                        payload?.[0]?.payload?.is_postengage_active
                      }
                    />
                  )}
                  cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                />

                {/* Activation reference line */}
                {activationDate && (
                  <ReferenceLine
                    x={formatAxisDate(activationDate, days)}
                    stroke='#6c47ff'
                    strokeDasharray='4 3'
                    strokeWidth={1.5}
                    label={{
                      value: 'PostEngage activated',
                      position: 'insideTopLeft',
                      fill: '#6c47ff',
                      fontSize: 10,
                      dy: -4,
                    }}
                  />
                )}

                <Area
                  type='monotone'
                  dataKey='value'
                  stroke='#6c47ff'
                  strokeWidth={2}
                  fill='url(#growthGradAfter)'
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: '#6c47ff',
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Legend */}
        {!isLoading && !isEmpty && activationDate && (
          <div className='flex items-center gap-4 mt-1 text-xs text-muted-foreground'>
            <div className='flex items-center gap-1.5'>
              <div className='w-4 h-0.5 border-t-2 border-dashed border-primary/70' />
              <span>PostEngage activated</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
