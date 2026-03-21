'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  MessageCircle,
  Loader2,
  ImageIcon,
  Film,
  Images,
  Clapperboard,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/http/errors';
import {
  InstagramMediaApi,
  GetMediaResponse,
  MediaComment,
} from '@/lib/api/instagram/media';

const COMMENTS_PER_PAGE = 20;

// ── Type badge ──────────────────────────────────────────────────────────────
function MediaTypeBadge({ type }: { type: GetMediaResponse['media_type'] }) {
  const map: Record<
    GetMediaResponse['media_type'],
    { label: string; icon: React.ElementType | null; cls: string }
  > = {
    IMAGE: {
      label: 'Photo',
      icon: ImageIcon,
      cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    VIDEO: {
      label: 'Video',
      icon: Film,
      cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    CAROUSEL: {
      label: 'Carousel',
      icon: Images,
      cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    REELS: {
      label: 'Reel',
      icon: Clapperboard,
      cls: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    },
    STORIES: {
      label: 'Story',
      icon: null,
      cls: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
  };
  const cfg = map[type];
  const Icon = cfg.icon;
  return (
    <Badge variant='outline' className={`gap-1 text-xs ${cfg.cls}`}>
      {Icon && <Icon className='h-3 w-3' />}
      {cfg.label}
    </Badge>
  );
}

// ── Carousel / single media viewer ─────────────────────────────────────────
function MediaViewer({ media }: { media: GetMediaResponse }) {
  const [idx, setIdx] = useState(0);

  const children = media.children?.data ?? [];
  const slides =
    children.length > 0
      ? children
      : [
          {
            id: media.id,
            media_type: media.media_type as 'IMAGE' | 'VIDEO',
            media_url: media.media_url,
            thumbnail_url: media.thumbnail_url,
          },
        ];

  const current = slides[idx];
  const isSlideVideo = current.media_type === 'VIDEO';

  return (
    <div className='relative rounded-xl border border-border bg-black overflow-hidden aspect-square flex items-center justify-center'>
      {isSlideVideo ? (
        <video
          key={current.id}
          src={current.media_url}
          poster={current.thumbnail_url}
          controls
          className='max-h-full max-w-full'
        />
      ) : current.media_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={current.id}
          src={current.thumbnail_url ?? current.media_url}
          alt={`Slide ${idx + 1}`}
          className='max-h-full max-w-full object-contain'
        />
      ) : (
        <div className='flex flex-col items-center gap-2 text-muted-foreground p-8'>
          <ImageIcon className='h-12 w-12' />
          <p className='text-sm'>Media not available</p>
        </div>
      )}

      {slides.length > 1 && (
        <>
          <button
            className='absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 disabled:opacity-30 transition-colors'
            onClick={() => setIdx(i => Math.max(0, i - 1))}
            disabled={idx === 0}
          >
            <ChevronLeft className='h-4 w-4' />
          </button>
          <button
            className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 disabled:opacity-30 transition-colors'
            onClick={() => setIdx(i => Math.min(slides.length - 1, i + 1))}
            disabled={idx === slides.length - 1}
          >
            <ChevronRight className='h-4 w-4' />
          </button>
          <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5'>
            {slides.map((_, i) => (
              <button
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
                onClick={() => setIdx(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Comment row ─────────────────────────────────────────────────────────────
function CommentRow({ comment }: { comment: MediaComment }) {
  const initials = (comment.username ?? 'U').slice(0, 2).toUpperCase();
  return (
    <div className='flex gap-3 py-3 border-b border-border/40 last:border-0'>
      <Avatar className='w-7 h-7 shrink-0'>
        <AvatarFallback className='text-[10px] bg-primary/10 text-primary'>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='text-xs font-semibold'>
            {comment.username ? `@${comment.username}` : 'user'}
          </span>
          <span className='text-[10px] text-muted-foreground'>
            {formatDistanceToNow(new Date(comment.timestamp), {
              addSuffix: true,
            })}
          </span>
          {!!comment.like_count && (
            <span className='ml-auto flex items-center gap-0.5 text-[10px] text-muted-foreground'>
              <Heart className='h-2.5 w-2.5' />
              {comment.like_count}
            </span>
          )}
        </div>
        <p className='text-xs text-foreground/85 mt-0.5 break-words leading-relaxed'>
          {comment.text}
        </p>
        {comment.replies?.data && comment.replies.data.length > 0 && (
          <div className='mt-2 pl-3 border-l border-border/60 space-y-1.5'>
            {comment.replies.data.map(reply => (
              <div key={reply.id}>
                <span className='text-[10px] font-semibold mr-1.5'>
                  {reply.username ? `@${reply.username}` : 'user'}
                </span>
                <span className='text-[10px] text-foreground/80 break-words'>
                  {reply.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function InstagramPostDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const mediaId = params.id as string;
  const accountId = searchParams.get('account_id') ?? '';

  const [media, setMedia] = useState<GetMediaResponse | null>(null);
  const [mediaLoading, setMediaLoading] = useState(true);

  const [comments, setComments] = useState<MediaComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [commentsInitialized, setCommentsInitialized] = useState(false);

  const [copied, setCopied] = useState(false);

  // Fetch post
  useEffect(() => {
    if (!mediaId || !accountId) return;
    (async () => {
      try {
        const res = await InstagramMediaApi.getMedia(mediaId, {
          social_account_id: accountId,
          fields:
            'id,media_type,media_url,thumbnail_url,caption,timestamp,permalink,like_count,comments_count,children',
        });
        setMedia(res.data ?? null);
      } catch (err) {
        const e = parseApiError(err);
        toast({
          variant: 'destructive',
          title: e.title,
          description: e.message,
        });
        router.push('/dashboard/media');
      } finally {
        setMediaLoading(false);
      }
    })();
  }, [mediaId, accountId, router, toast]);

  // Fetch comments
  const loadComments = useCallback(
    async (cursor?: string) => {
      if (!accountId) return;
      setCommentsLoading(true);
      try {
        const res = await InstagramMediaApi.getComments(mediaId, {
          social_account_id: accountId,
          limit: COMMENTS_PER_PAGE,
          after: cursor,
        });
        const newItems = res.data ?? [];
        setComments(prev => (cursor ? [...prev, ...newItems] : newItems));
        const nc = res.pagination?.next_cursor;
        setNextCursor(nc ?? undefined);
        setHasMore(
          res.pagination?.has_next_page ??
            res.pagination?.has_next ??
            (nc !== undefined && nc !== null) ??
            newItems.length === COMMENTS_PER_PAGE
        );
        setCommentsInitialized(true);
      } catch {
        // Comments endpoint may not be available — show empty state silently
        setCommentsInitialized(true);
      } finally {
        setCommentsLoading(false);
      }
    },
    [mediaId, accountId]
  );

  // Auto-load comments once post is loaded
  useEffect(() => {
    if (!mediaLoading && media && !commentsInitialized) {
      loadComments();
    }
  }, [mediaLoading, media, commentsInitialized, loadComments]);

  const handleCopy = () => {
    if (!media?.caption) return;
    navigator.clipboard.writeText(media.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading skeleton
  if (mediaLoading) {
    return (
      <div className='mx-auto max-w-5xl px-4 py-6 sm:px-6 space-y-6'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-9 w-28 rounded-lg' />
          <Skeleton className='h-9 w-40 rounded-lg' />
        </div>
        <div className='grid gap-6 lg:grid-cols-[1fr_380px]'>
          <Skeleton className='aspect-square rounded-xl' />
          <div className='space-y-4'>
            <Skeleton className='h-24 w-full rounded-xl' />
            <Skeleton className='h-64 w-full rounded-xl' />
          </div>
        </div>
      </div>
    );
  }

  if (!media) return null;

  const postDate = new Date(media.timestamp);

  return (
    <div className='mx-auto max-w-5xl px-4 py-6 sm:px-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between gap-4'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => router.back()}
          className='gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='gap-2 shrink-0'
          onClick={() =>
            window.open(media.permalink, '_blank', 'noopener,noreferrer')
          }
        >
          <ExternalLink className='h-3.5 w-3.5' />
          View on Instagram
        </Button>
      </div>

      {/* Content grid */}
      <div className='grid gap-6 lg:grid-cols-[1fr_380px] items-start'>
        {/* Left: media */}
        <div className='space-y-4'>
          <MediaViewer media={media} />

          {/* Stat strip */}
          <div className='flex items-center gap-3 flex-wrap px-1'>
            <MediaTypeBadge type={media.media_type} />
            {media.like_count != null && (
              <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                <Heart className='h-4 w-4 text-rose-400' />
                <span className='font-medium text-foreground'>
                  {media.like_count.toLocaleString()}
                </span>
                <span>likes</span>
              </div>
            )}
            {(media.comments_count ?? 0) > 0 && (
              <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                <MessageCircle className='h-4 w-4 text-primary' />
                <span className='font-medium text-foreground'>
                  {media.comments_count!.toLocaleString()}
                </span>
                <span>comments</span>
              </div>
            )}
            <span className='ml-auto text-xs text-muted-foreground'>
              {format(postDate, 'MMM d, yyyy · h:mm a')}
            </span>
          </div>
        </div>

        {/* Right: caption + comments */}
        <div className='space-y-4 lg:sticky lg:top-20'>
          {/* Caption card */}
          <div className='rounded-xl border border-border bg-card p-4 space-y-2.5'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                Caption
              </span>
              {media.caption && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6'
                  onClick={handleCopy}
                  title='Copy caption'
                >
                  {copied ? (
                    <Check className='h-3 w-3 text-success' />
                  ) : (
                    <Copy className='h-3 w-3' />
                  )}
                </Button>
              )}
            </div>
            {media.caption ? (
              <p className='text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed break-words'>
                {media.caption}
              </p>
            ) : (
              <p className='text-sm text-muted-foreground italic'>No caption</p>
            )}
          </div>

          {/* Comments card */}
          <div className='rounded-xl border border-border bg-card overflow-hidden'>
            <div className='flex items-center justify-between px-4 py-3 border-b border-border/60'>
              <div className='flex items-center gap-2'>
                <MessageCircle className='h-3.5 w-3.5 text-muted-foreground' />
                <span className='text-sm font-semibold'>
                  Comments
                  {(media.comments_count ?? 0) > 0 && (
                    <span className='ml-1 text-xs text-muted-foreground font-normal'>
                      ({media.comments_count!.toLocaleString()})
                    </span>
                  )}
                </span>
              </div>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                title='Refresh'
                onClick={() => {
                  setComments([]);
                  setNextCursor(undefined);
                  setCommentsInitialized(false);
                  loadComments();
                }}
              >
                <RefreshCw className='h-3 w-3' />
              </Button>
            </div>

            <div className='max-h-[420px] overflow-y-auto px-4'>
              {/* Skeleton while loading first batch */}
              {commentsLoading && comments.length === 0 && (
                <div className='py-4 space-y-4'>
                  {[1, 2, 3].map(i => (
                    <div key={i} className='flex gap-3'>
                      <Skeleton className='w-7 h-7 rounded-full shrink-0' />
                      <div className='flex-1 space-y-1.5'>
                        <Skeleton className='h-2.5 w-20' />
                        <Skeleton className='h-2.5 w-full' />
                        <Skeleton className='h-2.5 w-3/4' />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {commentsInitialized &&
                comments.length === 0 &&
                !commentsLoading && (
                  <p className='py-10 text-center text-sm text-muted-foreground'>
                    No comments yet
                  </p>
                )}

              {comments.map(c => (
                <CommentRow key={c.id} comment={c} />
              ))}

              {commentsLoading && comments.length > 0 && (
                <div className='flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground'>
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                  Loading…
                </div>
              )}
            </div>

            {/* Load more footer */}
            {commentsInitialized && (hasMore || comments.length > 0) && (
              <div className='px-4 py-3 border-t border-border/60 flex items-center justify-between'>
                <span className='text-xs text-muted-foreground'>
                  {comments.length} shown
                  {(media.comments_count ?? 0) > 0 &&
                    ` of ${media.comments_count!.toLocaleString()}`}
                </span>
                {hasMore && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-xs h-7'
                    onClick={() => loadComments(nextCursor)}
                    disabled={commentsLoading}
                  >
                    {commentsLoading && (
                      <Loader2 className='h-3 w-3 animate-spin mr-1' />
                    )}
                    Load more
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Permalink */}
          <div className='rounded-xl border border-border bg-card px-4 py-3'>
            <a
              href={media.permalink}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-start gap-1.5 text-xs text-primary hover:underline break-all'
            >
              <ExternalLink className='h-3 w-3 shrink-0 mt-0.5' />
              {media.permalink}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
