import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function SystemHealthBarSkeleton() {
  return (
    <Card className='w-full'>
      <CardContent className='p-4 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-10 w-10 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-24' />
          </div>
        </div>
        <div className='flex items-center gap-8'>
          <div className='space-y-2 hidden sm:block'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-3 w-16' />
          </div>
          <div className='space-y-2 hidden sm:block'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-3 w-16' />
          </div>
          <div className='space-y-2 hidden sm:block'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-3 w-16' />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickInsightsSkeleton() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {[1, 2, 3, 4].map(i => (
        <Card key={i}>
          <CardContent className='p-4'>
            <div className='flex justify-between items-start'>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-8 w-12' />
                <Skeleton className='h-3 w-24' />
              </div>
              <Skeleton className='h-8 w-8 rounded-md' />
            </div>
            <Skeleton className='h-1.5 w-full mt-3 rounded-full' />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PerformanceMetricsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-32' />
      </CardHeader>
      <CardContent>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className='flex flex-col space-y-2 p-4 rounded-lg border'
            >
              <div className='flex items-center gap-2'>
                <Skeleton className='h-8 w-8 rounded-md' />
                <Skeleton className='h-4 w-24' />
              </div>
              <div className='space-y-1'>
                <Skeleton className='h-8 w-16' />
                <Skeleton className='h-3 w-32' />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <Skeleton className='h-6 w-32' />
        <Skeleton className='h-8 w-20' />
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className='flex items-start gap-4'>
              <Skeleton className='h-9 w-9 rounded-full' />
              <div className='flex-1 space-y-2'>
                <div className='flex justify-between'>
                  <Skeleton className='h-4 w-48' />
                  <Skeleton className='h-3 w-12' />
                </div>
                <Skeleton className='h-3 w-full' />
                <Skeleton className='h-3 w-2/3' />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AutomationSummarySkeleton() {
  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-3 w-24' />
          </div>
          <Skeleton className='h-8 w-20' />
        </div>
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='pb-4 mb-4 border-b'>
          <Skeleton className='h-5 w-32' />
        </div>
        <div className='space-y-2'>
          {[1, 2, 3].map(i => (
            <div key={i} className='p-3 border rounded-lg'>
              <div className='flex justify-between items-start'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-8 w-8 rounded-md' />
                  <div className='space-y-1'>
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                </div>
                <Skeleton className='h-5 w-12 rounded-full' />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SuggestionsSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='space-y-1'>
        <Skeleton className='h-6 w-32' />
        <Skeleton className='h-4 w-48' />
      </div>
      <div className='space-y-3'>
        {[1, 2].map(i => (
          <Card key={i}>
            <CardContent className='p-4'>
              <div className='flex gap-3'>
                <Skeleton className='h-8 w-8 rounded-md' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-3 w-full' />
                  <Skeleton className='h-3 w-24 mt-2' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <main className='p-4 sm:p-6 lg:p-8 space-y-6'>
      <SystemHealthBarSkeleton />
      <QuickInsightsSkeleton />
      <PerformanceMetricsSkeleton />
      <div className='grid gap-6 lg:grid-cols-5'>
        <div className='lg:col-span-3 space-y-6'>
          <RecentActivitySkeleton />
        </div>
        <div className='lg:col-span-2 space-y-6'>
          <SuggestionsSkeleton />
          <AutomationSummarySkeleton />
        </div>
      </div>
    </main>
  );
}
