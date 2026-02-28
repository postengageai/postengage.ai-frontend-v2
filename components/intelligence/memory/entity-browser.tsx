'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RelationshipStageBadge } from './relationship-stage';
import { MemoryApi } from '@/lib/api/memory';
import type {
  UserRelationshipMemory,
  RelationshipStage,
  MemoryUsersParams,
} from '@/lib/types/memory';
import type { PaginationMeta } from '@/lib/http/client';
import { useToast } from '@/hooks/use-toast';

interface EntityBrowserProps {
  botId: string;
  onSelectUser: (user: UserRelationshipMemory) => void;
}

const STAGES: RelationshipStage[] = [
  'new',
  'engaged',
  'loyal',
  'at_risk',
  'churned',
];

export function EntityBrowser({ botId, onSelectUser }: EntityBrowserProps) {
  const [users, setUsers] = useState<UserRelationshipMemory[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<RelationshipStage | 'all'>(
    'all'
  );
  const [sortBy, setSortBy] =
    useState<MemoryUsersParams['sort_by']>('last_interaction');
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: MemoryUsersParams = {
        page,
        limit: 20,
        sort_by: sortBy,
        sort_order: 'desc',
      };
      if (stageFilter !== 'all') params.stage = stageFilter;
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await MemoryApi.getTrackedUsers(botId, params);
      if (response?.data) {
        setUsers(response.data);
        setPagination(response.pagination);
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load tracked users',
      });
    } finally {
      setIsLoading(false);
    }
  }, [botId, page, stageFilter, sortBy, debouncedSearch, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = pagination?.total_pages || 1;

  return (
    <div className='space-y-4'>
      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Search by username or entity...'
            className='pl-9'
          />
        </div>
        <div className='flex gap-2'>
          <Select
            value={stageFilter}
            onValueChange={v => {
              setStageFilter(v as RelationshipStage | 'all');
              setPage(1);
            }}
          >
            <SelectTrigger className='w-[140px]'>
              <SlidersHorizontal className='h-4 w-4 mr-2' />
              <SelectValue placeholder='Stage' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Stages</SelectItem>
              {STAGES.map(s => (
                <SelectItem key={s} value={s} className='capitalize'>
                  {s.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={v => {
              setSortBy(v as MemoryUsersParams['sort_by']);
              setPage(1);
            }}
          >
            <SelectTrigger className='w-[170px]'>
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='last_interaction'>Last Interaction</SelectItem>
              <SelectItem value='total_interactions'>
                Total Interactions
              </SelectItem>
              <SelectItem value='entity_count'>Entity Count</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stage filter chips */}
      <div className='flex gap-2 flex-wrap'>
        {STAGES.map(stage => (
          <button
            key={stage}
            onClick={() => {
              setStageFilter(stageFilter === stage ? 'all' : stage);
              setPage(1);
            }}
            className={`transition-opacity ${
              stageFilter !== 'all' && stageFilter !== stage
                ? 'opacity-40'
                : 'opacity-100'
            }`}
          >
            <RelationshipStageBadge stage={stage} />
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className='space-y-3'>
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className='h-16 w-full rounded-lg' />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/10'>
          <Users className='h-10 w-10 text-muted-foreground mb-3' />
          <h3 className='text-lg font-medium mb-1'>No Users Found</h3>
          <p className='text-sm text-muted-foreground max-w-sm'>
            {debouncedSearch || stageFilter !== 'all'
              ? 'Try adjusting your filters or search query.'
              : "This bot hasn't interacted with anyone yet. Memory will build up as the bot starts replying."}
          </p>
        </div>
      ) : (
        <div className='space-y-2'>
          {users.map(user => (
            <button
              key={user._id}
              onClick={() => onSelectUser(user)}
              className='w-full text-left p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group'
            >
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-3 min-w-0'>
                  <div className='h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0'>
                    <span className='text-sm font-medium text-primary'>
                      {(user.platform_username || user.platform_user_id)
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div className='min-w-0'>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium text-sm truncate'>
                        {user.platform_username || user.platform_user_id}
                      </span>
                      <RelationshipStageBadge stage={user.relationship_stage} />
                    </div>
                    <p className='text-xs text-muted-foreground truncate'>
                      {user.one_line_profile || 'No profile summary yet'}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-4 text-xs text-muted-foreground shrink-0'>
                  <div className='text-right hidden sm:block'>
                    <Badge variant='secondary' className='text-[10px]'>
                      {user.entities.length} entities
                    </Badge>
                  </div>
                  <div className='text-right hidden md:block'>
                    <span>{user.total_interactions} interactions</span>
                  </div>
                  <div className='text-right'>
                    <span>
                      {new Date(user.last_interaction_at).toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric' }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between pt-2'>
          <p className='text-xs text-muted-foreground'>
            Page {page} of {totalPages}
            {pagination?.total ? ` (${pagination.total} users)` : ''}
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
