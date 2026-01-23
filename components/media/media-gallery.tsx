'use client';

import { useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileImage, Film, MoreHorizontal, Trash, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Media } from '@/lib/api/media';
import { GetMediaResponse } from '@/lib/api/instagram/media';
import { format } from 'date-fns';

interface MediaGalleryProps {
  items: (Media | GetMediaResponse)[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (media: Media) => void;
  type: 'uploads' | 'instagram';
}

export function MediaGallery({
  items,
  isLoading,
  hasMore,
  onLoadMore,
  onDelete,
  onEdit,
  type,
}: MediaGalleryProps) {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore]
  );

  if (items.length === 0 && !isLoading) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-muted/10 border-dashed'>
        <FileImage className='h-10 w-10 text-muted-foreground mb-4' />
        <h3 className='text-lg font-semibold'>No media found</h3>
        <p className='text-sm text-muted-foreground'>
          {type === 'uploads'
            ? 'Upload some files to get started.'
            : 'No media found in your connected social accounts.'}
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
      {items.map((item, index) => {
        // Normalize item properties
        const isUpload = type === 'uploads';
        const uploadItem = item as Media;
        const instaItem = item as GetMediaResponse;

        const id = isUpload ? uploadItem.id : instaItem.id;
        const mediaUrl = isUpload
          ? uploadItem.url
          : instaItem.media_url || instaItem.thumbnail_url;
        const thumbnailUrl = isUpload
          ? uploadItem.thumbnail_url
          : instaItem.thumbnail_url;

        const name =
          (isUpload ? uploadItem.name : instaItem.caption) || 'Untitled';
        const date = isUpload ? uploadItem.created_at : instaItem.timestamp;
        const isVideo = isUpload
          ? uploadItem.mime_type.startsWith('video')
          : instaItem.media_type === 'VIDEO' ||
            instaItem.media_type === 'REELS';

        return (
          <Card
            key={id}
            ref={index === items.length - 1 ? lastElementRef : undefined}
            className='group relative overflow-hidden aspect-square border-0 bg-muted/20 cursor-pointer'
            onClick={() => isUpload && onEdit?.(uploadItem)}
          >
            {isVideo ? (
              thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbnailUrl}
                  alt={name}
                  className='h-full w-full object-cover transition-transform group-hover:scale-105'
                  loading='lazy'
                />
              ) : (
                <video
                  src={mediaUrl}
                  className='h-full w-full object-cover'
                  muted
                  preload='metadata'
                />
              )
            ) : mediaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl}
                alt={name}
                className='h-full w-full object-cover transition-transform group-hover:scale-105'
                loading='lazy'
              />
            ) : (
              <div className='flex h-full w-full items-center justify-center bg-muted'>
                <FileImage className='h-10 w-10 text-muted-foreground' />
              </div>
            )}

            <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3'>
              <div
                className='text-white text-sm font-medium truncate'
                title={name}
              >
                {name.length > 20 ? `${name.substring(0, 20)}...` : name}
              </div>
              <div className='text-white/80 text-xs'>
                {format(new Date(date), 'MMM d, yyyy')}
              </div>
            </div>

            {isVideo && (
              <div className='absolute top-2 right-2 bg-black/50 rounded-full p-1.5 text-white'>
                <Film className='h-3 w-3' />
              </div>
            )}

            {isUpload && (onDelete || onEdit) && (
              <div
                className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
                onClick={e => e.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-white hover:bg-white/20 hover:text-white'
                    >
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(uploadItem)}>
                        <Edit className='mr-2 h-4 w-4' />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        className='text-destructive focus:text-destructive'
                        onClick={() => onDelete(id)}
                      >
                        <Trash className='mr-2 h-4 w-4' />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </Card>
        );
      })}

      {isLoading &&
        Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className='aspect-square rounded-lg' />
        ))}
    </div>
  );
}
