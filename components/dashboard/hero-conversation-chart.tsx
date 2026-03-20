'use client';

import { useState } from 'react';
import {
  ComposedChart,
  Bar,
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
    <div className='bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg'>
      <p className='text-muted-foreground mb-1'>{label}</p>
      {conversations && (
        <p className='text-foreground font-medium'>
          {conversations.value} conversation{conversations.value !== 1 ? 's' : ''}
        </p>
      )}
      {rate && rate.value > 0 && (
        <p className='text-green-400'>{rate.value}% auto-replied</p>
      )}
    </div>
  );
}

export function HeroConversationChart() {
  const [days, setDays] = useState<7 | 30>(7);
  const { data, isLoading } = useConversationChart(days);

  const totalConversations = data?.reduce((s, d) => s + d.conversations, 0) ?? 0;
  const avgAutoReplyRate =
    data && data.length > 0
      ? Math.round(data.reduce((s, d) => s + d.auto_reply_rate, 0) / data.length)
      : 0;

  const chartData = data?.map(d => ({
    ...d,
    date: formatDate(d.date, days),
  }));

  return (
    <Card>
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <CardTitle className='text-base font-semibold'>
              {isLoading ? (
                <Skeleton className='h-5 w-48' />
              ) : (
                <>
                  Your bot had conversations with{' '}
                  <span className='text-primary'>{totalConversations} people</span>{' '}
                  {days === 7 ? 'this week' : 'this month'}
                </>
              )}
            </CardTitle>
            {!isLoading && avgAutoReplyRate > 0 && (
              <p className='text-xs text-muted-foreground mt-0.5'>
                {avgAutoReplyRate}% average auto-reply rate
              </p>
            )}
          </div>

          {/* Period toggle */}
          <div className='flex items-center bg-secondary/50 rounded-lg p-0.5 shrink-0'>
            {([7, 30] as const).map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  days === d
                    ? 'bg-background text-foreground shadow-sm'
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
          <Skeleton className='h-[200px] w-full rounded-lg' />
        ) : totalConversations === 0 ? (
          <div className='h-[200px] flex flex-col items-center justify-center text-center'>
            <p className='text-sm text-muted-foreground'>
              No conversations yet in this period.
            </p>
            <p className='text-xs text-muted-foreground/70 mt-1'>
              Data will fill in once your automations start replying.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={200}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='hsl(var(--border))'
                vertical={false}
              />
              <XAxis
                dataKey='date'
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId='left'
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                yAxisId='right'
                orientation='right'
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                tickFormatter={v => `${v}%`}
                hide
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                yAxisId='left'
                dataKey='conversations'
                fill='hsl(var(--primary))'
                radius={[4, 4, 0, 0]}
                opacity={0.85}
              />
              <Line
                yAxisId='right'
                type='monotone'
                dataKey='auto_reply_rate'
                stroke='#22c55e'
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#22c55e' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        {!isLoading && totalConversations > 0 && (
          <div className='flex items-center gap-4 mt-2 text-xs text-muted-foreground'>
            <div className='flex items-center gap-1.5'>
              <div className='w-3 h-3 rounded-sm bg-primary/85' />
              <span>Conversations</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <div className='w-4 h-0.5 bg-green-500 rounded' />
              <span>Auto-reply rate</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
