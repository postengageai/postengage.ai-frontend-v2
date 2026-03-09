'use client';

import {
  Shield,
  MessageSquare,
  Target,
  Gauge,
  CheckCircle,
  Clock,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { ResponseQualityMetrics } from '@/lib/types/quality';

interface QualityScorecardProps {
  quality: ResponseQualityMetrics;
  showAdvanced?: boolean;
}

function getHealthStatus(metrics: ResponseQualityMetrics) {
  const confidence = metrics.avg_confidence;
  const hallucination = metrics.hallucination_rate;

  if (confidence >= 0.75 && hallucination < 0.05) {
    return {
      label: 'Good',
      color: 'bg-green-100 text-green-700 border-green-300',
    };
  }
  if (confidence >= 0.5 && hallucination < 0.1) {
    return {
      label: 'Fair',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    };
  }
  return {
    label: 'Poor',
    color: 'bg-red-100 text-red-700 border-red-300',
  };
}

export function QualityScorecard({
  quality,
  showAdvanced = false,
}: QualityScorecardProps) {
  const health = getHealthStatus(quality);
  const engagementRate =
    quality.total_responses > 0
      ? ((quality.total_responses -
          quality.total_responses * quality.retry_rate) /
          quality.total_responses) *
        100
      : 0;

  return (
    <div className='space-y-4'>
      {/* Simple View — 3 cards */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Bot Health</CardTitle>
            <Shield className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <Badge variant='outline' className={health.color}>
              {health.label}
            </Badge>
            <p className='text-xs text-muted-foreground mt-2'>
              Based on confidence &amp; hallucination rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Total Replies</CardTitle>
            <MessageSquare className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {quality.total_responses.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Engagement Rate
            </CardTitle>
            <Target className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {engagementRate.toFixed(1)}%
            </div>
            <Progress value={engagementRate} className='mt-2 h-1.5' />
          </CardContent>
        </Card>
      </div>

      {/* Advanced View — 5 extra metric cards */}
      {showAdvanced && (
        <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-5'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-xs font-medium'>
                Avg Confidence
              </CardTitle>
              <Gauge className='h-3.5 w-3.5 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-xl font-bold'>
                {(quality.avg_confidence * 100).toFixed(1)}%
              </div>
              <Progress
                value={quality.avg_confidence * 100}
                className='mt-1 h-1'
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-xs font-medium'>Grounded %</CardTitle>
              <CheckCircle className='h-3.5 w-3.5 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-xl font-bold'>
                {quality.grounded_percentage.toFixed(1)}%
              </div>
              <Progress
                value={quality.grounded_percentage}
                className='mt-1 h-1 [&>div]:bg-green-500'
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-xs font-medium'>
                Hallucination
              </CardTitle>
              <AlertTriangle className='h-3.5 w-3.5 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div
                className={`text-xl font-bold ${
                  quality.hallucination_rate > 0.05
                    ? 'text-red-500'
                    : 'text-green-500'
                }`}
              >
                {(quality.hallucination_rate * 100).toFixed(2)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-xs font-medium'>
                Avg Gen Time
              </CardTitle>
              <Clock className='h-3.5 w-3.5 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-xl font-bold'>
                {quality.avg_generation_time_ms < 1000
                  ? `${quality.avg_generation_time_ms}ms`
                  : `${(quality.avg_generation_time_ms / 1000).toFixed(1)}s`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-xs font-medium'>Retry Rate</CardTitle>
              <RotateCcw className='h-3.5 w-3.5 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div
                className={`text-xl font-bold ${
                  quality.retry_rate > 0.1
                    ? 'text-orange-500'
                    : 'text-green-500'
                }`}
              >
                {(quality.retry_rate * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
