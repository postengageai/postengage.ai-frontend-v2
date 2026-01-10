'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownCircle, ArrowUpCircle, Activity } from 'lucide-react';

interface UsageSummaryCardsProps {
  consumed: number;
  purchased: number;
  totalTransactions: number;
  isLoading?: boolean;
}

export function UsageSummaryCards({
  consumed,
  purchased,
  totalTransactions,
  isLoading,
}: UsageSummaryCardsProps) {
  const cards = [
    {
      label: 'Credits Consumed',
      value: consumed,
      caption: 'Last 30 days',
      icon: ArrowDownCircle,
      color: 'text-chart-1',
    },
    {
      label: 'Credits Purchased',
      value: purchased,
      caption: 'Last 30 days',
      icon: ArrowUpCircle,
      color: 'text-success',
    },
    {
      label: 'Total Transactions',
      value: totalTransactions,
      caption: 'Activities',
      icon: Activity,
      color: 'text-muted-foreground',
    },
  ];

  if (isLoading) {
    return (
      <div className='grid gap-4 sm:grid-cols-3'>
        {[1, 2, 3].map(i => (
          <Card key={i} className='bg-card border-border'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-2'>
                  <Skeleton className='h-3 w-24' />
                  <Skeleton className='h-8 w-16' />
                  <Skeleton className='h-3 w-20' />
                </div>
                <Skeleton className='h-8 w-8 rounded' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='grid gap-4 sm:grid-cols-3'>
      {cards.map(card => (
        <Card key={card.label} className='bg-card border-border'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <p className='text-xs font-medium text-muted-foreground'>
                  {card.label}
                </p>
                <p className='text-2xl font-bold font-mono text-foreground'>
                  {card.value.toLocaleString()}
                </p>
                <p className='text-xs text-muted-foreground'>{card.caption}</p>
              </div>
              <card.icon className={`h-8 w-8 ${card.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
