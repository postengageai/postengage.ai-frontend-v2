'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ResponseQualityMetrics } from '@/lib/types/quality';

interface ConfidenceDistributionProps {
  quality: ResponseQualityMetrics;
}

const BUCKET_COLORS = {
  'Very Low (0-30%)': '#ef4444',
  'Low (30-50%)': '#f97316',
  'Medium (50-80%)': '#eab308',
  'High (80-100%)': '#22c55e',
};

export function ConfidenceDistribution({
  quality,
}: ConfidenceDistributionProps) {
  const { confidence_distribution, avg_confidence, total_responses } = quality;

  const data = [
    {
      name: 'Very Low (0-30%)',
      count: confidence_distribution.very_low,
      color: BUCKET_COLORS['Very Low (0-30%)'],
    },
    {
      name: 'Low (30-50%)',
      count: confidence_distribution.low,
      color: BUCKET_COLORS['Low (30-50%)'],
    },
    {
      name: 'Medium (50-80%)',
      count: confidence_distribution.medium,
      color: BUCKET_COLORS['Medium (50-80%)'],
    },
    {
      name: 'High (80-100%)',
      count: confidence_distribution.high,
      color: BUCKET_COLORS['High (80-100%)'],
    },
  ];

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle className='text-base'>Confidence Distribution</CardTitle>
        <Badge variant='outline'>
          Avg: {(avg_confidence * 100).toFixed(1)}%
        </Badge>
      </CardHeader>
      <CardContent>
        {total_responses === 0 ? (
          <p className='text-sm text-muted-foreground text-center py-8'>
            No response data available.
          </p>
        ) : (
          <div className='h-64'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='name' tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [
                    `${value} (${((value / total_responses) * 100).toFixed(1)}%)`,
                    'Responses',
                  ]}
                />
                <ReferenceLine
                  y={total_responses / 4}
                  stroke='#6b7280'
                  strokeDasharray='5 5'
                  label={{ value: 'Avg', fontSize: 10 }}
                />
                <Bar dataKey='count' radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
