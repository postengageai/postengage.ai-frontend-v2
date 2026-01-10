import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PreferencesFormSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Language & Region Card Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-4 w-64' />
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-3 w-48' />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button Skeleton */}
      <div className='flex items-center justify-end gap-3'>
        <Skeleton className='h-10 w-32' />
      </div>
    </div>
  );
}
