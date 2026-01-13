'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  ImageIcon,
  Film,
  Images,
  Calendar,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Media } from '@/lib/api/media';
import { InstagramMediaApi } from '@/lib/api/instagram/media';
import { useToast } from '@/components/ui/use-toast';

interface MediaSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  initialMedia?: Media[];
  onSelect: (media: Media[]) => void;
  socialAccountId?: string;
}

export function MediaSelectorModal({
  open,
  onOpenChange,
  selectedIds,
  initialMedia = [],
  onSelect,
  socialAccountId,
}: MediaSelectorModalProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [localSelection, setLocalSelection] = useState<string[]>(selectedIds);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { toast } = useToast();

  const loadMedia = async (cursor?: string) => {
    if (!socialAccountId) return;

    const isInitialLoad = !cursor;
    if (isInitialLoad) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await InstagramMediaApi.getMediaList({
        social_account_id: socialAccountId,
        after: cursor,
        limit: 24, // Matches grid layout
      });

      const instagramMedia = response.data.data || [];
      const paging = response.data.paging;

      const mappedMedia: Media[] = instagramMedia.map(item => ({
        id: item.id,
        name: item.caption || 'Instagram Media',
        url: item.media_url || item.permalink || '',
        thumbnail_url: item.thumbnail_url || item.media_url,
        mime_type:
          item.media_type === 'VIDEO' || item.media_type === 'REELS'
            ? 'video/mp4'
            : 'image/jpeg',
        size: 0,
        description: item.caption,
        created_at: item.timestamp,
        updated_at: item.timestamp,
      }));

      if (isInitialLoad) {
        setMediaList(mappedMedia);
      } else {
        setMediaList(prev => [...prev, ...mappedMedia]);
      }

      setNextCursor(paging?.cursors?.after || null);
    } catch (error) {
      console.error('Failed to fetch media:', error);
      toast({
        title: 'Error',
        description: 'Failed to load media. Please try again.',
        variant: 'destructive',
      });
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    if (open && socialAccountId) {
      loadMedia();
    } else {
      setMediaList([]);
      setNextCursor(null);
    }
  }, [open, socialAccountId]);

  // Update local selection when prop changes
  useEffect(() => {
    setLocalSelection(selectedIds);
  }, [selectedIds]);

  const filteredMedia = mediaList.filter(media => {
    if (filter === 'all') return true;
    if (filter === 'image') return media.mime_type.startsWith('image/');
    if (filter === 'video') return media.mime_type.startsWith('video/');
    return true;
  });

  const toggleSelection = (id: string) => {
    if (localSelection.includes(id)) {
      setLocalSelection(localSelection.filter(i => i !== id));
    } else {
      setLocalSelection([...localSelection, id]);
    }
  };

  const handleConfirm = () => {
    // Combine mediaList and initialMedia to find all selected objects
    const allKnownMedia = [...initialMedia, ...mediaList];
    // Deduplicate by ID
    const uniqueMedia = Array.from(
      new Map(allKnownMedia.map(m => [m.id, m])).values()
    );

    const selectedMedia = uniqueMedia.filter(media =>
      localSelection.includes(media.id)
    );
    onSelect(selectedMedia);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl'>
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>

        <div className='flex items-center gap-4 py-4'>
          <div className='relative flex-1'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search by caption...'
              className='pl-9'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className='flex gap-2'>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'image' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setFilter('image')}
            >
              <ImageIcon className='mr-2 h-4 w-4' />
              Images
            </Button>
            <Button
              variant={filter === 'video' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setFilter('video')}
            >
              <Film className='mr-2 h-4 w-4' />
              Videos
            </Button>
          </div>
        </div>

        <div className='max-h-[60vh] overflow-y-auto p-1'>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4'>
            {isLoading ? (
              <div className='col-span-full flex h-40 items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className='col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground'>
                <Images className='mb-4 h-12 w-12 opacity-50' />
                <p>No media found</p>
              </div>
            ) : (
              filteredMedia.map(media => (
                <div
                  key={media.id}
                  className={cn(
                    'group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all hover:border-primary',
                    localSelection.includes(media.id)
                      ? 'border-primary'
                      : 'border-transparent'
                  )}
                  onClick={() => toggleSelection(media.id)}
                >
                  <div className='aspect-square w-full overflow-hidden bg-muted'>
                    <img
                      src={media.thumbnail_url || media.url}
                      alt={media.alt_text || 'Media'}
                      className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                  </div>

                  {localSelection.includes(media.id) && (
                    <div className='absolute right-2 top-2 z-10 rounded-full bg-primary p-1 shadow-sm'>
                      <Check className='h-3 w-3 text-white' />
                    </div>
                  )}

                  <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8 text-white opacity-0 transition-opacity group-hover:opacity-100'>
                    <p className='line-clamp-2 text-xs'>
                      {media.description || media.name}
                    </p>
                    <div className='mt-2 flex items-center gap-3 text-[10px] opacity-90'>
                      <span className='flex items-center gap-1'>
                        <Calendar className='h-3 w-3' />
                        {new Date(media.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className='absolute left-2 top-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm'>
                    {media.mime_type.startsWith('video') ? 'VIDEO' : 'IMAGE'}
                  </div>
                </div>
              ))
            )}
          </div>
          {nextCursor && !isLoading && (
            <div className='mt-4 flex justify-center py-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => loadMedia(nextCursor)}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className='flex w-full items-center justify-between'>
            <div className='text-sm text-muted-foreground'>
              {localSelection.length} selected
            </div>
            <div className='flex gap-2'>
              <Button variant='outline' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>Confirm Selection</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
