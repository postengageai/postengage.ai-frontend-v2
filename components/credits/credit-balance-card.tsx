'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Coins, TrendingUp } from 'lucide-react';

interface CreditBalanceCardProps {
  balance: number;
  isLoading?: boolean;
}

export function CreditBalanceCard({
  balance,
  isLoading,
}: CreditBalanceCardProps) {
  const isLowBalance = balance < 100;

  if (isLoading) {
    return (
      <Card className='bg-card border-border'>
        <CardContent className='p-6'>
          <div className='flex items-start justify-between'>
            <div className='space-y-3'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-12 w-40' />
              <Skeleton className='h-4 w-64' />
            </div>
            <Skeleton className='h-12 w-12 rounded-lg' />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-card border-border overflow-hidden'>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-muted-foreground'>
              Available Credits
            </p>
            <p className='text-4xl font-bold font-mono tracking-tight text-foreground'>
              {balance.toLocaleString()}
            </p>
            <p className='text-sm text-muted-foreground'>
              Credits are deducted as you run automations or AI actions.
            </p>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${
              isLowBalance ? 'bg-warning/10' : 'bg-primary/10'
            }`}
          >
            <Coins
              className={`h-6 w-6 ${isLowBalance ? 'text-warning' : 'text-primary'}`}
            />
          </div>
        </div>

        {isLowBalance && (
          <div className='mt-4 flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2'>
            <TrendingUp className='h-4 w-4 text-warning' />
            <p className='text-sm text-warning'>
              Running low — consider topping up to avoid interruptions.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
