'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickInsightsProps {
  credits: {
    remaining: number;
    total: number;
  };
  todayReplies: number;
  weeklyGrowth: number;
}

export function QuickInsights({
  credits,
  todayReplies,
  weeklyGrowth,
}: QuickInsightsProps) {
  const creditsPercent = (credits.remaining / credits.total) * 100;
  const isLowCredits = creditsPercent <= 20;

  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
      {/* Credits Card */}
      <Card
        className={cn('overflow-hidden', isLowCredits && 'border-warning/50')}
      >
        <CardContent className='p-4'>
          <div className='flex items-start justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>Credits Left</p>
              <p className='text-2xl font-bold mt-1'>{credits.remaining}</p>
              <p className='text-xs text-muted-foreground mt-1'>
                of {credits.total} total
              </p>
            </div>
            <div
              className={cn(
                'p-2 rounded-md',
                isLowCredits ? 'bg-warning/10' : 'bg-primary/10'
              )}
            >
              {isLowCredits ? (
                <AlertCircle className='h-4 w-4 text-warning' />
              ) : (
                <Zap className='h-4 w-4 text-primary' />
              )}
            </div>
          </div>
          {/* Progress bar */}
          <div className='mt-3 h-1.5 rounded-full bg-secondary overflow-hidden'>
            <div
              className={cn(
                'h-full rounded-full transition-all',
                isLowCredits ? 'bg-warning' : 'bg-primary'
              )}
              style={{ width: `${creditsPercent}%` }}
            />
          </div>
          {isLowCredits && (
            <Button
              variant='link'
              size='sm'
              className='px-0 mt-2 h-auto text-warning'
              asChild
            >
              <Link href='/dashboard/credits'>
                Top up credits
                <ArrowRight className='h-3 w-3 ml-1' />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Today's Activity */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex items-start justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>Today's Replies</p>
              <p className='text-2xl font-bold mt-1'>{todayReplies}</p>
              <p className='text-xs text-muted-foreground mt-1'>
                Auto-sent today
              </p>
            </div>
            <div className='p-2 rounded-md bg-success/10'>
              <TrendingUp className='h-4 w-4 text-success' />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Growth */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex items-start justify-between'>
            <div>
              <p className='text-sm text-muted-foreground'>Weekly Growth</p>
              <p className='text-2xl font-bold mt-1'>+{weeklyGrowth}%</p>
              <p className='text-xs text-muted-foreground mt-1'>vs last week</p>
            </div>
            <div className='p-2 rounded-md bg-primary/10'>
              <TrendingUp className='h-4 w-4 text-primary' />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
