'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivityItem } from '@/components/dashboard/activity-item';
import { History, Sparkles, ArrowRight } from 'lucide-react';
import type { Activity } from '@/lib/types/dashboard';

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

export function ActivityFeed({ activities, maxItems = 5 }: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);
  const hasMore = activities.length > maxItems;

  return (
    <section>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h2 className='text-lg font-semibold'>Recent Activity</h2>
          <p className='text-sm text-muted-foreground'>
            {activities.length > 0
              ? 'What your AI has been doing'
              : 'Activity will appear here'}
          </p>
        </div>
        {activities.length > 0 && (
          <Button variant='ghost' size='sm' asChild>
            <Link href='/dashboard/activity'>
              View All
              <ArrowRight className='ml-1 h-3 w-3' />
            </Link>
          </Button>
        )}
      </div>

      {activities.length > 0 ? (
        <Card className='py-0 overflow-hidden'>
          <CardContent className='p-5'>
            <div className='space-y-0'>
              {displayedActivities.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  isLast={index === displayedActivities.length - 1}
                />
              ))}
            </div>

            {hasMore && (
              <div className='pt-3 mt-2 border-t border-border'>
                <Link
                  href='/dashboard/activity'
                  className='text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1'
                >
                  View {activities.length - maxItems} more activities
                  <ArrowRight className='h-3 w-3' />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <EmptyActivityState />
      )}
    </section>
  );
}

function EmptyActivityState() {
  return (
    <Card className='py-0 overflow-hidden border-dashed bg-card/50'>
      <CardContent className='p-8 text-center'>
        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary'>
          <History className='h-6 w-6 text-muted-foreground' />
        </div>
        <h3 className='mt-4 font-semibold'>No activity yet</h3>
        <p className='mt-1 text-sm text-muted-foreground max-w-sm mx-auto'>
          When your automations start working, you'll see all the replies and
          actions here.
        </p>
        <div className='mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground'>
          <Sparkles className='h-3 w-3 text-primary' />
          Your AI is ready to engage
        </div>
      </CardContent>
    </Card>
  );
}
