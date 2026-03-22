'use client';

import { useState, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import {
  CalendarIcon,
  Upload,
  FolderOpen,
  X,
  Hash,
  Loader2,
  ImagePlus,
} from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCreatePost, useUpdatePost, useBestTimes } from '@/lib/hooks';
import {
  ScheduledPostMediaType,
  type ScheduledPost,
  type BestTimeRecommendation,
} from '@/lib/api/scheduler';
import { MediaApi, type Media } from '@/lib/api/media';
import { MediaPickerDialog } from '@/components/media/media-picker-dialog';
import { useToast } from '@/components/ui/use-toast';
import { parseApiError } from '@/lib/http/errors';

// ── Helpers ────────────────────────────────────────────────────────────────────

const MEDIA_TYPE_LABELS: Record<string, string> = {
  [ScheduledPostMediaType.IMAGE]: 'Image',
  [ScheduledPostMediaType.VIDEO]: 'Video',
  [ScheduledPostMediaType.REEL]: 'Reel',
  [ScheduledPostMediaType.STORY]: 'Story',
  [ScheduledPostMediaType.CAROUSEL]: 'Carousel',
};

const MAX_CAPTION = 2200;
const MAX_CAROUSEL_ITEMS = 10;

function buildIso(date: Date, hour: number, minute: number): string {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function isVideo(mimeType: string) {
  return mimeType.startsWith('video/');
}

// ── Selected media item ────────────────────────────────────────────────────────

interface SelectedMedia {
  readonly url: string;
  readonly thumbnail_url?: string;
  readonly name: string;
  readonly mime_type: string;
}

interface MediaThumbProps {
  readonly item: SelectedMedia;
  readonly onRemove: () => void;
}

function MediaThumb({ item, onRemove }: MediaThumbProps) {
  const preview = item.thumbnail_url ?? item.url;
  const isVid = isVideo(item.mime_type);

  return (
    <div className='relative group rounded-lg overflow-hidden border border-border bg-muted aspect-square'>
      {isVid ? (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-1 bg-muted'>
          <span className='text-2xl'>🎬</span>
          <span className='text-[10px] text-muted-foreground truncate px-1 max-w-full'>
            {item.name}
          </span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt={item.name}
          className='w-full h-full object-cover'
        />
      )}
      <button
        type='button'
        onClick={onRemove}
        className='absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive'
      >
        <X className='h-3 w-3' />
      </button>
    </div>
  );
}

// ── Media selector section ─────────────────────────────────────────────────────

interface MediaSelectorProps {
  readonly mediaType: string;
  readonly selected: SelectedMedia[];
  readonly onChange: (items: SelectedMedia[]) => void;
}

function MediaSelector({ mediaType, selected, onChange }: MediaSelectorProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  const isCarousel = mediaType === ScheduledPostMediaType.CAROUSEL;
  const canAddMore = isCarousel
    ? selected.length < MAX_CAROUSEL_ITEMS
    : selected.length === 0;
  const accept =
    mediaType === ScheduledPostMediaType.VIDEO ||
    mediaType === ScheduledPostMediaType.REEL
      ? 'video/*,image/*'
      : 'image/*,video/*';

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setUploadProgress(0);
      try {
        const res = await MediaApi.upload(file, { name: file.name }, p =>
          setUploadProgress(p)
        );
        const media = res.data;
        const item: SelectedMedia = {
          url: media.url,
          thumbnail_url: media.thumbnail_url,
          name: media.name,
          mime_type: media.mime_type,
        };
        onChange(isCarousel ? [...selected, item] : [item]);
      } catch (err) {
        const apiErr = parseApiError(err);
        toast({
          title: apiErr.title,
          description: apiErr.message,
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [isCarousel, onChange, selected, toast]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (!canAddMore) return;
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [canAddMore, uploadFile]
  );

  const handleLibraryPick = (media: Media) => {
    const item: SelectedMedia = {
      url: media.url,
      thumbnail_url: media.thumbnail_url,
      name: media.name,
      mime_type: media.mime_type,
    };
    onChange(isCarousel ? [...selected, item] : [item]);
  };

  const removeItem = (idx: number) => {
    onChange(selected.filter((_, i) => i !== idx));
  };

  return (
    <div className='space-y-2'>
      {/* Selected media grid */}
      {selected.length > 0 && (
        <div
          className={cn(
            'grid gap-2',
            isCarousel ? 'grid-cols-4' : 'grid-cols-2'
          )}
        >
          {selected.map((item, i) => (
            <MediaThumb
              key={item.url + i}
              item={item}
              onRemove={() => removeItem(i)}
            />
          ))}
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className='space-y-1'>
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span className='flex items-center gap-1.5'>
              <Loader2 className='h-3 w-3 animate-spin' />
              Uploading…
            </span>
            <span>{uploadProgress}%</span>
          </div>
          <div className='h-1.5 w-full rounded-full bg-muted overflow-hidden'>
            <div
              className='h-full rounded-full bg-primary transition-all duration-100'
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Drop zone + action buttons — shown when can add more */}
      {canAddMore && !uploading && (
        <div
          onDragOver={e => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'rounded-lg border-2 border-dashed transition-colors p-4',
            dragging
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/20'
          )}
        >
          <div className='flex flex-col items-center gap-3 text-center'>
            <ImagePlus className='h-8 w-8 text-muted-foreground/60' />
            <div className='text-xs text-muted-foreground'>
              <span>Drag & drop here, or</span>
            </div>
            <div className='flex gap-2'>
              <Button
                type='button'
                size='sm'
                variant='outline'
                className='gap-1.5 h-7 text-xs'
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className='h-3.5 w-3.5' />
                Upload
              </Button>
              <Button
                type='button'
                size='sm'
                variant='outline'
                className='gap-1.5 h-7 text-xs'
                onClick={() => setPickerOpen(true)}
              >
                <FolderOpen className='h-3.5 w-3.5' />
                From Library
              </Button>
            </div>
            {isCarousel && selected.length > 0 && (
              <p className='text-[10px] text-muted-foreground'>
                {selected.length}/{MAX_CAROUSEL_ITEMS} images added
              </p>
            )}
          </div>
        </div>
      )}

      {/* "Add more" button for carousel when zone is hidden */}
      {isCarousel && selected.length > 0 && !canAddMore && (
        <p className='text-xs text-muted-foreground text-center'>
          Maximum {MAX_CAROUSEL_ITEMS} images reached
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        accept={accept}
        className='hidden'
        onChange={handleFileChange}
      />

      {/* Library picker dialog */}
      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleLibraryPick}
      />
    </div>
  );
}

// ── Time select ────────────────────────────────────────────────────────────────

interface TimeSelectProps {
  readonly hour: number;
  readonly minute: number;
  readonly onChange: (hour: number, minute: number) => void;
}

function TimeSelect({ hour, minute, onChange }: TimeSelectProps) {
  return (
    <div className='flex items-center gap-2'>
      <select
        className='rounded-md border border-input bg-background px-2 py-1.5 text-sm'
        value={hour}
        onChange={e => onChange(Number(e.target.value), minute)}
      >
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i}>
            {String(i).padStart(2, '0')}
          </option>
        ))}
      </select>
      <span className='text-muted-foreground'>:</span>
      <select
        className='rounded-md border border-input bg-background px-2 py-1.5 text-sm'
        value={minute}
        onChange={e => onChange(hour, Number(e.target.value))}
      >
        {[0, 15, 30, 45].map(m => (
          <option key={m} value={m}>
            {String(m).padStart(2, '0')}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Hashtag input ──────────────────────────────────────────────────────────────

interface HashtagInputProps {
  readonly tags: string[];
  readonly onChange: (tags: string[]) => void;
}

function HashtagInput({ tags, onChange }: HashtagInputProps) {
  const [input, setInput] = useState('');

  const addTag = useCallback(() => {
    const raw = input.trim().replace(/^#/, '');
    if (raw && !tags.includes(raw)) {
      onChange([...tags, raw]);
    }
    setInput('');
  }, [input, tags, onChange]);

  return (
    <div className='space-y-2'>
      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <Hash className='absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground' />
          <input
            className='w-full rounded-md border border-input bg-background pl-7 pr-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'
            placeholder='Add hashtag'
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                addTag();
              }
            }}
          />
        </div>
        <Button type='button' size='sm' variant='outline' onClick={addTag}>
          Add
        </Button>
      </div>
      {tags.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {tags.map(tag => (
            <span
              key={tag}
              className='inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'
            >
              #{tag}
              <button
                type='button'
                onClick={() => onChange(tags.filter(t => t !== tag))}
                className='hover:text-destructive transition-colors'
              >
                <X className='h-3 w-3' />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Best time quick-pick ───────────────────────────────────────────────────────

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

interface BestTimePickProps {
  readonly onPick: (rec: BestTimeRecommendation) => void;
}

function BestTimePick({ onPick }: BestTimePickProps) {
  const { data, isLoading } = useBestTimes();
  const top3 = data?.slice(0, 3) ?? [];

  if (isLoading) return <Skeleton className='h-8 w-full' />;
  if (!top3.length) return null;

  return (
    <div className='flex flex-wrap gap-1.5'>
      <span className='text-xs text-muted-foreground self-center'>
        Best times:
      </span>
      {top3.map(rec => (
        <button
          key={`${rec.day_of_week}-${rec.hour_utc}`}
          type='button'
          onClick={() => onPick(rec)}
          className='inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/15 transition-colors'
        >
          {DAY_NAMES[rec.day_of_week]} {rec.hour_utc}:00 UTC
        </button>
      ))}
    </div>
  );
}

// ── Main modal ─────────────────────────────────────────────────────────────────

export interface SchedulePostModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly defaultDate?: Date;
  readonly onSuccess?: () => void;
  /** Pass an existing post to enter edit mode */
  readonly editPost?: ScheduledPost;
}

export function SchedulePostModal({
  open,
  onClose,
  defaultDate,
  onSuccess,
  editPost,
}: SchedulePostModalProps) {
  const { toast } = useToast();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const isEditing = !!editPost;

  const initDate = editPost
    ? new Date(editPost.scheduled_at)
    : (defaultDate ?? new Date());

  const [mediaType, setMediaType] = useState<string>(
    editPost?.media_type ?? ScheduledPostMediaType.IMAGE
  );
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>(
    editPost?.media_urls.map(url => ({
      url,
      name: '',
      mime_type: 'image/jpeg',
    })) ?? []
  );
  const [caption, setCaption] = useState(editPost?.caption ?? '');
  const [hashtags, setHashtags] = useState<string[]>(editPost?.hashtags ?? []);
  const [date, setDate] = useState<Date>(initDate);
  const [hour, setHour] = useState(initDate.getUTCHours());
  const [minute, setMinute] = useState(initDate.getUTCMinutes());
  const [calOpen, setCalOpen] = useState(false);

  const handleBestTimePick = useCallback((rec: BestTimeRecommendation) => {
    const today = new Date();
    const diff = (rec.day_of_week - today.getDay() + 7) % 7 || 7;
    const target = new Date(today);
    target.setDate(today.getDate() + diff);
    setDate(target);
    setHour(rec.hour_utc);
    setMinute(0);
  }, []);

  const canSubmit = caption.trim().length > 0 && selectedMedia.length > 0;

  const resetForm = () => {
    setCaption('');
    setSelectedMedia([]);
    setHashtags([]);
    setMediaType(ScheduledPostMediaType.IMAGE);
  };

  const isPending = createPost.isPending || updatePost.isPending;

  const submitPost = async (asDraft: boolean) => {
    if (!caption.trim()) return;
    if (!asDraft && !canSubmit) return;

    try {
      if (isEditing) {
        await updatePost.mutateAsync({
          id: editPost.id,
          dto: {
            caption: caption.trim(),
            media_urls: selectedMedia.map(m => m.url),
            hashtags: hashtags.length > 0 ? hashtags : undefined,
            scheduled_at: buildIso(date, hour, minute),
          },
        });
        toast({ title: 'Post updated' });
      } else {
        await createPost.mutateAsync({
          media_type:
            mediaType as (typeof ScheduledPostMediaType)[keyof typeof ScheduledPostMediaType],
          caption: caption.trim(),
          media_urls: selectedMedia.map(m => m.url),
          hashtags: hashtags.length > 0 ? hashtags : undefined,
          scheduled_at: buildIso(date, hour, minute),
          save_as_draft: asDraft,
        });
        toast({
          title: asDraft ? 'Draft saved' : 'Post scheduled',
          description: asDraft
            ? 'Your draft has been saved.'
            : `Scheduled for ${format(date, 'MMM d')} at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} UTC`,
        });
      }
      onSuccess?.();
      onClose();
      resetForm();
    } catch (err) {
      const apiErr = parseApiError(err);
      toast({
        title: apiErr.title,
        description: apiErr.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className='max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Post' : 'Schedule a Post'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault();
            submitPost(false);
          }}
          className='space-y-4 pt-1'
        >
          {/* Post type */}
          <div className='space-y-1.5'>
            <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
              Post Type
            </label>
            <div className='flex flex-wrap gap-2'>
              {Object.entries(MEDIA_TYPE_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  type='button'
                  onClick={() => {
                    setMediaType(val);
                    // Reset media if switching between single/carousel
                    if (
                      val !== ScheduledPostMediaType.CAROUSEL &&
                      selectedMedia.length > 1
                    ) {
                      setSelectedMedia(selectedMedia.slice(0, 1));
                    }
                  }}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                    mediaType === val
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Media */}
          <div className='space-y-1.5'>
            <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
              Media
              {mediaType === ScheduledPostMediaType.CAROUSEL && (
                <span className='ml-1 normal-case font-normal'>
                  (up to {MAX_CAROUSEL_ITEMS} images)
                </span>
              )}
            </label>
            <MediaSelector
              mediaType={mediaType}
              selected={selectedMedia}
              onChange={setSelectedMedia}
            />
          </div>

          {/* Caption */}
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                Caption
              </label>
              <span
                className={cn(
                  'text-xs',
                  caption.length > MAX_CAPTION * 0.9
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                )}
              >
                {caption.length}/{MAX_CAPTION}
              </span>
            </div>
            <textarea
              className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none'
              rows={4}
              maxLength={MAX_CAPTION}
              placeholder='Write your caption…'
              value={caption}
              onChange={e => setCaption(e.target.value)}
            />
          </div>

          {/* Hashtags */}
          <div className='space-y-1.5'>
            <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
              Hashtags
            </label>
            <HashtagInput tags={hashtags} onChange={setHashtags} />
          </div>

          {/* Date + time */}
          <div className='space-y-1.5'>
            <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
              Schedule Date & Time (UTC)
            </label>

            <BestTimePick onPick={handleBestTimePick} />

            <div className='flex flex-wrap items-center gap-3 mt-1'>
              <Popover open={calOpen} onOpenChange={setCalOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='gap-2'
                  >
                    <CalendarIcon className='h-4 w-4' />
                    {format(date, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <DayPicker
                    mode='single'
                    selected={date}
                    onSelect={d => {
                      if (d) {
                        setDate(d);
                        setCalOpen(false);
                      }
                    }}
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>

              <TimeSelect
                hour={hour}
                minute={minute}
                onChange={(h, m) => {
                  setHour(h);
                  setMinute(m);
                }}
              />
            </div>
          </div>

          <DialogFooter className='flex-col sm:flex-row gap-2 pt-2'>
            {!isEditing && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => submitPost(true)}
                disabled={isPending || !caption.trim()}
              >
                Save as Draft
              </Button>
            )}
            <Button
              type='submit'
              size='sm'
              disabled={isPending || !canSubmit}
              className='bg-primary text-white hover:bg-primary/90'
            >
              {isPending && <Loader2 className='h-4 w-4 animate-spin mr-2' />}
              {isEditing ? 'Update Post' : 'Schedule Post'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
