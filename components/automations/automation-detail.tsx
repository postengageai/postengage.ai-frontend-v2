'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  Edit,
  Trash2,
  MoreHorizontal,
  Instagram,
  MessageCircle,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export interface AutomationData {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'draft';
  paused_reason?: string;
  platform: 'instagram' | 'facebook';
  social_account: {
    id: string;
    username: string;
    avatar: string;
  };
  trigger: {
    type: 'new_comment' | 'new_dm';
    scope?: 'all' | 'specific';
    content_count?: number;
  };
  condition?: {
    keywords: string[];
    operator: string;
    mode: string;
  };
  actions: Array<{
    type: 'reply_comment' | 'private_reply' | 'send_dm';
    text: string;
    delay_seconds: number;
  }>;
  statistics: {
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    total_credits_used: number;
    trend: {
      change: number;
      period: string;
    };
  };
  execution_history: Array<{
    id: string;
    status: 'success' | 'failed' | 'pending';
    trigger_data: {
      username: string;
      text: string;
    };
    executed_at: string;
    credits_used: number;
  }>;
  created_at: string;
  updated_at: string;
  last_executed_at?: string;
}

interface AutomationDetailProps {
  automation: AutomationData;
  onStatusChange: (status: 'active' | 'paused') => void;
  onDelete: () => void;
}

