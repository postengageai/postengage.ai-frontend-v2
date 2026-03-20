'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Mic2,
  Layers,
  BarChart2,
  Clock,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { VoiceDnaApi } from '@/lib/api/voice-dna';
import type { VoiceDnaMetrics } from '@/lib/types/voice-dna';

interface VoiceDnaMetricsCardProps {
  voiceDnaId: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function confidenceBadgeVariant(
  level: VoiceDnaMetrics['confidence_level']
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (level === 'high') return 'default';
  if (level === 'medium') return 'secondary';
  return 'outline';
}

function confidenceLabel(level: VoiceDnaMetrics['confidence_level']): string {
  if (level === 'high') return 'High confidence';
  if (level === 'medium') return 'Medium confidence';
  return 'Low confidence';
}

function driftBadge(drift: string): { label: string; color: string } {
  if (drift === 'significant_drift')
    return {
      label: 'Voice drift detected',
      color: 'text-orange-600 dark:text-orange-400',
    };
  return { label: 'Healthy', color: 'text-green-600 dark:text-green-400' };
}

function vqsColor(score: number): string {
  if (score >= 70) return 'text-green-600 dark:text-green-400';
  if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-500 dark:text-red-400';
}

// ── Component ──────────────────────────────────────────────────────────────

export function VoiceDnaMetricsCard({ voiceDnaId }: VoiceDnaMetricsCardProps) {
  const [metrics, setMetrics] = useState<VoiceDnaMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await VoiceDnaApi.getMetrics(voiceDnaId);
        if (response?.data) setMetrics(response.data);
      } catch {
        setError('Could not load metrics');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [voiceDnaId]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className='py-8 flex items-center justify-center'>
          <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card>
        <CardContent className='py-6 flex items-center gap-2 text-muted-foreground'>
          <AlertTriangle className='h-4 w-4 shrink-0' />
          <span className='text-sm'>{error ?? 'Metrics unavailable'}</span>
        </CardContent>
      </Card>
    );
  }

  const drift = driftBadge(metrics.drift_status);
  const lastAnalyzed = metrics.last_analyzed_at
    ? new Date(metrics.last_analyzed_at).toLocaleDateString()
    : 'Never';

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base font-semibold flex items-center gap-2'>
            <Activity className='h-4 w-4' />
            Voice Health
          </CardTitle>
          <div className='flex items-center gap-1.5'>
            {metrics.drift_status === 'significant_drift' ? (
              <AlertTriangle className='h-4 w-4 text-orange-500' />
            ) : (
              <CheckCircle2 className='h-4 w-4 text-green-500' />
            )}
            <span className={`text-xs font-medium ${drift.color}`}>
              {drift.label}
            </span>
          </div>
        </div>
        <CardDescription>Real-time quality snapshot</CardDescription>
      </CardHeader>

      <CardContent className='space-y-5'>
        {/* Voice Quality Score — hero metric */}
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
              <BarChart2 className='h-3.5 w-3.5' />
              Voice Quality Score
            </span>
            <span
              className={`text-2xl font-bold tabular-nums ${vqsColor(metrics.voice_quality_score)}`}
            >
              {metrics.voice_quality_score}
              <span className='text-sm font-normal text-muted-foreground'>
                /100
              </span>
            </span>
          </div>
          <Progress value={metrics.voice_quality_score} className='h-2' />
        </div>

        {/* Voice Consistency Score */}
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground flex items-center gap-1.5'>
              <Mic2 className='h-3.5 w-3.5' />
              Consistency Score
            </span>
            <span className='text-sm font-semibold tabular-nums'>
              {Math.round(metrics.voice_consistency_score * 100)}%
            </span>
          </div>
          <Progress
            value={Math.round(metrics.voice_consistency_score * 100)}
            className='h-2'
          />
        </div>

        {/* Confidence + example pool */}
        <div className='grid grid-cols-2 gap-3 pt-1'>
          <div className='rounded-lg bg-muted/40 p-3 space-y-1'>
            <div className='flex items-center gap-1.5 text-muted-foreground'>
              <Layers className='h-3.5 w-3.5' />
              <span className='text-xs'>Example Pool</span>
            </div>
            <p className='text-xl font-bold'>{metrics.examples_in_pool}</p>
            <p className='text-xs text-muted-foreground'>
              {metrics.high_quality_examples} high quality
            </p>
          </div>

          <div className='rounded-lg bg-muted/40 p-3 space-y-1'>
            <div className='flex items-center gap-1.5 text-muted-foreground'>
              <Activity className='h-3.5 w-3.5' />
              <span className='text-xs'>Confidence</span>
            </div>
            <Badge
              variant={confidenceBadgeVariant(metrics.confidence_level)}
              className='text-xs capitalize'
            >
              {metrics.confidence_level}
            </Badge>
            <p className='text-xs text-muted-foreground'>
              {confidenceLabel(metrics.confidence_level)}
            </p>
          </div>
        </div>

        {/* Footer stats */}
        <div className='flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t text-xs text-muted-foreground'>
          <span>{metrics.total_training_samples} training samples</span>
          <span>{metrics.total_feedback_signals} feedback signals</span>
          <span>{metrics.daily_refresh_count}× daily refreshed</span>
          <span className='flex items-center gap-1'>
            <Clock className='h-3 w-3' />
            Last analyzed {lastAnalyzed}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
