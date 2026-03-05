'use client';

import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Check, Pencil, X, Zap, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { VoiceDnaApi } from '@/lib/api/voice-dna';
import type { ContinuousLearningStats } from '@/lib/types/voice-dna';

interface ContinuousLearningDashboardProps {
  voiceDnaId: string;
}

const VELOCITY_CONFIG = {
  fast: {
    label: 'Fast',
    className: 'bg-green-50 text-green-700 border-green-300',
  },
  moderate: {
    label: 'Moderate',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  },
  slow: {
    label: 'Slow',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
  },
};

export function ContinuousLearningDashboard({
  voiceDnaId,
}: ContinuousLearningDashboardProps) {
  const [stats, setStats] = useState<ContinuousLearningStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [voiceDnaId]);

  const fetchStats = async () => {
    try {
      const response = await VoiceDnaApi.getContinuousLearningStats(voiceDnaId);
      if (response?.data) {
        setStats(response.data);
      }
    } catch {
      // Silent
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-32 w-full' />
        <div className='grid gap-3 grid-cols-3'>
          <Skeleton className='h-24' />
          <Skeleton className='h-24' />
          <Skeleton className='h-24' />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className='py-8 text-center'>
          <Brain className='h-8 w-8 text-muted-foreground mx-auto mb-2' />
          <p className='text-sm text-muted-foreground'>
            No learning data yet. Start giving feedback on bot replies to build
            up your Voice DNA.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalFeedback =
    stats.feedback_breakdown.approved +
    stats.feedback_breakdown.edited +
    stats.feedback_breakdown.rejected;

  const progressPercent =
    stats.next_refinement_at_signals > 0
      ? Math.min(
          ((stats.total_feedback_processed % stats.next_refinement_at_signals) /
            stats.next_refinement_at_signals) *
            100,
          100
        )
      : 0;

  const velocityConfig = VELOCITY_CONFIG[stats.learning_velocity];

  return (
    <div className='space-y-4'>
      {/* Learning Progress */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base font-semibold flex items-center gap-2'>
            <Brain className='h-4 w-4' />
            Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-4'>
            {/* Progress Ring */}
            <div className='relative h-20 w-20 shrink-0'>
              <svg className='h-20 w-20 -rotate-90' viewBox='0 0 80 80'>
                <circle
                  cx='40'
                  cy='40'
                  r='35'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='6'
                  className='text-muted/30'
                />
                <circle
                  cx='40'
                  cy='40'
                  r='35'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='6'
                  strokeDasharray={`${progressPercent * 2.2} 220`}
                  strokeLinecap='round'
                  className='text-primary transition-all duration-500'
                />
              </svg>
              <div className='absolute inset-0 flex items-center justify-center'>
                <span className='text-sm font-bold'>
                  {Math.round(progressPercent)}%
                </span>
              </div>
            </div>

            <div className='flex-1 space-y-1'>
              <p className='text-sm font-medium'>
                {stats.total_feedback_processed} signals processed
              </p>
              <p className='text-xs text-muted-foreground'>
                {stats.next_refinement_at_signals > 0
                  ? `${stats.next_refinement_at_signals - (stats.total_feedback_processed % stats.next_refinement_at_signals)} more until next auto-refinement`
                  : 'Auto-refinement ready'}
              </p>
              <div className='flex items-center gap-2 pt-1'>
                <Badge variant='outline' className={velocityConfig.className}>
                  <Zap className='h-3 w-3 mr-1' />
                  {velocityConfig.label} learning
                </Badge>
                <Badge variant='outline' className='text-xs'>
                  <TrendingUp className='h-3 w-3 mr-1' />
                  {stats.auto_refinement_count} refinements
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Breakdown */}
      <div className='grid gap-3 grid-cols-3'>
        <Card>
          <CardContent className='pt-4 pb-3 text-center'>
            <Check className='h-5 w-5 text-green-500 mx-auto mb-1' />
            <p className='text-2xl font-bold text-green-600'>
              {stats.feedback_breakdown.approved}
            </p>
            <p className='text-[10px] text-muted-foreground'>Approved</p>
            {totalFeedback > 0 && (
              <p className='text-[10px] text-muted-foreground'>
                {(
                  (stats.feedback_breakdown.approved / totalFeedback) *
                  100
                ).toFixed(0)}
                %
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-4 pb-3 text-center'>
            <Pencil className='h-5 w-5 text-yellow-500 mx-auto mb-1' />
            <p className='text-2xl font-bold text-yellow-600'>
              {stats.feedback_breakdown.edited}
            </p>
            <p className='text-[10px] text-muted-foreground'>Edited</p>
            {totalFeedback > 0 && (
              <p className='text-[10px] text-muted-foreground'>
                {(
                  (stats.feedback_breakdown.edited / totalFeedback) *
                  100
                ).toFixed(0)}
                %
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-4 pb-3 text-center'>
            <X className='h-5 w-5 text-red-500 mx-auto mb-1' />
            <p className='text-2xl font-bold text-red-600'>
              {stats.feedback_breakdown.rejected}
            </p>
            <p className='text-[10px] text-muted-foreground'>Rejected</p>
            {totalFeedback > 0 && (
              <p className='text-[10px] text-muted-foreground'>
                {(
                  (stats.feedback_breakdown.rejected / totalFeedback) *
                  100
                ).toFixed(0)}
                %
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Examples + Last Refinement */}
      <Card>
        <CardContent className='pt-4 space-y-3'>
          <div className='flex justify-between items-center text-sm'>
            <span className='text-muted-foreground'>Few-Shot Examples</span>
            <span className='font-medium'>{stats.few_shot_examples_count}</span>
          </div>
          <div className='flex justify-between items-center text-sm'>
            <span className='text-muted-foreground'>Negative Examples</span>
            <span className='font-medium'>{stats.negative_examples_count}</span>
          </div>
          {stats.last_refinement_at && (
            <div className='flex justify-between items-center text-sm'>
              <span className='text-muted-foreground flex items-center gap-1'>
                <Clock className='h-3 w-3' /> Last Refinement
              </span>
              <span className='text-xs text-muted-foreground'>
                {new Date(stats.last_refinement_at).toLocaleDateString(
                  'en-US',
                  { month: 'short', day: 'numeric', year: 'numeric' }
                )}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
