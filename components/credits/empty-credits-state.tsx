import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function EmptyCreditsState() {
  return (
    <Card className='bg-card border-border'>
      <CardContent className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
          <Sparkles className='h-8 w-8 text-primary' />
        </div>
        <h3 className='mt-4 text-lg font-semibold text-foreground'>
          You haven't used any credits yet
        </h3>
        <p className='mt-2 max-w-sm text-sm text-muted-foreground'>
          Start your first automation to see usage here. Your credits will be
          tracked transparently.
        </p>
        <Link href='/automations' className='mt-6'>
          <Button className='gap-2'>
            <Zap className='h-4 w-4' />
            Create Automation
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
