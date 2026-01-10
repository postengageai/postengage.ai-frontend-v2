'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Play,
  MoreHorizontal,
  Instagram,
  MessageCircle,
  TrendingUp,
  TrendingDown,
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
  mockAutomation,
  getTriggerTypeLabel,
  getActionTypeLabel,
} from '@/lib/mock/automation-builder-data';
import type { AutomationBuilder } from '@/lib/types/automation-builder';

// Mock list of automations
const mockAutomations: AutomationBuilder[] = [
  mockAutomation,
  {
    ...mockAutomation,
    id: 'auto_def456',
    name: 'DM Price Inquiries',
    status: 'active',
    trigger: { ...mockAutomation.trigger, type: 'keyword_mention' },
    actions: [{ ...mockAutomation.actions[1], id: 'act_3' }],
    statistics: {
      ...mockAutomation.statistics,
      totalExecutions: 523,
      successfulExecutions: 498,
      failedExecutions: 25,
      trend: { executionsChange: -5.2, period: 'week' },
    },
  },
  {
    ...mockAutomation,
    id: 'auto_ghi789',
    name: 'Welcome New Followers',
    status: 'paused',
    pausedReason: 'Low credit balance',
    trigger: { ...mockAutomation.trigger, type: 'new_follower' },
    actions: [{ ...mockAutomation.actions[1], id: 'act_4' }],
    statistics: {
      ...mockAutomation.statistics,
      totalExecutions: 89,
      successfulExecutions: 87,
      failedExecutions: 2,
      trend: { executionsChange: 0, period: 'week' },
    },
  },
];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState(mockAutomations);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  const filteredAutomations = automations
    .filter(a => {
      const matchesSearch = a.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'recent')
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      if (sortBy === 'executions')
        return b.statistics.totalExecutions - a.statistics.totalExecutions;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const toggleStatus = (id: string) => {
    setAutomations(
      automations.map(a =>
        a.id === id
          ? {
              ...a,
              status: a.status === 'active' ? 'paused' : 'active',
              pausedReason:
                a.status === 'active' ? 'Paused by user' : undefined,
            }
          : a
      )
    );
  };

  const activeCount = automations.filter(a => a.status === 'active').length;
  const totalExecutions = automations.reduce(
    (sum, a) => sum + a.statistics.totalExecutions,
    0
  );

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
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='paused'>Paused</SelectItem>
              <SelectItem value='draft'>Draft</SelectItem>
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
        {filteredAutomations.length > 0 ? (
          <div className='space-y-3'>
            {filteredAutomations.map(automation => {
              const isActive = automation.status === 'active';
              const trendIsPositive =
                automation.statistics.trend.executionsChange >= 0;
              const successRate =
                automation.statistics.totalExecutions > 0
                  ? Math.round(
                      (automation.statistics.successfulExecutions /
                        automation.statistics.totalExecutions) *
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
                        onCheckedChange={() => toggleStatus(automation.id)}
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
                                : automation.status === 'draft'
                                  ? 'bg-muted text-muted-foreground'
                                  : 'bg-amber-500/10 text-amber-500'
                            )}
                          >
                            {automation.status}
                          </Badge>
                        </div>

                        {/* Flow summary */}
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                          <div className='flex items-center gap-1'>
                            <div className='w-5 h-5 rounded bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center'>
                              <Instagram className='h-3 w-3 text-white' />
                            </div>
                          </div>
                          <span>
                            {getTriggerTypeLabel(automation.trigger.type)}
                          </span>
                          <span className='text-muted-foreground/50'>→</span>
                          <div className='flex items-center gap-1'>
                            {automation.actions.slice(0, 2).map(action => (
                              <Badge
                                key={action.id}
                                variant='outline'
                                className='text-xs'
                              >
                                {getActionTypeLabel(action.type)}
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
                            {automation.statistics.totalExecutions.toLocaleString()}
                          </p>
                          <div className='flex items-center gap-1 justify-end'>
                            {trendIsPositive ? (
                              <TrendingUp className='h-3 w-3 text-emerald-500' />
                            ) : (
                              <TrendingDown className='h-3 w-3 text-red-500' />
                            )}
                            <span
                              className={cn(
                                'text-xs',
                                trendIsPositive
                                  ? 'text-emerald-500'
                                  : 'text-red-500'
                              )}
                            >
                              {Math.abs(
                                automation.statistics.trend.executionsChange
                              )}
                              %
                            </span>
                          </div>
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

                    {/* Paused reason */}
                    {automation.pausedReason && !isActive && (
                      <p className='text-xs text-amber-500 mt-2 pl-14'>
                        {automation.pausedReason}
                      </p>
                    )}
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
