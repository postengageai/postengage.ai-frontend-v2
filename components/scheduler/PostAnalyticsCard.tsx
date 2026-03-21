'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePostAnalytics } from '@/lib/hooks';
import {
  Eye,
  TrendingUp,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Clock,
} from 'lucide-react';

// ── Stat row ──────────────────────────────────────────────────────────────────

interface StatRowProps {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string | number;
  readonly highlight?: boolean;
}

function StatRow({ icon, label, value, highlight = false }: StatRowProps) {
  return (
    <div className='flex items-center justify-between py-1.5'>
      <div className='flex items-center gap-2 text-muted-foreground text-xs'>
        {icon}
        <span>{label}</span>
      </div>
      <span
        className={cn(
          'text-xs font-semibold tabular-nums',
          highlight ? 'text-primary' : 'text-foreground'
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface PostAnalyticsCardProps {
  readonly postId: string;
  readonly linkedAutomationId?: string;
  readonly linkedAutomationName?: string;
}

export function PostAnalyticsCard({
  postId,
  linkedAutomationId,
  linkedAutomationName,
}: PostAnalyticsCardProps) {
  const { data: analytics, isLoading, isError } = usePostAnalytics(postId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className='pb-3'>
          <Skeleton className='h-4 w-32' />
        </CardHeader>
        <CardContent className='space-y-2'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='flex items-center justify-between'>
              <Skeleton className='h-3 w-20' />
              <Skeleton className='h-3 w-10' />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError || !analytics) {
    return (
      <Card>
        <CardContent className='py-8 text-center'>
          <Clock className='h-8 w-8 text-muted-foreground mx-auto mb-2' />
          <p className='text-sm text-muted-foreground'>
            Analytics available ~30 min after publishing
          </p>
        </CardContent>
      </Card>
    );
  }

  // Client-side engagement rate computation fallback
  const engagementRate =
    analytics.engagement_rate > 0
      ? analytics.engagement_rate
      : analytics.reach > 0
        ? ((analytics.likes + analytics.comments_count + analytics.saves) /
            analytics.reach) *
          100
        : 0;

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-sm font-semibold'>
            Post Analytics
          </CardTitle>
          {linkedAutomationId && linkedAutomationName && (
            <Badge variant='secondary' className='text-xs'>
              {linkedAutomationName}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className='divide-y divide-border'>
        <div className='pb-2 space-y-0'>
          <StatRow
            icon={<Eye className='h-3 w-3' />}
            label='Reach'
            value={analytics.reach.toLocaleString()}
          />
          <StatRow
            icon={<TrendingUp className='h-3 w-3' />}
            label='Impressions'
            value={analytics.impressions.toLocaleString()}
          />
          <StatRow
            icon={<TrendingUp className='h-3 w-3 text-primary' />}
            label='Engagement rate'
            value={`${engagementRate.toFixed(2)}%`}
            highlight
          />
        </div>
        <div className='pt-2 space-y-0'>
          <StatRow
            icon={<Heart className='h-3 w-3' />}
            label='Likes'
            value={analytics.likes.toLocaleString()}
          />
          <StatRow
            icon={<MessageCircle className='h-3 w-3' />}
            label='Comments'
            value={analytics.comments_count.toLocaleString()}
          />
          <StatRow
            icon={<Bookmark className='h-3 w-3' />}
            label='Saves'
            value={analytics.saves.toLocaleString()}
          />
          <StatRow
            icon={<Share2 className='h-3 w-3' />}
            label='Shares'
            value={analytics.shares.toLocaleString()}
          />
          {analytics.video_views !== undefined && (
            <StatRow
              icon={<Eye className='h-3 w-3' />}
              label='Video views'
              value={analytics.video_views.toLocaleString()}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
