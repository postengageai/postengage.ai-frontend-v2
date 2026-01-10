import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SecurityFormSkeleton() {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className='h-6 w-48' />
          </CardTitle>
          <CardDescription>
            <Skeleton className='h-4 w-64' />
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Current Password Field */}
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-10 w-full' />
          </div>

          {/* New Password Field */}
          <div className='space-y-2'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-10 w-full' />
          </div>

          {/* Confirm Password Field */}
          <div className='space-y-2'>
            <Skeleton className='h-4 w-36' />
            <Skeleton className='h-10 w-full' />
          </div>

          {/* Password Rules */}
          <div className='space-y-2'>
            <Skeleton className='h-4 w-40' />
            <div className='grid gap-2'>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className='flex items-center gap-2'>
                  <Skeleton className='h-4 w-4 rounded-full' />
                  <Skeleton className='h-3 w-48' />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex items-center justify-end gap-3'>
            <Skeleton className='h-10 w-32' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
