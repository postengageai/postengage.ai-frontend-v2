import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export function ProfileFormSkeleton() {
  return (
    <div className='space-y-6'>
      {/* Profile Card Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className='h-6 w-40' />
          </CardTitle>
          <CardDescription>
            <Skeleton className='h-4 w-60' />
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Avatar Section Skeleton */}
          <div className='flex items-center gap-6'>
            <div className='relative'>
              <Skeleton className='h-20 w-20 rounded-full' />
            </div>
            <div>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-3 w-40 mt-2' />
            </div>
          </div>

          <Separator />

          {/* Form Fields Skeleton */}
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>
          </div>

          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-10 w-full' />
          </div>

          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>

          <Separator />

          {/* Read-only Fields Skeleton */}
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>
          </div>

          {/* Save Button Skeleton */}
          <div className='flex justify-end pt-2'>
            <Skeleton className='h-10 w-32' />
          </div>
        </CardContent>
      </Card>

      {/* Account Metadata Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>
            <Skeleton className='h-5 w-32' />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 text-sm sm:grid-cols-3'>
            <div>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-5 w-24 mt-1' />
            </div>
            <div>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-5 w-24 mt-1' />
            </div>
            <div>
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-6 w-16 mt-1' />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
