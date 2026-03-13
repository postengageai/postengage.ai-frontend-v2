'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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
import { useDashboardStats, useBots, queryKeys } from '@/lib/hooks';
import type { DashboardStatsResponse } from '@/lib/api/dashboard';

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data, isLoading } = useDashboardStats();

  // ── Onboarding redirect for brand-new users ────────────────────────────────
  const { data: bots } = useBots();
  React.useEffect(() => {
    const alreadyDone = localStorage.getItem('onboarding_complete');
    if (alreadyDone || bots === undefined) return;
    if (bots.length === 0) router.replace('/dashboard/onboarding');
  }, [bots, router]);

  // ── First reply analytics tracking ────────────────────────────────────────
  const hasTrackedRef = React.useRef(false);
  React.useEffect(() => {
    if (!hasTrackedRef.current && (data?.impact?.replies_handled_today ?? 0) > 0) {
      analytics.track('bot_first_reply', { bot_id: 'unknown' });
      hasTrackedRef.current = true;
    }
  }, [data?.impact?.replies_handled_today]);

  // ── Notification mutations ─────────────────────────────────────────────────
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onMutate: async (id) => {
      qc.setQueryData<DashboardStatsResponse>(queryKeys.dashboard.stats(), (old) => {
        if (!old) return old;
        return {
          ...old,
          recent_activity: old.recent_activity.map((n) =>
            n.id === id ? { ...n, status: 'read', read_at: new Date().toISOString() } : n
          ),
        };
      });
    },
    onError: () => qc.invalidateQueries({ queryKey: queryKeys.dashboard.stats() }),
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onMutate: async () => {
      qc.setQueryData<DashboardStatsResponse>(queryKeys.dashboard.stats(), (old) => {
        if (!old) return old;
        return {
          ...old,
          recent_activity: old.recent_activity.map((n) =>
            n.status === 'unread'
              ? { ...n, status: 'read', read_at: new Date().toISOString() }
              : n
          ),
        };
      });
    },
    onError: () => qc.invalidateQueries({ queryKey: queryKeys.dashboard.stats() }),
  });

  // ── Automation mutations ───────────────────────────────────────────────────
  const deleteAutomationMutation = useMutation({
    mutationFn: (id: string) => automationsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
      qc.invalidateQueries({ queryKey: queryKeys.automations.lists() });
      toast({ title: 'Success', description: 'Automation deleted successfully' });
    },
    onError: (error) => {
      const err = parseApiError(error);
      toast({ title: err.title, description: err.message, variant: 'destructive' });
    },
  });

  const toggleAutomationMutation = useMutation({
    mutationFn: async (id: string) => {
      const current = data?.automations.find((a) => a.id === id);
      if (!current) throw new Error('Automation not found');
      return current.status === 'active'
        ? automationsApi.deactivate(id)
        : automationsApi.activate(id);
    },
    onMutate: async (id) => {
      qc.setQueryData<DashboardStatsResponse>(queryKeys.dashboard.stats(), (old) => {
        if (!old) return old;
        return {
          ...old,
          automations: old.automations.map((a) =>
            a.id === id
              ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' }
              : a
          ),
        };
      });
    },
    onError: (error) => {
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
      const err = parseApiError(error);
      toast({ title: err.title, description: err.message, variant: 'destructive' });
    },
  });

  const handleToggleAutomation = (id: string) => {
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

  const automations: Automation[] = (data?.automations ?? []).map((a) => ({
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

  const notifications = (data?.recent_activity ?? []) as unknown as Notification[];
  const activeAutomationCount = automations.filter((a) => a.status === 'running').length;
  const lastActivity = notifications[0]?.created_at
    ? new Date(notifications[0].created_at)
    : undefined;

  if (isLoading) return <DashboardSkeleton />;

  return (
    <main className='p-4 sm:p-6 lg:p-8 space-y-6'>
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

      {/* Main content grid */}
      <div className='grid gap-6 lg:grid-cols-5'>
        <div className='lg:col-span-3 space-y-6'>
          <RecentActivity
            notifications={notifications}
            onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
            onMarkAllAsRead={() => markAllAsReadMutation.mutate()}
          />
        </div>
        <div className='lg:col-span-2 space-y-6'>
          <AutomationSummary
            automations={automations}
            onToggle={handleToggleAutomation}
            onDelete={(id) => deleteAutomationMutation.mutate(id)}
          />
        </div>
      </div>
    </main>
  );
}
