import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export function CreditsInfoCard() {
  return (
    <Card className='bg-card border-border'>
      <CardContent className='flex items-start gap-3 p-4'>
        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
          <Lightbulb className='h-4 w-4 text-primary' />
        </div>
        <div className='space-y-1'>
          <p className='text-sm font-medium text-foreground'>
            How credits work
          </p>
          <div className='text-sm text-muted-foreground space-y-1'>
            <p>
              •{' '}
              <span className='font-medium text-foreground'>
                Manual actions are free
              </span>{' '}
              (0 credits).
            </p>
            <p>
              •{' '}
              <span className='font-medium text-foreground'>
                AI actions cost 6-13 credits
              </span>{' '}
              depending on complexity (Standard vs. Full Context).
            </p>
            <p>
              •{' '}
              <span className='font-medium text-foreground'>
                BYOM mode costs only 1 credit
              </span>{' '}
              (infrastructure fee).
            </p>
            <p>
              • Credits are only deducted for successful AI replies. Failed,
              escalated, or empty responses are refunded.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