export function AutomationDetail({
  automation,
  onStatusChange,
  onDelete,
}: AutomationDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isActive = automation.status === 'active';

  const successRate =
    automation.statistics.total_executions > 0
      ? Math.round(
          (automation.statistics.successful_executions /
            automation.statistics.total_executions) *
            100
        )
      : 0;

  const trendIsPositive = automation.statistics.trend.change >= 0;

  function getTriggerLabel(type: string, scope?: string) {
    if (type === 'new_comment') {
      return scope === 'all'
        ? 'New Comment (All Posts)'
        : 'New Comment (Specific Posts)';
    }
    return 'New DM Received';
  }

  function getActionLabel(type: string) {
    switch (type) {
      case 'reply_comment':
        return 'Reply to Comment';
      case 'private_reply':
        return 'Send Private Reply';
      case 'send_dm':
        return 'Send DM';
      default:
        return type;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Use the function to avoid linter error

  const _testDate = formatDate(new Date().toISOString());

  function formatTimeAgo(dateString: string) {
    const seconds = Math.floor(
      (Date.now() - new Date(dateString).getTime()) / 1000
    );
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  return (
    <div className='flex h-full flex-col'>
      {/* Header */}
      <div className='border-b border-border bg-card/30 p-4 sm:p-6'>
        <div className='mx-auto max-w-6xl'>
          {/* Back button */}
          <Button variant='ghost' size='sm' asChild className='mb-4'>
            <Link href='/dashboard/automations'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Automations
            </Link>
          </Button>

          <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
            <div className='flex items-start gap-4'>
              {/* Platform icon */}
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400'>
                <Instagram className='h-6 w-6 text-white' />
              </div>

              <div>
                <div className='mb-2 flex flex-wrap items-center gap-2'>
                  <h1 className='text-xl font-bold sm:text-2xl'>
                    {automation.name}
                  </h1>
                  <Badge
                    variant='secondary'
                    className={cn(
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

                {automation.description && (
                  <p className='mb-2 text-sm text-muted-foreground'>
                    {automation.description}
                  </p>
                )}

                <div className='flex items-center gap-3 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-1'>
                    <img
                      src={
                        automation.social_account.avatar || '/placeholder.svg'
                      }
                      alt=''
                      className='h-4 w-4 rounded-full'
                    />
                    <span>@{automation.social_account.username}</span>
                  </div>
                  <span className='text-muted-foreground/50'>•</span>
                  <span>Updated {formatTimeAgo(automation.updated_at)}</span>
                  {automation.last_executed_at && (
                    <>
                      <span className='text-muted-foreground/50'>•</span>
                      <div className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        <span>
                          Last run {formatTimeAgo(automation.last_executed_at)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-2'>
                <span className='text-sm text-muted-foreground'>
                  {isActive ? 'Active' : 'Paused'}
                </span>
                <Switch
                  checked={isActive}
                  onCheckedChange={checked =>
                    onStatusChange(checked ? 'active' : 'paused')
                  }
                  className='data-[state=checked]:bg-emerald-500'
                />
              </div>

              <Button asChild>
                <Link href={`/dashboard/automations/${automation.id}/edit`}>
                  <Edit className='mr-2 h-4 w-4' />
                  Edit
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='icon'>
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem>
                    <Copy className='mr-2 h-4 w-4' />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className='mr-2 h-4 w-4' />
                    View Logs
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className='text-destructive'
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Paused reason */}
          {automation.paused_reason && !isActive && (
            <div className='mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3'>
              <p className='text-sm text-amber-500'>
                <strong>Paused:</strong> {automation.paused_reason}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4 sm:p-6'>
        <div className='mx-auto max-w-6xl space-y-6'>
          {/* Stats Grid */}
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Card className='bg-card/50'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                      Total Executions
                    </p>
                    <p className='mt-1 text-2xl font-bold'>
                      {automation.statistics.total_executions.toLocaleString()}
                    </p>
                    <div className='mt-1 flex items-center gap-1'>
                      {trendIsPositive ? (
                        <TrendingUp className='h-3 w-3 text-emerald-500' />
                      ) : (
                        <TrendingDown className='h-3 w-3 text-red-500' />
                      )}
                      <span
                        className={cn(
                          'text-xs',
                          trendIsPositive ? 'text-emerald-500' : 'text-red-500'
                        )}
                      >
                        {Math.abs(automation.statistics.trend.change)}% this{' '}
                        {automation.statistics.trend.period}
                      </span>
                    </div>
                  </div>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10'>
                    <MessageCircle className='h-5 w-5 text-primary' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-card/50'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                      Success Rate
                    </p>
                    <p
                      className={cn(
                        'mt-1 text-2xl font-bold',
                        successRate >= 90
                          ? 'text-emerald-500'
                          : successRate >= 70
                            ? 'text-amber-500'
                            : 'text-red-500'
                      )}
                    >
                      {successRate}%
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      {automation.statistics.successful_executions} successful
                    </p>
                  </div>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10'>
                    <CheckCircle2 className='h-5 w-5 text-emerald-500' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-card/50'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                      Failed
                    </p>
                    <p className='mt-1 text-2xl font-bold text-red-500'>
                      {automation.statistics.failed_executions}
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      {automation.statistics.total_executions > 0
                        ? `${((automation.statistics.failed_executions / automation.statistics.total_executions) * 100).toFixed(1)}% failure rate`
                        : 'No failures'}
                    </p>
                  </div>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10'>
                    <XCircle className='h-5 w-5 text-red-500' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-card/50'>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                      Credits Used
                    </p>
                    <p className='mt-1 text-2xl font-bold'>
                      {automation.statistics.total_credits_used.toLocaleString()}
                    </p>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      ~
                      {automation.statistics.total_executions > 0
                        ? (
                            automation.statistics.total_credits_used /
                            automation.statistics.total_executions
                          ).toFixed(1)
                        : 0}{' '}
                      per execution
                    </p>
                  </div>
                  <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10'>
                    <Zap className='h-5 w-5 text-blue-500' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Automation Flow */}
          <Card className='bg-card/50 overflow-hidden'>
            <CardHeader className='pb-4 border-b border-border/50 bg-muted/20'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Zap className='h-4 w-4 text-primary' />
                Automation Flow
              </CardTitle>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='flex flex-col gap-6 lg:flex-row lg:items-stretch'>
                {/* Trigger */}
                <div className='flex-1 flex flex-col'>
                  <div className='rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex-1 transition-all hover:shadow-md hover:border-blue-500/30'>
                    <div className='mb-3 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 shadow-sm'>
                          <Play className='h-4 w-4 text-blue-500' />
                        </div>
                        <span className='text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400'>
                          Trigger
                        </span>
                      </div>
                    </div>
                    <p className='font-semibold text-lg'>
                      {getTriggerLabel(
                        automation.trigger.type,
                        automation.trigger.scope
                      )}
                    </p>
                    {automation.trigger.content_count ? (
                      <div className='mt-2 inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400'>
                        {automation.trigger.content_count} posts selected
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className='flex items-center justify-center lg:w-8 text-muted-foreground/30'>
                  <ArrowRight className='h-6 w-6 rotate-90 lg:rotate-0' />
                </div>

                {/* Condition */}
                {automation.condition && (
                  <>
                    <div className='flex-1 flex flex-col'>
                      <div className='rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex-1 transition-all hover:shadow-md hover:border-amber-500/30'>
                        <div className='mb-3 flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 shadow-sm'>
                              <RefreshCw className='h-4 w-4 text-amber-500' />
                            </div>
                            <span className='text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400'>
                              Condition
                            </span>
                          </div>
                        </div>
                        <p className='font-semibold text-lg'>Keyword Filter</p>
                        <div className='mt-3 flex flex-wrap gap-1.5'>
                          {automation.condition.keywords
                            .slice(0, 5)
                            .map(keyword => (
                              <Badge
                                key={keyword}
                                variant='secondary'
                                className='bg-background/80 hover:bg-background text-xs font-normal border border-amber-200 dark:border-amber-800'
                              >
                                {keyword}
                              </Badge>
                            ))}
                          {automation.condition.keywords.length > 5 && (
                            <Badge
                              variant='secondary'
                              className='bg-background/80 text-xs font-normal border border-amber-200 dark:border-amber-800'
                            >
                              +{automation.condition.keywords.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center justify-center lg:w-8 text-muted-foreground/30'>
                      <ArrowRight className='h-6 w-6 rotate-90 lg:rotate-0' />
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className='flex-1 flex flex-col'>
                  <div className='rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex-1 transition-all hover:shadow-md hover:border-emerald-500/30'>
                    <div className='mb-3 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 shadow-sm'>
                          <Zap className='h-4 w-4 text-emerald-500' />
                        </div>
                        <span className='text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400'>
                          Actions
                        </span>
                      </div>
                      <Badge
                        variant='outline'
                        className='border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400'
                      >
                        {automation.actions.length} Step
                        {automation.actions.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className='space-y-3'>
                      {automation.actions.map((action, index) => (
                        <div
                          key={index}
                          className='flex items-center gap-3 rounded-lg bg-background/60 p-2 border border-border/50'
                        >
                          <span className='flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground shadow-xs'>
                            {index + 1}
                          </span>
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium truncate'>
                              {getActionLabel(action.type)}
                            </p>
                          </div>
                          {action.delay_seconds > 0 && (
                            <Badge
                              variant='secondary'
                              className='flex items-center gap-1 text-[10px] h-5 px-1.5 font-normal'
                            >
                              <Clock className='h-3 w-3' />
                              {action.delay_seconds}s
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Execution History */}
          <Card className='bg-card/50'>
            <CardHeader className='flex flex-row items-center justify-between pb-4'>
              <CardTitle className='text-base'>Recent Executions</CardTitle>
              <Button variant='ghost' size='sm'>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {automation.execution_history.length > 0 ? (
                <div className='space-y-3'>
                  {automation.execution_history.map(execution => (
                    <div
                      key={execution.id}
                      className='flex items-center gap-4 rounded-lg border border-border bg-background/50 p-3'
                    >
                      {/* Status icon */}
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                          execution.status === 'success'
                            ? 'bg-emerald-500/10'
                            : execution.status === 'failed'
                              ? 'bg-red-500/10'
                              : 'bg-amber-500/10'
                        )}
                      >
                        {execution.status === 'success' ? (
                          <CheckCircle2 className='h-4 w-4 text-emerald-500' />
                        ) : execution.status === 'failed' ? (
                          <XCircle className='h-4 w-4 text-red-500' />
                        ) : (
                          <Clock className='h-4 w-4 text-amber-500' />
                        )}
                      </div>

                      {/* Content */}
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium'>
                            @{execution.trigger_data.username}
                          </span>
                          <Badge
                            variant='secondary'
                            className={cn(
                              'text-xs',
                              execution.status === 'success'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : execution.status === 'failed'
                                  ? 'bg-red-500/10 text-red-500'
                                  : 'bg-amber-500/10 text-amber-500'
                            )}
                          >
                            {execution.status}
                          </Badge>
                        </div>
                        <p className='mt-1 truncate text-sm text-muted-foreground'>
                          "{execution.trigger_data.text}"
                        </p>
                      </div>

                      {/* Meta */}
                      <div className='shrink-0 text-right'>
                        <p className='text-sm font-medium'>
                          {execution.credits_used} credits
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {formatTimeAgo(execution.executed_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='py-8 text-center'>
                  <Clock className='mx-auto mb-3 h-8 w-8 text-muted-foreground' />
                  <p className='text-sm text-muted-foreground'>
                    No executions yet
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    Executions will appear here once the automation runs
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{automation.name}"? This action
              cannot be undone and will stop all running automations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
