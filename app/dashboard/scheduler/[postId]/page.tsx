'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Image,
  Hash,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { PostAnalyticsCard } from '@/components/scheduler/PostAnalyticsCard';
import { useScheduledPost, useCancelPost } from '@/lib/hooks';
import { ScheduledPostStatus } from '@/lib/api/scheduler';
import { useToast } from '@/components/ui/use-toast';

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  [ScheduledPostStatus.DRAFT]: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground',
  },
  [ScheduledPostStatus.SCHEDULED]: {
    label: 'Scheduled',
    className: 'bg-primary/15 text-primary',
  },
  [ScheduledPostStatus.PUBLISHING]: {
    label: 'Publishing…',
    className: 'bg-warning/15 text-warning',
  },
  [ScheduledPostStatus.PUBLISHED]: {
    label: 'Published',
    className: 'bg-success/15 text-success',
  },
  [ScheduledPostStatus.FAILED]: {
    label: 'Failed',
    className: 'bg-destructive/15 text-destructive',
  },
  [ScheduledPostStatus.CANCELLED]: {
    label: 'Cancelled',
    className: 'bg-muted text-muted-foreground',
  },
};

function StatusBadge({ status }: { readonly status: string }) {
  const style = STATUS_STYLE[status] ?? {
    label: status,
    className: 'bg-muted text-foreground',
  };
  return (
    <Badge className={cn('text-xs font-semibold', style.className)}>
      {style.label}
    </Badge>
  );
}

// ── Detail row ────────────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
}: {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: React.ReactNode;
}) {
  return (
    <div className='flex items-start gap-3 py-2'>
      <div className='text-muted-foreground mt-0.5'>{icon}</div>
      <div>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <p className='text-sm font-medium text-foreground mt-0.5'>{value}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ScheduledPostDetailPage({
  params,
}: {
  readonly params: Promise<{ postId: string }>;
}) {
  const { postId } = use(params);
  const { data: post, isLoading } = useScheduledPost(postId);
  const cancelPost = useCancelPost();
  const { toast } = useToast();

  const handleCancel = () => {
    cancelPost.mutate(postId, {
      onSuccess: () => toast({ title: 'Post cancelled' }),
      onError: () =>
        toast({
          title: 'Error',
          description: 'Could not cancel post',
          variant: 'destructive',
        }),
    });
  };

  const canCancel =
    post?.status === ScheduledPostStatus.SCHEDULED ||
    post?.status === ScheduledPostStatus.DRAFT;
  const isPublished = post?.status === ScheduledPostStatus.PUBLISHED;

  return (
    <main className='p-4 sm:p-6 lg:p-8 space-y-6 max-w-2xl mx-auto'>
      {/* Back */}
      <div className='flex items-center gap-3'>
        <Button
          asChild
          variant='ghost'
          size='sm'
          className='gap-1.5 h-8 text-xs'
        >
          <Link href='/dashboard/scheduler'>
            <ArrowLeft className='h-3.5 w-3.5' />
            Back to Calendar
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className='space-y-4'>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-32 w-full' />
          <Skeleton className='h-48 w-full' />
        </div>
      ) : !post ? (
        <Card>
          <CardContent className='py-12 text-center'>
            <AlertCircle className='h-8 w-8 text-muted-foreground mx-auto mb-2' />
            <p className='text-sm text-muted-foreground'>Post not found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <StatusBadge status={post.status} />
              <Badge variant='outline' className='text-xs'>
                {post.media_type}
              </Badge>
            </div>
            {canCancel && (
              <Button
                variant='outline'
                size='sm'
                className='h-8 text-xs text-destructive border-destructive/30 hover:bg-destructive/5'
                onClick={handleCancel}
                disabled={cancelPost.isPending}
              >
                {cancelPost.isPending ? 'Cancelling…' : 'Cancel Post'}
              </Button>
            )}
          </div>

          {/* Post details */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-semibold'>
                Post Details
              </CardTitle>
            </CardHeader>
            <CardContent className='divide-y divide-border'>
              <DetailRow
                icon={<Calendar className='h-4 w-4' />}
                label='Scheduled for'
                value={format(new Date(post.scheduled_at), 'PPP p')}
              />
              <DetailRow
                icon={<Clock className='h-4 w-4' />}
                label='Timezone'
                value={post.timezone}
              />
              <DetailRow
                icon={<Image className='h-4 w-4' />}
                label='Media'
                value={`${post.media_urls.length} file${post.media_urls.length !== 1 ? 's' : ''}`}
              />
              {post.hashtags.length > 0 && (
                <DetailRow
                  icon={<Hash className='h-4 w-4' />}
                  label='Hashtags'
                  value={
                    <div className='flex flex-wrap gap-1 mt-0.5'>
                      {post.hashtags.map(tag => (
                        <Badge
                          key={tag}
                          variant='secondary'
                          className='text-xs h-5'
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  }
                />
              )}
              <div className='py-2'>
                <p className='text-xs text-muted-foreground mb-1.5'>Caption</p>
                <p className='text-sm text-foreground whitespace-pre-wrap leading-relaxed'>
                  {post.caption}
                </p>
              </div>
              {post.last_error && (
                <div className='py-2'>
                  <div className='flex items-center gap-2 text-destructive text-xs'>
                    <AlertCircle className='h-3.5 w-3.5' />
                    <span className='font-medium'>Last error</span>
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {post.last_error}
                  </p>
                  {post.retry_count > 0 && (
                    <p className='text-xs text-muted-foreground flex items-center gap-1 mt-0.5'>
                      <RefreshCw className='h-3 w-3' />
                      Retried {post.retry_count} time
                      {post.retry_count !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analytics — only show for published posts */}
          {isPublished && (
            <PostAnalyticsCard
              postId={postId}
              linkedAutomationId={post.linked_automation_id}
            />
          )}
        </>
      )}
    </main>
  );
}
