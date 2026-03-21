'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWinsFeed, usePrependWinItem } from '@/lib/hooks';
import { socketService } from '@/lib/socket/socket.service';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/hooks';
import type { WinsFeedItem } from '@/lib/api/value-analytics';

// ── Constants ─────────────────────────────────────────────────────────────────

const WIN_ICON: Record<WinsFeedItem['category'], string> = {
  lead: '🎯',
  follower: '👥',
  automation: '💬',
  time_saved: '✅',
  engagement: '📈',
};

// ── Relative time helper ──────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

// ── WinsFeedItemRow ───────────────────────────────────────────────────────────

interface WinsFeedItemRowProps {
  readonly item: WinsFeedItem;
  readonly isNew?: boolean;
  readonly onClick?: () => void;
}

function WinsFeedItemRow({ item, isNew, onClick }: WinsFeedItemRowProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={e => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick();
      }}
      className={cn(
        'flex items-start gap-3 px-4 py-3 transition-colors duration-150',
        onClick && 'cursor-pointer hover:bg-muted/40',
        isNew && 'bg-primary/5 animate-in slide-in-from-top-1 duration-300'
      )}
    >
      <span className='text-base leading-none mt-0.5 shrink-0'>
        {WIN_ICON[item.category]}
      </span>
      <div className='flex-1 min-w-0'>
        <p className='text-sm text-foreground leading-snug'>{item.headline}</p>
        {item.detail && (
          <p className='text-xs text-muted-foreground mt-0.5'>{item.detail}</p>
        )}
      </div>
      <span className='text-xs text-muted-foreground shrink-0 mt-0.5'>
        {relativeTime(item.occurred_at)}
      </span>
    </div>
  );
}

// ── WinsFeed ──────────────────────────────────────────────────────────────────

export function WinsFeed() {
  const router = useRouter();
  const prependItem = usePrependWinItem();
  const qc = useQueryClient();
  const isConnectedRef = useRef(false);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useWinsFeed();

  const allItems = data?.pages.flatMap(p => p.items) ?? [];

  // WebSocket: subscribe on mount, unsubscribe on unmount
  const handleWinsUpdate = useCallback(
    (item: WinsFeedItem) => {
      prependItem(item);
    },
    [prependItem]
  );

  const handleMilestone = useCallback(() => {
    qc.invalidateQueries({ queryKey: queryKeys.value.milestones() });
  }, [qc]);

  useEffect(() => {
    const socket = socketService.connect();
    if (!socket) return;

    isConnectedRef.current = socket.connected;

    socketService.subscribeToWinsUpdate(handleWinsUpdate);
    socketService.subscribeToMilestoneAchieved(handleMilestone);

    return () => {
      socketService.unsubscribeFromWinsUpdate(handleWinsUpdate);
      socketService.unsubscribeFromMilestoneAchieved(handleMilestone);
    };
  }, [handleWinsUpdate, handleMilestone]);

  const isSocketConnected = socketService.isSocketConnected();

  return (
    <Card className='overflow-hidden'>
      <CardHeader className='pb-0 pt-4 px-4'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base font-semibold'>
            Today&apos;s Wins
          </CardTitle>
          <div className='flex items-center gap-1.5 text-xs'>
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                isSocketConnected
                  ? 'bg-success animate-pulse'
                  : 'bg-muted-foreground'
              )}
            />
            <span className='text-muted-foreground'>Live</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className='p-0 pt-2'>
        {isLoading ? (
          <div className='space-y-0 divide-y divide-border/60'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='flex items-start gap-3 px-4 py-3'>
                <Skeleton className='h-5 w-5 rounded shrink-0' />
                <div className='flex-1 space-y-1.5'>
                  <Skeleton className='h-3.5 w-3/4' />
                  <Skeleton className='h-3 w-1/2' />
                </div>
                <Skeleton className='h-3 w-10 shrink-0' />
              </div>
            ))}
          </div>
        ) : allItems.length === 0 ? (
          <div className='px-4 py-10 text-center'>
            <p className='text-sm font-medium text-foreground'>
              No wins yet today
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              Activate automations to start tracking your wins in real time.
            </p>
          </div>
        ) : (
          <>
            <div className='max-h-80 overflow-y-auto divide-y divide-border/60'>
              {allItems.map(item => (
                <WinsFeedItemRow
                  key={item.id}
                  item={item}
                  onClick={
                    item.related_automation_id
                      ? () =>
                          router.push(
                            `/dashboard/automations/${item.related_automation_id}`
                          )
                      : undefined
                  }
                />
              ))}
            </div>

            {hasNextPage && (
              <div className='px-4 py-2 border-t border-border/60'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='w-full text-xs text-muted-foreground hover:text-foreground h-8'
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
