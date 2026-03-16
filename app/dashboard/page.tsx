'use client';

import React from 'react';
import Link from 'next/link';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { SystemHealthBar } from '@/components/dashboard/system-health-bar';
import { AutomationSummary } from '@/components/dashboard/automation-summary';
import { QuickInsights } from '@/components/dashboard/quick-insights';
import { PerformanceMetrics } from '@/components/dashboard/performance-metrics';
import { DashboardSkeleton } from '@/components/dashboard/skeleton';
import { notificationsApi } from '@/lib/api/notifications';
import { automationsApi } from '@/lib/api/automations';
import { useToast } from '@/components/ui/use-toast';
import { parseApiError } from '@/lib/http/errors';
import type { Automation, ConnectedAccount } from '@/lib/types/dashboard';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { ImpactCard } from '@/components/dashboard/impact-card';
import type { Notification } from '@/lib/types/notifications';
import { analytics } from '@/lib/analytics';
import { useDashboardStats, queryKeys } from '@/lib/hooks';
import { Zap, AlertTriangle, Plus } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import type { DashboardStatsResponse } from '@/lib/api/dashboard';

export default function DashboardPage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data, isLoading } = useDashboardStats();

  // ── First reply analytics tracking ────────────────────────────────────────
  const hasTrackedRef = React.useRef(false);
  React.useEffect(() => {
    if (
      !hasTrackedRef.current &&
      (data?.impact?.replies_handled_today ?? 0) > 0
    ) {
      analytics.track('bot_first_reply', { bot_id: 'unknown' });
      hasTrackedRef.current = true;
    }
  }, [data?.impact?.replies_handled_today]);

  // ── Notification mutations ─────────────────────────────────────────────────
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onMutate: async id => {
      qc.setQueryData<DashboardStatsResponse>(
        queryKeys.dashboard.stats(),
        old => {
          if (!old) return old;
          return {
            ...old,
            recent_activity: old.recent_activity.map(n =>
              n.id === id
                ? { ...n, status: 'read', read_at: new Date().toISOString() }
                : n
            ),
          };
        }
      );
    },
    onError: () =>
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.stats() }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onMutate: async () => {
      qc.setQueryData<DashboardStatsResponse>(
        queryKeys.dashboard.stats(),
        old => {
          if (!old) return old;
          return {
            ...old,
            recent_activity: old.recent_activity.map(n =>
              n.status === 'unread'
                ? { ...n, status: 'read', read_at: new Date().toISOString() }
                : n
            ),
          };
        }
      );
    },
    onError: () =>
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.stats() }),
  });

  // ── Automation mutations ───────────────────────────────────────────────────
  const deleteAutomationMutation = useMutation({
    mutationFn: (id: string) => automationsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
      qc.invalidateQueries({ queryKey: queryKeys.automations.lists() });
      toast({
        title: 'Success',
        description: 'Automation deleted successfully',
      });
    },
    onError: error => {
      const err = parseApiError(error);
      toast({
        title: err.title,
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const toggleAutomationMutation = useMutation({
    mutationFn: async (id: string) => {
      const current = data?.automations.find(a => a.id === id);
      if (!current) throw new Error('Automation not found');
      return current.status === 'active'
        ? automationsApi.deactivate(id)
        : automationsApi.activate(id);
    },
    onMutate: async id => {
      qc.setQueryData<DashboardStatsResponse>(
        queryKeys.dashboard.stats(),
        old => {
          if (!old) return old;
          return {
            ...old,
            automations: old.automations.map(a =>
              a.id === id
                ? {
                    ...a,
                    status: a.status === 'active' ? 'inactive' : 'active',
                  }
                : a
            ),
          };
        }
      );
    },
    onError: error => {
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
      const err = parseApiError(error);
      toast({
        title: err.title,
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const [creditWarningId, setCreditWarningId] = React.useState<string | null>(null);

  const isAiAutomation = (automation: Automation) => {
    return (
      automation.actions?.some(a => a.toLowerCase().includes('ai')) ||
      automation.action === 'reply'
    ) ?? false;
  };

  const handleToggleAutomation = (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (!automation) return;
    // Only warn for AI automations being activated when credits are low
    if (automation.status === 'paused' && isAiAutomation(automation) && credits.remaining < 20) {
      setCreditWarningId(id);
      return;
    }
    toggleAutomationMutation.mutate(id);
  };

  // ── Derived display data ───────────────────────────────────────────────────
  const connectedAccount: ConnectedAccount | null = data?.connected_account
    ? {
        id: 'instagram_1',
        platform: 'instagram',
        username: data.connected_account.username,
        isConnected: data.connected_account.status === 'connected',
        lastSync: new Date(data.connected_account.last_sync),
        profilePicture: data.connected_account.avatar_url,
      }
    : null;

  const credits = {
    remaining: data?.overview.credits_remaining ?? 0,
    estimatedReplies: data?.overview.credits_remaining ?? 0,
  };

  const automations: Automation[] = (data?.automations ?? []).map(a => ({
    id: a.id,
    name: a.name,
    trigger: a.trigger as Automation['trigger'],
    action: a.action as Automation['action'],
    triggers: a.triggers,
    actions: a.actions,
    status: a.status === 'active' ? 'running' : 'paused',
    creditCost: a.credit_cost,
    handledCount: a.handled_count,
    lastRun: new Date(a.last_active),
    createdAt: new Date(a.created_at),
  }));

  const notifications = (data?.recent_activity ??
    []) as unknown as Notification[];
  const activeAutomationCount = automations.filter(
    a => a.status === 'running'
  ).length;
  const lastActivity = notifications[0]?.created_at
    ? new Date(notifications[0].created_at)
    : undefined;

  if (isLoading) return <DashboardSkeleton />;

  const hasNoAutomations = automations.length === 0;
  const pausedCount = automations.filter(a => a.status === 'paused').length;
  const hasAllPaused = automations.length > 0 && pausedCount === automations.length;
  const lowCredits = credits.remaining < 20;

  return (
    <>
    <main className='p-4 sm:p-6 lg:p-8 space-y-6' data-tour='dashboard-stats'>
      {/* Paused automations banner */}
      {hasAllPaused && lowCredits && (
        <div className='flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3'>
          <AlertTriangle className='h-4 w-4 text-warning shrink-0' />
          <p className='text-sm text-warning font-medium flex-1'>
            {pausedCount} automation{pausedCount > 1 ? 's' : ''} paused — you&apos;re out of credits.
          </p>
          <Button asChild size='sm' className='bg-warning hover:bg-warning/90 text-warning-foreground h-8 text-xs font-semibold'>
            <Link href='/dashboard/credits/buy'>Top up now</Link>
          </Button>
        </div>
      )}

      {/* System Health Bar */}
      <SystemHealthBar
        isConnected={connectedAccount?.isConnected ?? false}
        activeAutomations={activeAutomationCount}
        creditsRemaining={credits.remaining}
        lastActivityTime={lastActivity}
      />

      {/* Impact Card */}
      {data?.impact && <ImpactCard impact={data.impact} />}

      {/* Quick Insights */}
      <QuickInsights
        credits={credits}
        todayReplies={data?.overview.credits_used_today ?? 0}
        weeklyGrowth={data?.overview.weekly_growth ?? 0}
        totalLeads={data?.overview.total_leads ?? 0}
      />

      {/* Performance Metrics */}
      {data?.performance && <PerformanceMetrics metrics={data.performance} />}

      {/* Empty state for new users */}
      {hasNoAutomations && (
        <div className='rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center'>
          <div className='mx-auto mb-4 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center'>
            <Zap className='h-8 w-8 text-primary' />
          </div>
          <h3 className='text-xl font-bold text-foreground mb-2'>
            Create your first automation
          </h3>
          <p className='text-sm text-muted-foreground max-w-sm mx-auto mb-6'>
            Automate your Instagram DMs and comment replies with AI. Set it up once and let it run 24/7.
          </p>
          <Button asChild className='bg-primary hover:bg-primary/90 text-white font-semibold h-10 px-6'>
            <Link href='/dashboard/automations/new'>
              <Plus className='mr-2 h-4 w-4' />
              Create Automation
            </Link>
          </Button>
          <p className='text-xs text-muted-foreground mt-4'>
            Free to create · Uses credits only when triggered
          </p>
        </div>
      )}

      {/* Main content grid */}
      <div className='grid gap-6 lg:grid-cols-5'>
        <div className='lg:col-span-3 space-y-6'>
          <RecentActivity
            notifications={notifications}
            onMarkAsRead={id => markAsReadMutation.mutate(id)}
            onMarkAllAsRead={() => markAllAsReadMutation.mutate()}
          />
        </div>
        <div className='lg:col-span-2 space-y-6'>
          <AutomationSummary
            automations={automations}
            onToggle={handleToggleAutomation}
            onDelete={id => deleteAutomationMutation.mutate(id)}
          />
        </div>
      </div>
    </main>

      {/* Low credits warning dialog */}
      <AlertDialog open={!!creditWarningId} onOpenChange={open => { if (!open) setCreditWarningId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Low credits — activate anyway?</AlertDialogTitle>
            <AlertDialogDescription>
              You only have <strong>{credits.remaining} credits</strong> left. AI automations use credits on every reply.
              Your automation may pause automatically if credits run out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button asChild variant='outline' className='mr-2'>
                <Link href='/dashboard/credits/buy'>Top up credits</Link>
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (creditWarningId) toggleAutomationMutation.mutate(creditWarningId);
                setCreditWarningId(null);
              }}
            >
              Activate anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
