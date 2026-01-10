import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function SocialAccountsSkeleton() {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <div>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='mt-1 h-4 w-64' />
        </div>
        <Skeleton className='h-9 w-32' />
      </CardHeader>
      <CardContent className='space-y-4'>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className='flex items-center gap-4 rounded-lg border p-4'
          >
            <Skeleton className='h-12 w-12 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-32' />
              <div className='flex items-center gap-3'>
                <Skeleton className='h-3 w-20' />
                <Skeleton className='h-3 w-24' />
                <Skeleton className='h-3 w-16' />
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-8 w-20' />
              <Skeleton className='h-8 w-8' />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
