'use client';

import { useState, useEffect } from 'react';
import { SystemHealthBar } from '@/components/dashboard/system-health-bar';
import { AutomationSummary } from '@/components/dashboard/automation-summary';
import { QuickInsights } from '@/components/dashboard/quick-insights';
// PerformanceMetrics component available if needed
import { DashboardSkeleton } from '@/components/dashboard/skeleton';
import { dashboardApi } from '@/lib/api/dashboard';
import { notificationsApi } from '@/lib/api/notifications';
import { automationsApi } from '@/lib/api/automations';
import { useToast } from '@/components/ui/use-toast';
import type { DashboardStats } from '@/lib/types/dashboard';
import { RecentActivity } from '@/components/dashboard/recent-activity';

export default function DashboardPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );

  const fetchDashboardData = async () => {
    try {
      setDashboardError(null);
      setIsLoading(true);

      const dashboardResponse = await dashboardApi.getStats();
      const data = dashboardResponse.data;

      if (!data) return;

      setDashboardStats(data);
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
    } catch (_error) {
      // Silent error
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
    } catch (_error) {
      // Silent error
    }
  };

  const handleToggleAutomation = async (id: string) => {
    try {
      toast({
        title: 'Automation Status Updated',
        description: `Automation status has been updated for ${id}.`,
      });
      // Refresh dashboard data
      await fetchDashboardData();
    } catch {
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
      toast({
        title: 'Success',
        description: 'Automation deleted successfully',
      });
      // Refresh dashboard data
      await fetchDashboardData();
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
        isConnected={dashboardStats?.connected_account?.status === 'connected'}
        activeAutomations={dashboardStats?.overview?.active_automations ?? 0}
        creditsRemaining={dashboardStats?.overview?.credits_remaining ?? 0}
        lastActivityTime={
          dashboardStats?.recent_activity?.[0]?.created_at
            ? new Date(dashboardStats!.recent_activity![0].created_at)
            : undefined
        }
      />

      {/* Quick Insights - Key metrics at a glance */}
      <QuickInsights
        credits={{
          remaining: dashboardStats?.overview?.credits_remaining ?? 0,
        }}
        todayReplies={dashboardStats?.overview?.credits_used_today ?? 0}
        weeklyGrowth={dashboardStats?.overview?.weekly_growth ?? 0}
        totalLeads={dashboardStats?.overview?.total_leads ?? 0}
      />

      {/* Main content grid */}
      <div className='grid gap-6 lg:grid-cols-5'>
        {/* Live Activity Feed - Primary focus (takes more space) */}
        <div className='lg:col-span-3 space-y-6'>
          <RecentActivity
            notifications={
              dashboardStats?.recent_activity?.map(activity => ({
                id: activity.id,
                type: 'system', // Default or map from activity type
                title: activity.title,
                message: activity.message,
                status: 'unread',
                priority: activity.priority as any,
                created_at: new Date(activity.created_at).toISOString(),
                user_id: activity.user_id,
                updated_at: new Date(activity.updated_at).toISOString(),
                is_broadcast: activity.is_broadcast,
                target_channels: activity.target_channels,
              })) ?? []
            }
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        </div>

        {/* Automation Summary & Suggestions - Secondary */}
        <div className='lg:col-span-2 space-y-6'>
          <AutomationSummary
            automations={[]}
            onToggle={handleToggleAutomation}
            onDelete={handleDeleteAutomation}
          />
        </div>
      </div>
    </main>
  );
}
