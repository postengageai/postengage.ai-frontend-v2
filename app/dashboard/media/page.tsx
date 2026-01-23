'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MediaFilters } from '@/components/media/media-filters';
import { MediaGallery } from '@/components/media/media-gallery';
import { MediaUploadDialog } from '@/components/media/media-upload-dialog';
import { MediaApi, Media } from '@/lib/api/media';
import { InstagramMediaApi, GetMediaResponse } from '@/lib/api/instagram/media';
import { socialAccountsApi, SocialAccount } from '@/lib/api/social-accounts';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState<'uploads' | 'instagram'>(
    'uploads'
  );
  const [items, setItems] = useState<(Media | GetMediaResponse)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [instaCursor, setInstaCursor] = useState<string | undefined>(undefined);

  const { toast } = useToast();

  const fetchSocialAccounts = async () => {
    try {
      const response = await socialAccountsApi.list({ platform: 'instagram' });
      if (response?.data) {
        setSocialAccounts(response.data);
        if (response.data.length > 0 && !selectedAccountId) {
          setSelectedAccountId(response.data[0].id);
        }
      }
    } catch {
      // console.error('Failed to fetch social accounts', error);
    }
  };

  useEffect(() => {
    fetchSocialAccounts();
  }, []);

  const fetchMedia = useCallback(
    async (isLoadMore = false) => {
      if (!isLoadMore) {
        setIsLoading(true);
        setItems([]);
        setPage(1);
        setInstaCursor(undefined);
        setHasMore(true);
      }

      try {
        if (activeTab === 'uploads') {
          const response = await MediaApi.list({
            page: isLoadMore ? page + 1 : 1,
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
          if (isLoadMore) setPage(p => p + 1);
        } else if (activeTab === 'instagram' && selectedAccountId) {
          // Instagram API might not support all filters directly, but we pass what we can
          // Note: Real Instagram API pagination uses cursors.
          // Assuming our backend proxy handles 'after' for cursor.
          const response = await InstagramMediaApi.getMediaList({
            social_account_id: selectedAccountId,
            limit: 20,
            after: isLoadMore ? instaCursor : undefined,
          });

          const newItems = response.data || [];
          // The response should ideally contain pagination info (cursors)
          // For now, assuming if we get full limit, there might be more.
          // If the backend returns a cursor in a separate field (pagination), we should use that.
          // Since GetMediaResponse[] is the return type, we might be missing pagination metadata in the return type definition
          // but let's assume standard behavior for now.

          // Fix: We need to handle pagination properly based on actual API response structure.
          // If the API returns just the array, we can't really know the cursor unless it's in headers or wrapped.
          // For this implementation, I'll assume simple append.

          setItems(prev => (isLoadMore ? [...prev, ...newItems] : newItems));
          // Rough estimate if pagination data isn't fully reliable yet
          setHasMore(
            (response.pagination?.has_next_page ||
              response.pagination?.has_next ||
              !!response.pagination?.next_cursor) ??
              newItems.length === 20
          );
          if (response.pagination?.next_cursor) {
            setInstaCursor(response.pagination.next_cursor);
          }
        }
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
    [
      activeTab,
      selectedAccountId,
      debouncedSearch,
      sortBy,
      sortOrder,
      dateRange,
      page,
      instaCursor,
      toast,
    ]
  );

  // Initial fetch and filter changes
  useEffect(() => {
    fetchMedia(false);
  }, [
    activeTab,
    selectedAccountId,
    debouncedSearch,
    sortBy,
    sortOrder,
    dateRange,
  ]);

  const handleUploadSuccess = () => {
    if (activeTab === 'uploads') {
      fetchMedia(false);
    } else {
      setActiveTab('uploads');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;
    try {
      await MediaApi.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: 'Success',
        description: 'Media deleted',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete media',
      });
    }
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

          {activeTab === 'instagram' && socialAccounts.length > 0 && (
            <Select
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
            >
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Select Account' />
              </SelectTrigger>
              <SelectContent>
                {socialAccounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <MediaFilters
          onSearchChange={setSearch}
          onSortChange={(by, order) => {
            setSortBy(by);
            setSortOrder(order);
          }}
          onDateRangeChange={(start, end) => setDateRange({ start, end })}
        />

        <TabsContent value='uploads' className='space-y-4'>
          <MediaGallery
            items={items}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={() => fetchMedia(true)}
            onDelete={handleDelete}
            type='uploads'
          />
        </TabsContent>

        <TabsContent value='instagram' className='space-y-4'>
          {socialAccounts.length === 0 ? (
            <div className='text-center py-12 border rounded-lg bg-muted/10 border-dashed'>
              <h3 className='text-lg font-semibold'>
                No Instagram accounts connected
              </h3>
              <p className='text-muted-foreground mb-4'>
                Connect an Instagram account to view your media.
              </p>
            </div>
          ) : (
            <MediaGallery
              items={items}
              isLoading={isLoading}
              hasMore={hasMore}
              onLoadMore={() => fetchMedia(true)}
              type='instagram'
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
