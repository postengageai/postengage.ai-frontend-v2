'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MediaGallery } from '@/components/media/media-gallery';
import { MediaUploadDialog } from '@/components/media/media-upload-dialog';
import { MediaFilters } from '@/components/media/media-filters';
import { MediaApi, Media } from '@/lib/api/media';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: Media) => void;
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: MediaPickerDialogProps) {
  const [items, setItems] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { toast } = useToast();

  const fetchMedia = useCallback(
    async (isLoadMore = false, currentPage = 1) => {
      if (!open) return;

      if (!isLoadMore) {
        setIsLoading(true);
        setItems([]);
        setPage(1);
        setHasMore(true);
      }

      try {
        const nextPage = isLoadMore ? currentPage + 1 : 1;
        const response = await MediaApi.list({
          page: nextPage,
          limit: 20,
          search: debouncedSearch,
          sort_by: sortBy,
          sort_order: sortOrder,
          start_date: dateRange.start?.toISOString(),
          end_date: dateRange.end?.toISOString(),
        });

        const newItems = response.data || [];
        setItems(prev => (isLoadMore ? [...prev, ...newItems] : newItems));
        setHasMore(newItems.length === 20);
        if (isLoadMore) setPage(nextPage);
      } catch {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load media',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [open, debouncedSearch, sortBy, sortOrder, dateRange, toast]
  );

  // Initial fetch and filter changes
  useEffect(() => {
    fetchMedia(false);
  }, [fetchMedia]);

  const handleUploadSuccess = () => {
    fetchMedia(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[85vh] flex flex-col'>
        <DialogHeader>
          <div className='flex items-center justify-between pr-8'>
            <DialogTitle>Select Media</DialogTitle>
            <MediaUploadDialog onUploadSuccess={handleUploadSuccess} />
          </div>
        </DialogHeader>

        <div className='flex-1 overflow-hidden flex flex-col gap-4'>
          <MediaFilters
            onSearchChange={setSearch}
            onSortChange={(by, order) => {
              setSortBy(by);
              setSortOrder(order);
            }}
            onDateRangeChange={(start, end) => setDateRange({ start, end })}
          />

          <div className='flex-1 overflow-y-auto min-h-[300px]'>
            <MediaGallery
              items={items}
              isLoading={isLoading}
              hasMore={hasMore}
              onLoadMore={() => fetchMedia(true, page)}
              onView={media => {
                onSelect(media);
                onOpenChange(false);
              }}
              type='uploads'
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
