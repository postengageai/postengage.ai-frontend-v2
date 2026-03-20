'use client';

import type React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendStatCardProps {
  label: string;
  value: string | number;
  subValue?: React.ReactNode;
  delta?: number;
  deltaLabel?: string;
  sparkData?: number[];
  icon?: React.ReactNode;
  invertDelta?: boolean;
  accentColor?: 'blue' | 'green' | 'violet' | 'orange' | 'red';
  empty?: boolean;
  emptyMessage?: string;
  onClick?: () => void;
}

const accentMap: Record<
  NonNullable<TrendStatCardProps['accentColor']>,
  { border: string; icon: string; spark: string; glow: string }
> = {
  violet: {
    border: 'border-l-violet-500',
    icon: 'bg-violet-500/10 text-violet-400',
    spark: '#8b5cf6',
    glow: 'shadow-[0_0_12px_0_rgba(139,92,246,0.12)]',
  },
  green: {
    border: 'border-l-emerald-500',
    icon: 'bg-emerald-500/10 text-emerald-400',
    spark: '#10b981',
    glow: 'shadow-[0_0_12px_0_rgba(16,185,129,0.12)]',
  },
  blue: {
    border: 'border-l-blue-500',
    icon: 'bg-blue-500/10 text-blue-400',
    spark: '#3b82f6',
    glow: 'shadow-[0_0_12px_0_rgba(59,130,246,0.12)]',
  },
  orange: {
    border: 'border-l-amber-500',
    icon: 'bg-amber-500/10 text-amber-400',
    spark: '#f59e0b',
    glow: 'shadow-[0_0_12px_0_rgba(245,158,11,0.12)]',
  },
  red: {
    border: 'border-l-red-500',
    icon: 'bg-red-500/10 text-red-400',
    spark: '#ef4444',
    glow: 'shadow-[0_0_12px_0_rgba(239,68,68,0.12)]',
  },
};

export function TrendStatCard({
  label,
  value,
  subValue,
  delta,
  deltaLabel = 'vs last week',
  sparkData,
  icon,
  invertDelta = false,
  accentColor = 'violet',
  empty = false,
  emptyMessage,
  onClick,
}: TrendStatCardProps) {
  const accent = accentMap[accentColor];
  const chartData = sparkData?.map((v, i) => ({ i, v }));

  const isPositive = delta !== undefined
    ? (invertDelta ? delta < 0 : delta > 0)
    : null;
  const isNeutral = delta === undefined || delta === 0;

  const deltaColor = isNeutral
    ? 'text-muted-foreground'
    : isPositive
      ? 'text-emerald-400'
      : 'text-red-400';

  const DeltaIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative flex flex-col bg-card border border-border border-l-2 rounded-xl p-5',
        'transition-all duration-200',
        accent.border,
        onClick && 'cursor-pointer hover:border-border/60 hover:-translate-y-0.5',
        onClick && accent.glow,
      )}
    >
      {/* Header */}
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          {icon && (
            <div className={cn('p-1.5 rounded-lg', accent.icon)}>
              {icon}
            </div>
          )}
          <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
            {label}
          </span>
        </div>
        {/* Mini sparkline in top-right */}
        {chartData && chartData.length > 0 && (
          <div className='w-14 h-6 opacity-60'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={chartData}>
                <Line
                  type='monotone'
                  dataKey='v'
                  stroke={accent.spark}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Value */}
      {empty ? (
        <div className='flex-1 flex flex-col justify-center py-2'>
          <p className='text-2xl font-bold text-foreground tabular-nums'>—</p>
          {emptyMessage && (
            <p className='text-xs text-muted-foreground mt-1 leading-snug'>{emptyMessage}</p>
          )}
        </div>
      ) : (
        <div className='flex-1'>
          <p className='text-3xl font-bold tracking-tight text-foreground tabular-nums leading-none'>
            {value}
          </p>
          {subValue && (
            <div className='text-xs text-muted-foreground mt-1.5 leading-snug'>
              {subValue}
            </div>
          )}
        </div>
      )}

      {/* Delta */}
      {!empty && delta !== undefined && (
        <div className={cn('flex items-center gap-1 mt-3 text-xs font-medium', deltaColor)}>
          <DeltaIcon className='h-3 w-3 shrink-0' />
          <span>
            {delta > 0 ? '+' : ''}{delta}% {deltaLabel}
          </span>
        </div>
      )}
    </div>
  );
}
