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
          <p className='text-sm text-muted-foreground'>
            Credits are only deducted after a successful action. Failed or
            cancelled operations are automatically refunded.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
