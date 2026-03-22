'use client';

import { useState } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useConversationChart } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { BarChart2 } from 'lucide-react';

function formatDate(dateStr: string, days: number) {
  const date = new Date(dateStr);
  if (days <= 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const conversations = payload.find(p => p.name === 'conversations');
  const rate = payload.find(p => p.name === 'auto_reply_rate');
  return (
    <div className='bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs shadow-xl shadow-black/30 min-w-[148px]'>
      <p className='text-muted-foreground mb-2 font-medium'>{label}</p>
      {conversations && (
        <div className='flex items-center gap-2 mb-1'>
          <div className='w-2 h-2 rounded-sm bg-primary/80 flex-shrink-0' />
          <p className='text-foreground font-semibold'>
            {conversations.value}{' '}
            <span className='font-normal text-muted-foreground'>
              conversation{conversations.value !== 1 ? 's' : ''}
            </span>
          </p>
        </div>
      )}
      {rate && rate.value > 0 && (
        <div className='flex items-center gap-2'>
          <div className='w-2 h-0.5 rounded bg-success flex-shrink-0' />
          <p className='text-success font-semibold'>
            {rate.value}%{' '}
            <span className='font-normal text-muted-foreground'>
              auto-replied
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

interface HeroConversationChartProps {
  uniquePeopleEngaged?: number;
}

export function HeroConversationChart({
  uniquePeopleEngaged,
}: HeroConversationChartProps) {
  const [days, setDays] = useState<7 | 30>(7);
  const { data, isLoading } = useConversationChart(days);

  const totalConversations =
    data?.reduce((s, d) => s + d.conversations, 0) ?? 0;
  const avgAutoReplyRate =
    data && data.length > 0
      ? Math.round(
          data.reduce((s, d) => s + d.auto_reply_rate, 0) / data.length
        )
      : 0;

  const chartData = data?.map(d => ({
    ...d,
    date: formatDate(d.date, days),
  }));

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between gap-4 flex-wrap'>
          <div className='min-w-0'>
            <CardTitle className='text-base font-semibold leading-snug'>
              {isLoading ? (
                <Skeleton className='h-5 w-56' />
              ) : (
                <>
                  Your bot handled{' '}
                  <span className='text-primary'>
                    {totalConversations}{' '}
                    {totalConversations === 1
                      ? 'conversation'
                      : 'conversations'}
                  </span>{' '}
                  {days === 7 ? 'this week' : 'this month'}
                </>
              )}
            </CardTitle>
            {!isLoading && (
              <p className='text-xs text-muted-foreground mt-0.5'>
                {avgAutoReplyRate > 0
                  ? `${avgAutoReplyRate}% average auto-reply rate`
                  : 'Set up automations to start auto-replying'}
                {uniquePeopleEngaged != null && uniquePeopleEngaged > 0 && (
                  <span className='ml-2 text-muted-foreground/60'>
                    · {uniquePeopleEngaged} unique{' '}
                    {uniquePeopleEngaged === 1 ? 'person' : 'people'} this month
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Period toggle */}
          <div className='flex items-center bg-secondary/60 rounded-lg p-0.5 shrink-0 border border-border/50'>
            {([7, 30] as const).map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150',
                  days === d
                    ? 'bg-card text-foreground shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {d === 7 ? '7d' : '30d'}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        {isLoading ? (
          <Skeleton className='h-[260px] w-full rounded-lg mt-2' />
        ) : totalConversations === 0 ? (
          <div className='h-[260px] flex flex-col items-center justify-center text-center gap-3'>
            <div className='h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center'>
              <BarChart2 className='h-6 w-6 text-primary/60' />
            </div>
            <div>
              <p className='text-sm font-medium text-foreground'>
                No conversations yet
              </p>
              <p className='text-xs text-muted-foreground mt-1 max-w-xs'>
                Data will appear once your automations start handling messages.
              </p>
            </div>
          </div>
        ) : (
          <div className='mt-2'>
            <ResponsiveContainer width='100%' height={260}>
              <ComposedChart
                data={chartData}
                margin={{ top: 8, right: 4, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id='convAreaGrad' x1='0' y1='0' x2='0' y2='1'>
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
                  dataKey='date'
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  dy={6}
                  interval='preserveStartEnd'
                  minTickGap={40}
                />
                <YAxis
                  yAxisId='left'
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={32}
                />
                <YAxis
                  yAxisId='right'
                  orientation='right'
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  hide
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                />
                <Area
                  yAxisId='left'
                  type='monotone'
                  dataKey='conversations'
                  stroke='#6c47ff'
                  strokeWidth={2}
                  fill='url(#convAreaGrad)'
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: '#6c47ff',
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />
                <Line
                  yAxisId='right'
                  type='monotone'
                  dataKey='auto_reply_rate'
                  stroke='#22c55e'
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: '#22c55e',
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Legend */}
        {!isLoading && totalConversations > 0 && (
          <div className='flex items-center gap-5 mt-1 text-xs text-muted-foreground'>
            <div className='flex items-center gap-1.5'>
              <div className='w-3 h-3 rounded-sm bg-primary/75' />
              <span>Conversations</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <div className='w-4 h-0.5 bg-success rounded-full' />
              <span>Auto-reply rate</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
