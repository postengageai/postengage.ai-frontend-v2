'use client';

import { useState, useEffect } from 'react';
import { SystemHealthBar } from '@/components/dashboard/system-health-bar';
import { AutomationSummary } from '@/components/dashboard/automation-summary';
import { QuickInsights } from '@/components/dashboard/quick-insights';
import { PerformanceMetrics } from '@/components/dashboard/performance-metrics';
import { DashboardSkeleton } from '@/components/dashboard/skeleton';
import { dashboardApi } from '@/lib/api/dashboard';
import { notificationsApi } from '@/lib/api/notifications';
import { automationsApi } from '@/lib/api/automations';
import { useToast } from '@/components/ui/use-toast';
import type {
  Automation,
  ConnectedAccount,
  PerformanceMetrics as IPerformanceMetrics,
} from '@/lib/types/dashboard';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import type { Notification } from '@/lib/types/notifications';

export default function DashboardPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [connectedAccount, setConnectedAccount] =
    useState<ConnectedAccount | null>(null);
  const [credits, setCredits] = useState({
    remaining: 0,
    estimatedReplies: 0,
  });
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [todayReplies, setTodayReplies] = useState(0);
  const [weeklyGrowth, setWeeklyGrowth] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [performance, setPerformance] = useState<IPerformanceMetrics | null>(
    null
  );

  const fetchDashboardData = async () => {
    try {
      setDashboardError(null);
      setIsLoading(true);

      const dashboardResponse = await dashboardApi.getStats();
      const data = dashboardResponse.data;

      // Cast recent_activity to Notification[] since the backend now returns notifications
      setNotifications(data.recent_activity as unknown as Notification[]);

      if (data.connected_account) {
        setConnectedAccount({
          id: 'instagram_1',
          platform: 'instagram',
          username: data.connected_account.username,
          isConnected: data.connected_account.status === 'connected',
          lastSync: new Date(data.connected_account.last_sync),
          profilePicture: data.connected_account.avatar_url,
        });
      }

      setCredits({
        remaining: data.overview.credits_remaining,
        estimatedReplies: data.overview.credits_remaining,
      });

      setTodayReplies(data.overview.credits_used_today);
      setWeeklyGrowth(data.overview.weekly_growth);
      setTotalLeads(data.overview.total_leads);

      if (data.performance) {
        setPerformance(data.performance);
      }

      setAutomations(
        data.automations.map(a => ({
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
        }))
      );
    } catch (_error) {
      setDashboardError(
        _error instanceof Error
          ? _error.message
          : 'Failed to load dashboard data. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n =>
          n.id === id
            ? {
                ...n,
                status: 'read' as const,
                read_at: new Date().toISOString(),
              }
            : n
        )
      );
    } catch (_error) {
      // Silent error
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev =>
        prev.map(n =>
          n.status === 'unread'
            ? {
                ...n,
                status: 'read' as const,
                read_at: new Date().toISOString(),
              }
            : n
        )
      );
    } catch (_error) {
      // Silent error
    }
  };

  const activeAutomationCount = automations.filter(
    a => a.status === 'running'
  ).length;
  const lastActivity = notifications[0]?.created_at
    ? new Date(notifications[0].created_at)
    : undefined;

  const handleToggleAutomation = async (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (!automation) return;

    const newStatus = automation.status === 'running' ? 'paused' : 'active';

    // Optimistic update
    setAutomations(prev =>
      prev.map(a =>
        a.id === id
          ? {
              ...a,
              status: newStatus === 'active' ? 'running' : 'paused',
            }
          : a
      )
    );

    try {
      await automationsApi.update(id, { status: newStatus });
      toast({
        title:
          newStatus === 'active' ? 'Automation Enabled' : 'Automation Paused',
        description: `"${automation.name}" has been ${newStatus === 'active' ? 'enabled' : 'paused'}.`,
      });
    } catch {
      // Rollback on failure
      setAutomations(prev =>
        prev.map(a => (a.id === id ? { ...a, status: automation.status } : a))
      );
      toast({
        variant: 'destructive',
        title: 'Failed to update automation',
        description: 'Please try again.',
      });
    }
  };

  const handleDeleteAutomation = async (id: string) => {
    try {
      await automationsApi.delete(id);
      setAutomations(prev => prev.filter(a => a.id !== id));
      toast({
        title: 'Success',
        description: 'Automation deleted successfully',
      });
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to delete automation',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (dashboardError) {
    return (
      <main className='p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]'>
        <div className='text-center space-y-4 max-w-md'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6 text-destructive'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h2 className='text-lg font-semibold text-foreground'>
            Something went wrong
          </h2>
          <p className='text-sm text-muted-foreground'>{dashboardError}</p>
          <button
            onClick={fetchDashboardData}
            className='inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
              />
            </svg>
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className='p-4 sm:p-6 lg:p-8 space-y-6'>
      {/* System Health Bar - Instant reassurance */}
      <SystemHealthBar
        isConnected={connectedAccount?.isConnected ?? false}
        activeAutomations={activeAutomationCount}
        creditsRemaining={credits.remaining}
        lastActivityTime={lastActivity}
      />

      {/* Quick Insights - Key metrics at a glance */}
      <QuickInsights
        credits={credits}
        todayReplies={todayReplies}
        weeklyGrowth={weeklyGrowth}
        totalLeads={totalLeads}
      />

      {/* Performance Metrics */}
      {performance && <PerformanceMetrics metrics={performance} />}

      {/* Main content grid */}
      <div className='grid gap-6 lg:grid-cols-5'>
        {/* Live Activity Feed - Primary focus (takes more space) */}
        <div className='lg:col-span-3 space-y-6'>
          <RecentActivity
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        </div>

        {/* Automation Summary & Suggestions - Secondary */}
        <div className='lg:col-span-2 space-y-6'>
          <AutomationSummary
            automations={automations}
            onToggle={handleToggleAutomation}
            onDelete={handleDeleteAutomation}
          />
        </div>
      </div>
    </main>
  );
}
