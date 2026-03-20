'use client';

import type React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendStatCardProps {
  label: string;
  value: string | number;
  subValue?: React.ReactNode;
  delta?: number; // % change vs previous period, positive = good
  deltaLabel?: string;
  sparkData?: number[]; // 7 data points for sparkline
  sparkColor?: string;
  icon?: React.ReactNode;
  invertDelta?: boolean; // true = lower is better (e.g. fallback rate)
  accentColor?: 'blue' | 'green' | 'violet' | 'orange' | 'red';
  onClick?: () => void;
}

const accentMap = {
  blue: { icon: 'bg-info/10 text-info', spark: '#3b82f6' },
  green: { icon: 'bg-success/10 text-success', spark: '#22c55e' },
  violet: { icon: 'bg-primary/10 text-primary', spark: '#6c47ff' },
  orange: { icon: 'bg-warning/10 text-warning', spark: '#f97316' },
  red: { icon: 'bg-destructive/10 text-destructive', spark: '#ef4444' },
};

export function TrendStatCard({
  label,
  value,
  subValue,
  delta,
  deltaLabel = 'vs last week',
  sparkData,
  sparkColor,
  icon,
  invertDelta = false,
  accentColor = 'blue',
  onClick,
}: TrendStatCardProps) {
  const accent = accentMap[accentColor];
  const lineColor = sparkColor ?? accent.spark;

  const isPositive =
    delta !== undefined ? (invertDelta ? delta < 0 : delta > 0) : null;
  const isNeutral = delta === undefined || delta === 0;

  const deltaColor = isNeutral
    ? 'text-muted-foreground'
    : isPositive
      ? 'text-success'
      : 'text-destructive';

  const DeltaIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  const chartData = sparkData?.map((v, i) => ({ i, v }));

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200',
        onClick &&
          'cursor-pointer hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20'
      )}
      onClick={onClick}
    >
      <CardContent className='p-4 space-y-2.5'>
        {/* Header row */}
        <div className='flex items-center gap-2'>
          {icon && (
            <div className={cn('p-1.5 rounded-lg', accent.icon)}>{icon}</div>
          )}
          <p className='text-sm text-muted-foreground font-medium'>{label}</p>
        </div>

        {/* Value + sub */}
        <div>
          <p className='text-2xl font-bold text-foreground tracking-tight leading-none'>
            {value}
          </p>
          {subValue && (
            <p className='text-xs text-muted-foreground mt-1'>{subValue}</p>
          )}
        </div>

        {/* Sparkline */}
        {chartData && chartData.length > 0 && (
          <div className='h-9 -mx-1'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={chartData}>
                <Line
                  type='monotone'
                  dataKey='v'
                  stroke={lineColor}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
                <Tooltip content={() => null} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Delta badge */}
        {delta !== undefined && (
          <div
            className={cn(
              'inline-flex items-center gap-1 text-xs font-semibold',
              deltaColor
            )}
          >
            <DeltaIcon className='h-3 w-3' />
            <span>
              {delta > 0 ? '+' : ''}
              {delta}%{' '}
              <span className='font-normal text-muted-foreground'>
                {deltaLabel}
              </span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
