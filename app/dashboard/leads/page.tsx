'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/hooks/use-toast';
import { leadsApi, LeadsListParams } from '@/lib/api/leads';
import { Lead } from '@/lib/types/leads';
import { LeadTable } from '@/components/leads/lead-table';
import { LeadExportDialog } from '@/components/leads/lead-export-dialog';

const PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'Twitter'];

export default function LeadsPage() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchLeads = useCallback(
    async (isLoadMore = false) => {
      if (!isLoadMore) {
        setIsLoading(true);
        setPage(1);
      }

      try {
        const params: LeadsListParams = {
          page: isLoadMore ? page + 1 : 1,
          limit: 50,
        };

        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        if (selectedPlatform !== 'all') {
          params.platform = selectedPlatform;
        }

        if (selectedTags.length > 0) {
          params.tags = selectedTags;
        }

        const response = await leadsApi.getLeads(params);

        if (response && Array.isArray(response.data)) {
          if (isLoadMore) {
            setLeads(prev => [...prev, ...response.data]);
          } else {
            setLeads(response.data);
          }
          setHasMore(response.data.length === 50);
          if (isLoadMore) {
            setPage(p => p + 1);
          }
        }
      } catch (_error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load leads',
        });
      } finally {
        if (!isLoadMore) {
          setIsLoading(false);
        }
      }
    },
    [debouncedSearch, selectedPlatform, selectedTags, page, toast]
  );

  useEffect(() => {
    fetchLeads(false);
  }, [debouncedSearch, selectedPlatform, selectedTags]);

  const handleTagsChange = (leadId: string, newTags: string[]) => {
    setLeads(prev =>
      prev.map(lead =>
        lead._id === leadId ? { ...lead, tags: newTags } : lead
      )
    );
  };

  const getAllTags = () => {
    const tagSet = new Set<string>();
    leads.forEach(lead => {
      lead.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='p-6 border-b border-border'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold mb-1'>Leads</h1>
            <p className='text-muted-foreground'>
              Manage and export your captured leads
            </p>
          </div>
          <LeadExportDialog
            disabled={leads.length === 0}
            filters={{
              search: debouncedSearch,
              platform:
                selectedPlatform !== 'all' ? selectedPlatform : undefined,
              tags: selectedTags.length > 0 ? selectedTags : undefined,
            }}
          />
        </div>

        {/* Filters */}
        <div className='flex flex-col sm:flex-row gap-3 items-start sm:items-center'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search leads by name or username...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='pl-9 bg-background/50'
            />
          </div>

          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className='w-full sm:w-40 bg-background/50'>
              <SelectValue placeholder='All Platforms' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Platforms</SelectItem>
              {PLATFORMS.map(platform => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {getAllTags().length > 0 && (
            <Select
              value={selectedTags.length > 0 ? 'selected' : 'all'}
              onValueChange={val => {
                if (val === 'all') {
                  setSelectedTags([]);
                }
              }}
            >
              <SelectTrigger className='w-full sm:w-40 bg-background/50'>
                <Filter className='h-4 w-4' />
                <SelectValue placeholder='Filter Tags' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Tags</SelectItem>
                {getAllTags().map(tag => (
                  <SelectItem key={tag} value={tag}>
                    <button
                      onClick={e => {
                        e.preventDefault();
                        setSelectedTags(prev =>
                          prev.includes(tag)
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                    >
                      {selectedTags.includes(tag) ? '✓ ' : ''}
                      {tag}
                    </button>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-6'>
        {isLoading ? (
          <div className='flex justify-center items-center h-40'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        ) : leads.length > 0 ? (
          <div className='space-y-6'>
            <LeadTable
              leads={leads}
              isLoading={isLoading}
              onTagsChange={handleTagsChange}
            />

            {hasMore && (
              <div className='flex justify-center'>
                <Button
                  variant='outline'
                  onClick={() => fetchLeads(true)}
                  className='w-full sm:w-auto'
                >
                  Load More Leads
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-64 text-center'>
            <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4'>
              <Search className='h-8 w-8 text-muted-foreground' />
            </div>
            <h3 className='font-semibold mb-2'>No leads found</h3>
            <p className='text-sm text-muted-foreground'>
              {searchQuery ||
              selectedPlatform !== 'all' ||
              selectedTags.length > 0
                ? 'Try adjusting your filters'
                : 'No leads captured yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
