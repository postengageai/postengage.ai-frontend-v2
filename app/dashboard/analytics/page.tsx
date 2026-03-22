'use client';

import { GrowthChart } from '@/components/dashboard/growth-chart';
import { ImpactHero } from '@/components/dashboard/impact-hero';
import { AutomationPerformanceCards } from '@/components/dashboard/automation-performance-cards';
import { PerformanceMetrics } from '@/components/dashboard/performance-metrics';
import { useImpactSummary, useDashboardStats } from '@/lib/hooks';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: impactData, isLoading: impactLoading } = useImpactSummary();
  const { data: dashboardData } = useDashboardStats();

  return (
    <main className='p-4 sm:p-6 lg:p-8 space-y-6 max-w-screen-2xl mx-auto'>
      {/* Header */}
      <div>
        <div className='flex items-center gap-3 mb-1'>
          <BarChart3 className='h-6 w-6 text-primary' />
          <h1 className='text-2xl font-bold text-foreground'>Analytics</h1>
        </div>
        <p className='text-sm text-muted-foreground'>
          Track your growth, engagement, and automation performance over time.
        </p>
      </div>

      {/* Growth Chart — Followers, Engagement Rate, Reach */}
      <GrowthChart />

      {/* PostEngage Impact — Before vs After */}
      <ImpactHero data={impactData} isLoading={impactLoading} />

      {/* Performance Metrics */}
      {dashboardData?.performance && (
        <PerformanceMetrics metrics={dashboardData.performance} />
      )}

      {/* Per-Automation Performance */}
      <AutomationPerformanceCards />
    </main>
  );
}
