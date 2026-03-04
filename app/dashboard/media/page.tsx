'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaGallery } from '@/components/media/media-gallery';
import { MediaUploadDialog } from '@/components/media/media-upload-dialog';
import { MediaEditDialog } from '@/components/media/media-edit-dialog';
import { MediaApi, Media } from '@/lib/api/media';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';

export default function MediaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'uploads' | 'instagram'>(
    'uploads'
  );
  const [items, setItems] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { toast } = useToast();

  const fetchMedia = useCallback(
    async (isLoadMore = false) => {
      if (!isLoadMore) {
        setIsLoading(true);
        setItems([]);
        setPage(1);
        setHasMore(true);
      }

      try {
        const response = await MediaApi.list({
          limit: 20,
          search: debouncedSearch,
          page: isLoadMore ? page + 1 : 1,
        });

        const newItems = response.data || [];
        setItems(prev => (isLoadMore ? [...prev, ...newItems] : newItems));
        setHasMore(newItems.length === 20);
        if (isLoadMore) setPage(p => p + 1);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch media',
        });
      } finally {
        if (!isLoadMore) {
          setIsLoading(false);
        }
      }
    },
    [debouncedSearch, page, toast]
  );

  useEffect(() => {
    fetchMedia();
  }, [debouncedSearch]);

  const handleUploadSuccess = () => {
    toast({
      title: 'Success',
      description: 'Media uploaded successfully',
    });
    // Refresh the media list
    fetchMedia();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      await MediaApi.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Success',
        description: 'Media deleted successfully',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete media',
      });
    }
  };

  const handleEdit = (media: Media) => {
    setEditingMedia(media);
  };

  const handleView = (media: Media) => {
    router.push(`/dashboard/media/view/${media.id}`);
  };

  const handleUpdate = (updatedMedia: Media) => {
    setItems(prev =>
      prev.map(item => (item.id === updatedMedia.id ? updatedMedia : item))
    );
  };

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <h1 className='text-3xl font-bold tracking-tight'>Media Library</h1>
        <MediaUploadDialog onUploadSuccess={handleUploadSuccess} />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={val => setActiveTab(val as 'uploads' | 'instagram')}
        className='space-y-6'
      >
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <TabsList>
            <TabsTrigger value='uploads'>My Uploads</TabsTrigger>
            <TabsTrigger value='instagram'>Instagram Media</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='uploads' className='space-y-4'>
          <MediaGallery
            items={items}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={() => fetchMedia(true)}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onView={handleView}
            type='uploads'
          />
        </TabsContent>

        <TabsContent value='instagram' className='space-y-4'>
          <div className='text-center py-12 border rounded-lg bg-muted/10 border-dashed'>
            <h3 className='text-lg font-semibold'>
              Instagram media integration coming soon
            </h3>
            <p className='text-muted-foreground mb-4'>
              We're working on direct Instagram media library integration.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <MediaEditDialog
        media={editingMedia}
        open={!!editingMedia}
        onOpenChange={open => !open && setEditingMedia(null)}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
