'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Play,
  MoreHorizontal,
  Instagram,
  MessageCircle,
  ArrowUpDown,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  automationsApi,
  Automation,
  AutomationListParams,
} from '@/lib/api/automations';
import {
  AutomationStatus,
  AutomationTriggerType,
  AutomationActionType,
} from '@/lib/constants/automations';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from '@/hooks/use-toast';

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  useEffect(() => {
    fetchAutomations();
  }, [debouncedSearchQuery, statusFilter]);

  const fetchAutomations = async () => {
    setIsLoading(true);
    try {
      const params: AutomationListParams = {};
      if (debouncedSearchQuery) params.search = debouncedSearchQuery;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await automationsApi.list(params);

      if (response && response.data) {
        setAutomations(response.data);
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load automations',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side sorting only since backend might not support all sort options yet
  // or we want to sort the current page results
  const filteredAutomations = (automations ?? []).sort((a, b) => {
    if (sortBy === 'recent')
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    if (sortBy === 'executions')
      return (b.execution_count || 0) - (a.execution_count || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus =
      currentStatus === AutomationStatus.ACTIVE
        ? AutomationStatus.INACTIVE
        : AutomationStatus.ACTIVE;

    // Optimistic update
    setAutomations(prev =>
      prev.map(a =>
        a.id === id ? { ...a, status: newStatus as Automation['status'] } : a
      )
    );

    try {
      await automationsApi.update(id, { status: newStatus });
      toast({
        title: 'Status updated',
        description: `Automation ${newStatus === AutomationStatus.ACTIVE ? 'activated' : 'deactivated'}`,
      });
    } catch {
      // Revert on failure
      setAutomations(prev =>
        prev.map(a =>
          a.id === id
            ? { ...a, status: currentStatus as Automation['status'] }
            : a
        )
      );
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update automation status',
      });
    }
  };

  const activeCount = automations.filter(
    a => a.status === AutomationStatus.ACTIVE
  ).length;
  const totalExecutions = automations.reduce(
    (sum, a) => sum + (a.execution_count || 0),
    0
  );

  function getTriggerTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      [AutomationTriggerType.NEW_COMMENT]: 'New Comment',
      [AutomationTriggerType.MENTION]: 'Mention',
      [AutomationTriggerType.NEW_FOLLOWER]: 'New Follower',
      [AutomationTriggerType.DM_RECEIVED]: 'Direct Message',
      [AutomationTriggerType.STORY_REPLY]: 'Story Reply',
    };
    return (
      labels[type] ||
      type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  }

  function getActionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      [AutomationActionType.REPLY_COMMENT]: 'Reply',
      [AutomationActionType.SEND_DM]: 'Send DM',
      [AutomationActionType.LIKE_CONTENT]: 'Like Comment',
      [AutomationActionType.ADD_TAG]: 'Add Tag',
      [AutomationActionType.PRIVATE_REPLY]: 'Private Reply',
      [AutomationActionType.NOTIFY_ADMIN]: 'Notify Admin',
    };
    return (
      labels[type] ||
      type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  }

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='p-6 border-b border-border'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold mb-1'>Automations</h1>
            <p className='text-muted-foreground'>
              Create and manage your Instagram automations
            </p>
          </div>
          <Button asChild>
            <Link href='/dashboard/automations/new'>
              <Plus className='h-4 w-4 mr-2' />
              New Automation
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-3 gap-4 mb-6'>
          <Card className='bg-card/50'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Total Automations
                  </p>
                  <p className='text-2xl font-bold mt-1'>
                    {automations.length}
                  </p>
                </div>
                <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center'>
                  <Zap className='h-5 w-5 text-primary' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card/50'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Active
                  </p>
                  <p className='text-2xl font-bold mt-1 text-emerald-500'>
                    {activeCount}
                  </p>
                </div>
                <div className='w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center'>
                  <Play className='h-5 w-5 text-emerald-500' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card/50'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Total Executions
                  </p>
                  <p className='text-2xl font-bold mt-1'>
                    {totalExecutions.toLocaleString()}
                  </p>
                </div>
                <div className='w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center'>
                  <MessageCircle className='h-5 w-5 text-blue-500' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className='flex items-center gap-3'>
          <div className='relative flex-1 max-w-sm'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Search automations...'
              className='pl-9 bg-background/50'
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-32 bg-background/50'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value={AutomationStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={AutomationStatus.INACTIVE}>
                Inactive
              </SelectItem>
              <SelectItem value={AutomationStatus.DRAFT}>Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className='w-36 bg-background/50'>
              <ArrowUpDown className='h-4 w-4 mr-2' />
              <SelectValue placeholder='Sort by' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='recent'>Most Recent</SelectItem>
              <SelectItem value='executions'>Most Executions</SelectItem>
              <SelectItem value='name'>Name A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Automations List */}
      <div className='flex-1 overflow-y-auto p-6'>
        {isLoading ? (
          <div className='flex justify-center items-center h-40'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          </div>
        ) : filteredAutomations.length > 0 ? (
          <div className='space-y-3'>
            {filteredAutomations.map(automation => {
              const isActive = automation.status === AutomationStatus.ACTIVE;
              const successRate =
                (automation.execution_count || 0) > 0
                  ? Math.round(
                      ((automation.success_count || 0) /
                        (automation.execution_count || 0)) *
                        100
                    )
                  : 0;

              return (
                <Card
                  key={automation.id}
                  className={cn(
                    'hover:border-primary/50 transition-all hover:translate-y-[-2px]',
                    !isActive && 'opacity-70'
                  )}
                >
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-4'>
                      {/* Status toggle */}
                      <Switch
                        checked={isActive}
                        onCheckedChange={() =>
                          toggleStatus(
                            automation.id,
                            automation.status || AutomationStatus.DRAFT
                          )
                        }
                        className='data-[state=checked]:bg-emerald-500'
                      />

                      {/* Main content */}
                      <Link
                        href={`/dashboard/automations/${automation.id}`}
                        className='flex-1 min-w-0'
                      >
                        <div className='flex items-center gap-3 mb-2'>
                          <h3 className='font-semibold truncate'>
                            {automation.name}
                          </h3>
                          <Badge
                            variant='secondary'
                            className={cn(
                              'shrink-0',
                              isActive
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : automation.status === AutomationStatus.DRAFT
                                  ? 'bg-muted text-muted-foreground'
                                  : 'bg-amber-500/10 text-amber-500'
                            )}
                          >
                            {automation.status === AutomationStatus.ACTIVE
                              ? 'Active'
                              : automation.status === AutomationStatus.DRAFT
                                ? 'Draft'
                                : 'Paused'}
                          </Badge>
                        </div>

                        {/* Flow summary */}
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <div className='flex items-center gap-1'>
                            <div className='w-5 h-5 rounded bg-linear-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center'>
                              <Instagram className='h-3 w-3 text-white' />
                            </div>
                          </div>
                          <span>
                            {getTriggerTypeLabel(
                              automation.trigger.trigger_type
                            )}
                          </span>
                          <span className='text-muted-foreground/50'>→</span>
                          <div className='flex items-center gap-1'>
                            {automation.actions.slice(0, 2).map(action => (
                              <Badge
                                key={action.id}
                                variant='outline'
                                className='text-xs'
                              >
                                {getActionTypeLabel(action.action_type)}
                              </Badge>
                            ))}
                            {automation.actions.length > 2 && (
                              <Badge variant='outline' className='text-xs'>
                                +{automation.actions.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Stats */}
                      <div className='flex items-center gap-6 shrink-0'>
                        <div className='text-right'>
                          <p className='text-sm font-semibold'>
                            {(automation.execution_count || 0).toLocaleString()}
                          </p>
                          {/* Trend is missing in backend for now, hiding it or using placeholder if needed. 
                              User didn't ask for trend, so keeping it simple. */}
                          <p className='text-xs text-muted-foreground'>
                            executions
                          </p>
                        </div>

                        <div className='text-right'>
                          <p
                            className={cn(
                              'text-sm font-semibold',
                              successRate >= 90
                                ? 'text-emerald-500'
                                : successRate >= 70
                                  ? 'text-amber-500'
                                  : 'text-red-500'
                            )}
                          >
                            {successRate}%
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            success
                          </p>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-8 w-8 p-0'
                            >
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/automations/${automation.id}`}
                              >
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className='text-destructive'>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center h-64 text-center'>
            <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4'>
              <Zap className='h-8 w-8 text-muted-foreground' />
            </div>
            <h3 className='font-semibold mb-2'>No automations found</h3>
            <p className='text-sm text-muted-foreground mb-4'>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first automation to get started'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button asChild>
                <Link href='/dashboard/automations/new'>
                  <Plus className='h-4 w-4 mr-2' />
                  Create Automation
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
