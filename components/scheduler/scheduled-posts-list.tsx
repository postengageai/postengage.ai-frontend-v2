'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  ChevronRight,
  Image,
  Video,
  Film,
  Layers,
  CircleDot,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useScheduledPosts } from '@/lib/hooks';
import {
  ScheduledPostStatus,
  ScheduledPostMediaType,
  type ScheduledPost,
} from '@/lib/api/scheduler';

// ── Status styles ────────────────────────────────────────────────────────────

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
    label: 'Publishing',
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

const MEDIA_ICON: Record<string, React.ReactNode> = {
  [ScheduledPostMediaType.IMAGE]: <Image className='h-4 w-4' />,
  [ScheduledPostMediaType.VIDEO]: <Video className='h-4 w-4' />,
  [ScheduledPostMediaType.REEL]: <Film className='h-4 w-4' />,
  [ScheduledPostMediaType.STORY]: <CircleDot className='h-4 w-4' />,
  [ScheduledPostMediaType.CAROUSEL]: <Layers className='h-4 w-4' />,
};

type FilterStatus = 'all' | ScheduledPostStatus;

const FILTER_TABS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: ScheduledPostStatus.SCHEDULED, label: 'Scheduled' },
  { value: ScheduledPostStatus.DRAFT, label: 'Drafts' },
  { value: ScheduledPostStatus.PUBLISHED, label: 'Published' },
  { value: ScheduledPostStatus.FAILED, label: 'Failed' },
];

// ── Post row ─────────────────────────────────────────────────────────────────

function PostRow({ post }: { readonly post: ScheduledPost }) {
  const style = STATUS_STYLE[post.status] ?? {
    label: post.status,
    className: 'bg-muted',
  };

  return (
    <Link
      href={`/dashboard/scheduler/${post.id}`}
      className='flex items-center gap-4 px-4 py-3 border-b border-border/40 hover:bg-muted/30 transition-colors group'
    >
      {/* Media type icon */}
      <div className='text-muted-foreground shrink-0'>
        {MEDIA_ICON[post.media_type] ?? <Image className='h-4 w-4' />}
      </div>

      {/* Caption preview */}
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors'>
          {post.caption.slice(0, 80)}
          {post.caption.length > 80 ? '…' : ''}
        </p>
        <div className='flex items-center gap-3 mt-0.5'>
          <span className='flex items-center gap-1 text-xs text-muted-foreground'>
            <Calendar className='h-3 w-3' />
            {format(new Date(post.scheduled_at), 'MMM d, yyyy')}
          </span>
          <span className='flex items-center gap-1 text-xs text-muted-foreground'>
            <Clock className='h-3 w-3' />
            {format(new Date(post.scheduled_at), 'h:mm a')}
          </span>
        </div>
      </div>

      {/* Status badge */}
      <Badge className={cn('text-xs font-semibold shrink-0', style.className)}>
        {style.label}
      </Badge>

      {/* Arrow */}
      <ChevronRight className='h-4 w-4 text-muted-foreground/50 shrink-0 group-hover:text-foreground transition-colors' />
    </Link>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function ScheduledPostsList() {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useScheduledPosts({
    status:
      activeFilter === 'all'
        ? undefined
        : (activeFilter as ScheduledPostStatus),
    page,
    limit,
  });

  const posts = data?.items ?? [];
  const totalPages = data?.pagination?.total
    ? Math.ceil(data.pagination.total / limit)
    : 1;

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-foreground'>
          Scheduled Posts
        </h2>
      </div>

      {/* Filter tabs */}
      <div className='flex flex-wrap gap-1.5'>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => {
              setActiveFilter(tab.value);
              setPage(1);
            }}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
              activeFilter === tab.value
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Post list */}
      <div className='rounded-xl border border-border overflow-hidden'>
        {isLoading ? (
          <div className='space-y-0'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='flex items-center gap-4 px-4 py-3 border-b border-border/40'
              >
                <Skeleton className='h-4 w-4 rounded' />
                <div className='flex-1 space-y-1'>
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-3 w-1/3' />
                </div>
                <Skeleton className='h-5 w-16 rounded-full' />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className='py-12 text-center'>
            <p className='text-sm text-muted-foreground'>No posts found</p>
          </div>
        ) : (
          posts.map(post => <PostRow key={post.id} post={post} />)
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='h-7 text-xs'
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className='text-xs text-muted-foreground'>
            Page {page} of {totalPages}
          </span>
          <Button
            variant='outline'
            size='sm'
            className='h-7 text-xs'
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
