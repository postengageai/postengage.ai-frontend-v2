'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

import { formatDistanceToNow } from 'date-fns';
import {
  Plus,
  Search,
  MoreHorizontal,
  Instagram,
  Zap,
  Filter,
  Pencil,
  Copy,
  Pause,
  Play,
  Trash2,
  MessageCircle,
  Mail,
  AlertTriangle,
  BarChart2,
  GitFork,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  AutomationsApi,
  type Automation,
  type AutomationListParams,
} from '@/lib/api/automations';
import {
  AutomationStatus,
  AutomationTriggerType,
  AutomationActionType,
} from '@/lib/constants/automations';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/http/errors';

// ─── helpers ──────────────────────────────────────────────────────────────────

function getTriggerLabel(type: string) {
  const map: Record<string, string> = {
    [AutomationTriggerType.NEW_COMMENT]: 'New Comment',
    [AutomationTriggerType.DM_RECEIVED]: 'DM Received',
    [AutomationTriggerType.STORY_REPLY]: 'Story Reply',
    [AutomationTriggerType.MENTION]: 'Mention',
    [AutomationTriggerType.NEW_FOLLOWER]: 'New Follower',
  };
  return (
    map[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  );
}

function getActionLabel(type: string) {
  const map: Record<string, string> = {
    [AutomationActionType.REPLY_COMMENT]: 'Reply to Comment',
    [AutomationActionType.SEND_DM]: 'Send DM',
    [AutomationActionType.PRIVATE_REPLY]: 'Private Reply',
  };
  return (
    map[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  );
}

function TriggerIcon({ type }: { type: string }) {
  if (type === AutomationTriggerType.DM_RECEIVED)
    return <Mail className='h-4 w-4' />;
  return <MessageCircle className='h-4 w-4' />;
}

// ─── Delete Dialog ─────────────────────────────────────────────────────────────

function DeleteAutomationDialog({
  automation,
  open,
  onOpenChange,
  onConfirm,
}: {
  automation: Automation | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}) {
  if (!automation) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md bg-card border-border p-0 gap-0'>
        <DialogHeader className='p-5 pb-4 border-b border-border/60 flex-row items-center gap-3'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--error,#ef4444)]/10'>
            <AlertTriangle className='h-4 w-4 text-[color:var(--error,#ef4444)]' />
          </div>
          <DialogTitle className='text-base font-semibold'>
            Delete Automation?
          </DialogTitle>
        </DialogHeader>

        <div className='p-5 space-y-4'>
          {/* Automation preview mini-card */}
          <div className='flex items-center gap-3 rounded-xl bg-muted/40 border border-border/50 px-4 py-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shrink-0'>
              <Instagram className='h-5 w-5 text-white' />
            </div>
            <span className='font-semibold text-sm truncate'>
              {automation.name}
            </span>
          </div>

          <p className='text-sm text-muted-foreground leading-relaxed'>
            This will permanently delete the automation and all its execution
            history ({(automation.execution_count || 0).toLocaleString()} runs).
            This cannot be undone.
          </p>

          {/* Warning box */}
          <div className='flex items-start gap-2.5 rounded-xl border border-[color:var(--error,#ef4444)]/20 bg-[color:var(--error,#ef4444)]/8 px-4 py-3'>
            <AlertTriangle className='h-4 w-4 text-[color:var(--error,#ef4444)] mt-0.5 shrink-0' />
            <p className='text-xs text-[color:var(--error,#ef4444)] leading-relaxed'>
              This action cannot be reversed. All data including stats and
              history will be lost.
            </p>
          </div>
        </div>

        <div className='flex items-center justify-end gap-2 px-5 py-4 border-t border-border/60'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onOpenChange(false)}
            className='bg-transparent'
          >
            Cancel
          </Button>
          <Button
            size='sm'
            onClick={onConfirm}
            className='bg-[color:var(--error,#ef4444)] hover:bg-[color:var(--error,#ef4444)]/90 text-white gap-1.5'
          >
            <Trash2 className='h-3.5 w-3.5' />
            Delete Automation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Automation Card ───────────────────────────────────────────────────────────

function AutomationCard({
  automation,
  onToggleStatus,
  onDelete,
}: {
  automation: Automation;
  onToggleStatus: (id: string, current: string) => void;
  onDelete: (automation: Automation) => void;
}) {
  const isActive = automation.status === AutomationStatus.ACTIVE;
  const _isPaused =
    automation.status === AutomationStatus.INACTIVE ||
    automation.status === AutomationStatus.PAUSED;
  const isDraft = automation.status === AutomationStatus.DRAFT;

  const successRate =
    (automation.execution_count || 0) > 0
      ? Math.round(
          ((automation.success_count || 0) /
            (automation.execution_count || 0)) *
            100
        )
      : null;

  return (
    <div
      className={cn(
        'group rounded-2xl border bg-card transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20',
        isActive ? 'border-border' : 'border-border/60 opacity-80'
      )}
    >
      <div className='p-4 sm:p-5'>
        {/* Row 1: icon + name + status + menu */}
        <div className='flex items-start gap-3'>
          {/* Platform icon */}
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 sm:h-10 sm:w-10'>
            <Instagram className='h-4 w-4 text-white sm:h-5 sm:w-5' />
          </div>

          {/* Name + subtitle */}
          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between gap-2'>
              <div className='min-w-0 flex-1'>
                <Link
                  href={`/dashboard/automations/${automation.id}`}
                  className='block truncate text-[14px] font-semibold leading-snug transition-colors hover:text-primary sm:text-[15px]'
                >
                  {automation.name}
                </Link>
                <div className='mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground'>
                  <span className='flex items-center gap-1'>
                    <TriggerIcon type={automation.trigger.trigger_type} />
                    {getTriggerLabel(automation.trigger.trigger_type)}
                  </span>
                  {automation.social_account && (
                    <>
                      <span className='text-border'>·</span>
                      <span>@{automation.social_account.username}</span>
                    </>
                  )}
                  {automation.last_executed_at && (
                    <span className='hidden sm:inline'>
                      <span className='mx-1 text-border'>·</span>
                      Last run{' '}
                      {formatDistanceToNow(
                        new Date(automation.last_executed_at),
                        { addSuffix: true }
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Status badge + menu — always visible on mobile (no opacity-0) */}
              <div className='flex shrink-0 items-center gap-1.5'>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium sm:px-2.5',
                    isActive
                      ? 'bg-[color:var(--success,#22c55e)]/12 text-[color:var(--success,#22c55e)]'
                      : isDraft
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-amber-500/12 text-amber-500'
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      isActive
                        ? 'bg-[color:var(--success,#22c55e)]'
                        : isDraft
                          ? 'bg-muted-foreground'
                          : 'bg-amber-500'
                    )}
                  />
                  {isActive ? 'Active' : isDraft ? 'Draft' : 'Paused'}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 text-muted-foreground transition-opacity sm:opacity-0 sm:group-hover:opacity-100'
                    >
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-44'>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/automations/${automation.id}/edit`}
                        className='flex items-center gap-2'
                      >
                        <Pencil className='h-3.5 w-3.5' />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className='flex items-center gap-2'>
                      <Copy className='h-3.5 w-3.5' />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        onToggleStatus(
                          automation.id,
                          automation.status || AutomationStatus.DRAFT
                        )
                      }
                      className='flex items-center gap-2'
                    >
                      {isActive ? (
                        <>
                          <Pause className='h-3.5 w-3.5' />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className='h-3.5 w-3.5' />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(automation)}
                      className='flex items-center gap-2 text-destructive focus:text-destructive'
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Actions pills */}
        {automation.actions?.length > 0 && (
          <div className='mt-3 flex flex-wrap items-center gap-1.5 pl-12 sm:pl-[52px]'>
            {automation.actions.slice(0, 3).map(action => (
              <span
                key={action.id}
                className='inline-flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground'
              >
                {action.action_type === AutomationActionType.REPLY_COMMENT && (
                  <MessageCircle className='h-3 w-3' />
                )}
                {(action.action_type === AutomationActionType.SEND_DM ||
                  action.action_type ===
                    AutomationActionType.PRIVATE_REPLY) && (
                  <Mail className='h-3 w-3' />
                )}
                {getActionLabel(action.action_type)}
              </span>
            ))}
            {automation.actions.length > 3 && (
              <span className='text-[11px] text-muted-foreground'>
                +{automation.actions.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Row 3: Stats + buttons — stacks on very small, row on sm+ */}
        <div className='mt-3 pl-12 sm:mt-4 sm:pl-[52px]'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            {/* Stats */}
            <div className='flex items-center gap-4 text-xs sm:gap-5'>
              <div>
                <p className='text-muted-foreground'>Total Runs</p>
                <p className='mt-0.5 font-semibold text-foreground'>
                  {(automation.execution_count || 0).toLocaleString()}
                </p>
              </div>
              <div className='h-7 w-px bg-border' />
              <div>
                <p className='text-muted-foreground'>Last Run</p>
                <p className='mt-0.5 font-semibold text-foreground'>
                  {automation.last_executed_at
                    ? formatDistanceToNow(new Date(automation.last_executed_at))
                    : '—'}
                </p>
              </div>
              {successRate !== null && (
                <>
                  <div className='h-7 w-px bg-border' />
                  <div>
                    <p className='text-muted-foreground'>Success</p>
                    <p
                      className={cn(
                        'mt-0.5 font-semibold',
                        successRate >= 90
                          ? 'text-[color:var(--success,#22c55e)]'
                          : successRate >= 70
                            ? 'text-amber-500'
                            : 'text-[color:var(--error,#ef4444)]'
                      )}
                    >
                      {successRate}%
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* CTA buttons */}
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='sm'
                asChild
                className='h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground'
              >
                <Link href={`/dashboard/automations/${automation.id}`}>
                  <BarChart2 className='h-3.5 w-3.5' />
                  <span className='hidden sm:inline'>View Stats</span>
                  <span className='sm:hidden'>Stats</span>
                </Link>
              </Button>
              <Button
                variant='outline'
                size='sm'
                asChild
                className='h-8 gap-1.5 bg-transparent text-xs'
              >
                <Link href={`/dashboard/automations/${automation.id}/edit`}>
                  <Pencil className='h-3.5 w-3.5' />
                  Edit
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function AutomationSkeleton() {
  return (
    <div className='rounded-2xl border border-border bg-card p-5 animate-pulse'>
      <div className='flex items-start gap-3.5'>
        <div className='h-10 w-10 rounded-xl bg-muted shrink-0' />
        <div className='flex-1 space-y-2'>
          <div className='h-4 w-48 rounded bg-muted' />
          <div className='h-3 w-32 rounded bg-muted/60' />
        </div>
      </div>
      <div className='mt-4 flex gap-5 pl-[54px]'>
        {[0, 1, 2].map(i => (
          <div key={i} className='space-y-1'>
            <div className='h-3 w-14 rounded bg-muted/60' />
            <div className='h-4 w-10 rounded bg-muted' />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className='flex flex-col items-center justify-center py-20 text-center'>
      <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-5'>
        <Zap className='h-8 w-8 text-primary' />
      </div>
      <h3 className='text-lg font-semibold mb-2'>
        {hasFilters ? 'No results found' : 'No automations yet'}
      </h3>
      <p className='text-sm text-muted-foreground mb-6 max-w-xs'>
        {hasFilters
          ? 'Try adjusting your filters to see more results.'
          : 'Create your first automation to start automatically engaging with your audience.'}
      </p>
      {!hasFilters && (
        <Button asChild>
          <Link href='/dashboard/automations/new'>
            <Plus className='h-4 w-4 mr-2' />
            Create Automation
          </Link>
        </Button>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState<Automation | null>(null);
  const [_isDeleting, setIsDeleting] = useState(false);

  const fetchAutomations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: AutomationListParams = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await AutomationsApi.list(params);
      setAutomations(res?.data ?? []);
    } catch (err) {
      const e = parseApiError(err);
      toast({ variant: 'destructive', title: e.title, description: e.message });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  const handleToggleStatus = async (id: string, current: string) => {
    const next =
      current === AutomationStatus.ACTIVE
        ? AutomationStatus.INACTIVE
        : AutomationStatus.ACTIVE;

    setAutomations(prev =>
      prev.map(a =>
        a.id === id ? { ...a, status: next as Automation['status'] } : a
      )
    );

    try {
      await AutomationsApi.update(id, { status: next });
      toast({
        title: next === AutomationStatus.ACTIVE ? 'Activated' : 'Paused',
        description: `Automation ${next === AutomationStatus.ACTIVE ? 'is now active' : 'paused successfully'}.`,
      });
    } catch (err) {
      setAutomations(prev =>
        prev.map(a =>
          a.id === id ? { ...a, status: current as Automation['status'] } : a
        )
      );
      const e = parseApiError(err);
      toast({ variant: 'destructive', title: e.title, description: e.message });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await AutomationsApi.delete(deleteTarget.id);
      setAutomations(prev => prev.filter(a => a.id !== deleteTarget.id));
      toast({
        title: 'Deleted',
        description: `"${deleteTarget.name}" has been deleted.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      const e = parseApiError(err);
      toast({ variant: 'destructive', title: e.title, description: e.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const activeCount = automations.filter(
    a => a.status === AutomationStatus.ACTIVE
  ).length;
  const hasFilters = !!debouncedSearch || statusFilter !== 'all';

  return (
    <div className='flex h-full flex-col'>
      {/* ── Header ── */}
      <div className='flex-none border-b border-border px-4 py-4 sm:px-6 sm:py-5' data-tour="automations-header">
        {/* Title row — stacks on mobile */}
        <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4'>
          <div className='min-w-0'>
            <h1 className='text-xl font-bold leading-tight sm:text-2xl'>
              Automations
            </h1>
            <p className='mt-0.5 text-sm text-muted-foreground'>
              Build and manage workflows that run on Instagram automatically
            </p>
          </div>
          {/* Action buttons — scrollable row on mobile */}
          <div className='flex shrink-0 items-center gap-2 overflow-x-auto pb-0.5 sm:overflow-visible sm:pb-0'>
            <Button
              variant='outline'
              size='sm'
              className='h-9 shrink-0 gap-1.5 bg-transparent text-muted-foreground'
            >
              <Filter className='h-3.5 w-3.5' />
              <span className='hidden sm:inline'>Filter</span>
            </Button>
            {/* Flow Builder button — hidden until feature is ready */}
            {/* <Button
              asChild
              variant='outline'
              size='sm'
              className='h-9 shrink-0 gap-1.5 bg-transparent border-violet-500/40 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300'
            >
              <Link href='/dashboard/automations/flow/new'>
                <GitFork className='h-3.5 w-3.5' />
                <span className='hidden sm:inline'>Flow Builder</span>
                <span className='sm:hidden'>Flow</span>
                <span className='ml-0.5 rounded-full border border-amber-500/30 bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-400'>
                  Beta
                </span>
              </Link>
            </Button> */}
            <Button asChild size='sm' className='h-9 shrink-0 gap-1.5' data-tour="create-automation-btn">
              <Link href='/dashboard/automations/new'>
                <Plus className='h-4 w-4' />
                <span className='hidden sm:inline'>New Automation</span>
                <span className='sm:hidden'>New</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Filter bar — wraps gracefully */}
        <div className='flex flex-wrap items-center gap-2'>
          <div className='relative w-full min-w-0 flex-1 sm:max-w-sm'>
            <Search className='absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Search automations...'
              className='h-9 bg-background/60 pl-9 text-sm'
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='h-9 w-[120px] bg-background/60 text-sm'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value={AutomationStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={AutomationStatus.INACTIVE}>Paused</SelectItem>
              <SelectItem value={AutomationStatus.DRAFT}>Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue='all'>
            <SelectTrigger className='h-9 w-[130px] bg-background/60 text-sm'>
              <SelectValue placeholder='Platform' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Platforms</SelectItem>
              <SelectItem value='instagram'>Instagram</SelectItem>
            </SelectContent>
          </Select>

          {/* Summary counts */}
          {!isLoading && (
            <div className='ml-auto flex items-center gap-1 text-xs text-muted-foreground'>
              <span>
                {automations.length} automation
                {automations.length !== 1 ? 's' : ''}
              </span>
              {activeCount > 0 && (
                <>
                  <span>·</span>
                  <span className='text-[color:var(--success,#22c55e)]'>
                    {activeCount} active
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── List ── */}
      <div className='flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5' data-tour="automations-list">
        {isLoading ? (
          <div className='space-y-3'>
            {[0, 1, 2].map(i => (
              <AutomationSkeleton key={i} />
            ))}
          </div>
        ) : automations.length > 0 ? (
          <div className='space-y-3'>
            {automations.map(automation => (
              <AutomationCard
                key={automation.id}
                automation={automation}
                onToggleStatus={handleToggleStatus}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        ) : (
          <EmptyState hasFilters={hasFilters} />
        )}
      </div>

      {/* Delete dialog */}
      <DeleteAutomationDialog
        automation={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
