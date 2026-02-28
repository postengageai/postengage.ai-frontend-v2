'use client';

import { Users, Database, Layers, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RelationshipStageBadge } from './relationship-stage';
import type { MemoryStats } from '@/lib/types/memory';
import type { RelationshipStage } from '@/lib/types/memory';

interface MemoryStatsOverviewProps {
  stats: MemoryStats;
}

const stageColors: Record<RelationshipStage, string> = {
  new: 'bg-gray-400',
  engaged: 'bg-blue-500',
  loyal: 'bg-green-500',
  at_risk: 'bg-orange-500',
  churned: 'bg-red-500',
};

export function MemoryStatsOverview({ stats }: MemoryStatsOverviewProps) {
  const totalStaged = Object.values(stats.relationship_stage_breakdown).reduce(
    (sum, v) => sum + v,
    0
  );

  const tierTotal =
    stats.memory_tier_usage.working_memory_keys +
    stats.memory_tier_usage.conversation_summaries +
    stats.memory_tier_usage.relationship_memories;

  return (
    <div className='space-y-4'>
      {/* Stat Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Users Tracked</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.total_users_tracked.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Entities Stored
            </CardTitle>
            <Database className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.total_entities_stored.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Avg Entities/User
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats.avg_entities_per_user.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Memory Tiers</CardTitle>
            <Layers className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex justify-between text-xs'>
                <span className='text-muted-foreground'>Working</span>
                <span className='font-medium'>
                  {stats.memory_tier_usage.working_memory_keys}
                </span>
              </div>
              <div className='flex justify-between text-xs'>
                <span className='text-muted-foreground'>Conversations</span>
                <span className='font-medium'>
                  {stats.memory_tier_usage.conversation_summaries}
                </span>
              </div>
              <div className='flex justify-between text-xs'>
                <span className='text-muted-foreground'>Relationships</span>
                <span className='font-medium'>
                  {stats.memory_tier_usage.relationship_memories}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relationship Stage Distribution */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm font-medium'>
            Relationship Stages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalStaged > 0 ? (
            <div className='space-y-3'>
              {/* Stacked bar */}
              <div className='flex h-3 rounded-full overflow-hidden'>
                {(
                  Object.entries(stats.relationship_stage_breakdown) as [
                    RelationshipStage,
                    number,
                  ][]
                ).map(([stage, count]) =>
                  count > 0 ? (
                    <div
                      key={stage}
                      className={`${stageColors[stage]} transition-all`}
                      style={{ width: `${(count / totalStaged) * 100}%` }}
                      title={`${stage}: ${count}`}
                    />
                  ) : null
                )}
              </div>

              {/* Legend */}
              <div className='flex flex-wrap gap-3'>
                {(
                  Object.entries(stats.relationship_stage_breakdown) as [
                    RelationshipStage,
                    number,
                  ][]
                ).map(([stage, count]) => (
                  <div key={stage} className='flex items-center gap-2 text-xs'>
                    <RelationshipStageBadge stage={stage} />
                    <span className='font-medium'>{count}</span>
                  </div>
                ))}
              </div>

              {/* Memory tier progress */}
              {tierTotal > 0 && (
                <div className='pt-2 space-y-2'>
                  <p className='text-xs text-muted-foreground font-medium'>
                    Memory Distribution
                  </p>
                  {[
                    {
                      label: 'Working Memory',
                      value: stats.memory_tier_usage.working_memory_keys,
                      color: '[&>div]:bg-blue-500',
                    },
                    {
                      label: 'Conversations',
                      value: stats.memory_tier_usage.conversation_summaries,
                      color: '[&>div]:bg-purple-500',
                    },
                    {
                      label: 'Relationships',
                      value: stats.memory_tier_usage.relationship_memories,
                      color: '[&>div]:bg-green-500',
                    },
                  ].map(tier => (
                    <div key={tier.label} className='space-y-1'>
                      <div className='flex justify-between text-xs'>
                        <span className='text-muted-foreground'>
                          {tier.label}
                        </span>
                        <span className='font-medium'>{tier.value}</span>
                      </div>
                      <Progress
                        value={(tier.value / tierTotal) * 100}
                        className={`h-1.5 ${tier.color}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground text-center py-4'>
              No relationship data yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
