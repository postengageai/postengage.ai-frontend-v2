'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import type { DateRange } from '@/lib/types/credits';

interface UsageChartProps {
  data: Array<{
    date: string;
    consumption: number;
    purchases: number;
  }>;
  isLoading?: boolean;
  onDateRangeChange?: (range: DateRange) => void;
}

export function UsageChart({
  data,
  isLoading,
  onDateRangeChange,
}: UsageChartProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>('30d');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleRangeChange = (range: DateRange) => {
    setSelectedRange(range);
    onDateRangeChange?.(range);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredData = useMemo(() => {
    if (selectedRange === '7d') return data.slice(-7);
    return data;
  }, [data, selectedRange]);

  const hasData = filteredData.some(d => d.consumption > 0 || d.purchases > 0);

  const maxValue = useMemo(() => {
    const max = Math.max(...filteredData.map(d => d.consumption), 1);
    return Math.ceil(max / 5) * 5;
  }, [filteredData]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <Skeleton className='h-5 w-40' />
          <div className='flex gap-2'>
            <Skeleton className='h-8 w-20' />
            <Skeleton className='h-8 w-20' />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-[280px] w-full' />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-base font-medium'>
          Credit Usage Over Time
        </CardTitle>

        <div className='flex gap-1'>
          {(['7d', '30d'] as const).map(range => (
            <Button
              key={range}
              variant={selectedRange === range ? 'secondary' : 'ghost'}
              size='sm'
              onClick={() => handleRangeChange(range)}
              className='text-xs'
            >
              {range === '7d' ? '7 days' : '30 days'}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {!hasData ? (
          <div className='flex h-[280px] items-center justify-center'>
            <p className='text-sm text-muted-foreground'>
              No credit usage during this period.
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {/* Legend */}
            <div className='flex items-center gap-4 text-xs text-muted-foreground'>
              <div className='flex items-center gap-1.5'>
                <div className='h-2.5 w-2.5 rounded-sm bg-indigo-500' />
                <span>Credits consumed</span>
              </div>
            </div>

            {/* Chart Container */}
            <div className='relative'>
              {/* Y-axis */}
              <div className='absolute left-0 top-0 flex h-[200px] flex-col justify-between text-[11px] text-muted-foreground'>
                <span>{maxValue}</span>
                <span>{Math.round(maxValue / 2)}</span>
                <span>0</span>
              </div>

              {/* Chart Area */}
              <div className='relative ml-10'>
                {/* Grid */}
                <div className='absolute inset-0 h-[200px]'>
                  <div className='absolute left-0 right-0 top-0 border-t border-dashed border-border/40' />
                  <div className='absolute left-0 right-0 top-1/2 border-t border-dashed border-border/40' />
                  <div className='absolute bottom-0 left-0 right-0 border-t border-border/60' />
                </div>

                {/* Bars */}
                <div className='relative flex h-[200px] items-end gap-[2px]'>
                  {filteredData.map((item, index) => {
                    const heightPercent = (item.consumption / maxValue) * 100;
                    const barHeight =
                      item.consumption > 0 ? Math.max(heightPercent, 2) : 0;

                    const showLabel =
                      selectedRange === '7d' ||
                      index % 5 === 0 ||
                      index === filteredData.length - 1;

                    return (
                      <div
                        key={item.date}
                        className='relative flex flex-1 flex-col items-center'
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        {/* Tooltip */}
                        {hoveredIndex === index && (
                          <div className='absolute bottom-full z-20 mb-2 whitespace-nowrap rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl'>
                            <div className='font-medium'>
                              {formatDate(item.date)}
                            </div>
                            <div className='mt-1 text-muted-foreground'>
                              <span className='text-indigo-400'>
                                {item.consumption}
                              </span>{' '}
                              credits consumed
                            </div>
                          </div>
                        )}

                        {/* Bar */}
                        <div
                          className='w-full rounded-t bg-indigo-500/80 transition-all hover:bg-indigo-400'
                          style={{
                            height: `${barHeight}%`,
                            minWidth: '4px',
                            maxWidth: selectedRange === '7d' ? '40px' : '16px',
                          }}
                        />

                        {/* X-axis label */}
                        {showLabel && (
                          <span className='absolute -bottom-6 text-[10px] text-muted-foreground'>
                            {formatDate(item.date).split(' ')[1]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* X-axis range */}
                <div className='mt-8 flex justify-between text-[11px] text-muted-foreground'>
                  <span>{formatDate(filteredData[0]?.date)}</span>
                  <span>
                    {formatDate(filteredData[filteredData.length - 1]?.date)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
