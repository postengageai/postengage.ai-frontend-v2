'use client';

import Link from 'next/link';
import { Zap, Users, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { TrendStatCard } from './trend-stat-card';
import { useConversationChart } from '@/lib/hooks';

interface QuickInsightsProps {
  credits: {
    remaining: number;
  };
  autoReplyRate: number;
  totalLeads: number;
  timeSavedWeekHours: number;
  uniquePeopleEngaged: number;
  weeklyGrowth: number;
}

function buildSparkFromChart(
  chartData: { conversations: number; auto_reply_rate: number }[] | undefined,
  key: 'conversations' | 'auto_reply_rate'
): number[] | undefined {
  if (!chartData || chartData.length === 0) return undefined;
  return chartData.map(d => d[key]);
}

export function QuickInsights({
  credits,
  autoReplyRate,
  totalLeads,
  timeSavedWeekHours,
  uniquePeopleEngaged,
  weeklyGrowth,
}: QuickInsightsProps) {
  const { data: chartData } = useConversationChart(7);
  const isLowCredits = credits.remaining < 50;

  const conversationSpark = buildSparkFromChart(chartData, 'conversations');
  const autoReplySpark = buildSparkFromChart(chartData, 'auto_reply_rate');

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
      {/* Auto-Reply Rate */}
      <TrendStatCard
        label='Auto-Reply Rate'
        value={`${autoReplyRate}%`}
        subValue='of eligible messages replied'
        delta={weeklyGrowth}
        deltaLabel='vs last week'
        sparkData={autoReplySpark}
        sparkColor='#22c55e'
        icon={<MessageSquare className='h-4 w-4' />}
        accentColor='green'
      />

      {/* Leads Captured */}
      <TrendStatCard
        label='Leads Captured'
        value={totalLeads}
        subValue='total leads'
        sparkData={conversationSpark}
        icon={<Users className='h-4 w-4' />}
        accentColor='blue'
      />

      {/* Time Saved */}
      <TrendStatCard
        label='Time Saved'
        value={`~${timeSavedWeekHours}h`}
        subValue='saved this week'
        sparkData={conversationSpark}
        sparkColor='#a78bfa'
        icon={<Clock className='h-4 w-4' />}
        accentColor='violet'
      />

      {/* Credits Left */}
      <TrendStatCard
        label='Credits Left'
        value={credits.remaining}
        sparkData={autoReplySpark}
        sparkColor={isLowCredits ? '#f97316' : '#3b82f6'}
        subValue={
          isLowCredits ? (
            <Link
              href='/dashboard/credits'
              className='text-warning hover:underline'
            >
              Running low — top up
            </Link>
          ) : (
            `${uniquePeopleEngaged} people this month`
          )
        }
        icon={
          isLowCredits ? (
            <AlertCircle className='h-4 w-4' />
          ) : (
            <Zap className='h-4 w-4' />
          )
        }
        accentColor={isLowCredits ? 'orange' : 'blue'}
      />
    </div>
  );
}
