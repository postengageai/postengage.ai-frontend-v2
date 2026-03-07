'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ResponseQualityMetrics } from '@/lib/types/quality';

interface ConfidenceDistributionProps {
  quality: ResponseQualityMetrics;
}

export function ConfidenceDistribution({
  quality,
}: ConfidenceDistributionProps) {
  const {
    grounded_percentage,
    hallucination_rate,
    retry_rate,
    total_responses,
  } = quality;

  const groundedPct = Math.round(grounded_percentage * 100);
  const hallucinationPct = Math.round(hallucination_rate * 100);
  const retryPct = Math.round(retry_rate * 100);
  const cleanPct = Math.max(0, 100 - hallucinationPct - retryPct);

  const data = [
    { name: 'Grounded', value: groundedPct, color: '#22c55e' },
    { name: 'Clean Pass', value: cleanPct, color: '#3b82f6' },
    { name: 'Retried', value: retryPct, color: '#f97316' },
    { name: 'Hallucinated', value: hallucinationPct, color: '#ef4444' },
  ];

  const overallHealth =
    hallucinationPct <= 5
      ? { label: 'Excellent', color: 'text-green-500' }
      : hallucinationPct <= 15
        ? { label: 'Good', color: 'text-blue-500' }
        : hallucinationPct <= 30
          ? { label: 'Fair', color: 'text-yellow-500' }
          : { label: 'Needs Attention', color: 'text-red-500' };

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle className='text-base'>Response Quality</CardTitle>
        <Badge variant='outline' className={overallHealth.color}>
          {overallHealth.label}
        </Badge>
      </CardHeader>
      <CardContent>
        {total_responses === 0 ? (
          <p className='text-sm text-muted-foreground text-center py-8'>
            No response data available.
          </p>
        ) : (
          <div className='space-y-4'>
            <div className='h-52'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={data} layout='vertical' margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray='3 3' horizontal={false} />
                  <XAxis
                    type='number'
                    domain={[0, 100]}
                    tickFormatter={v => `${v}%`}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type='category'
                    dataKey='name'
                    tick={{ fontSize: 11 }}
                    width={80}
                  />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Share']} />
                  <Bar dataKey='value' radius={[0, 4, 4, 0]}>
                    {data.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className='grid grid-cols-2 gap-3 text-xs'>
              <div className='rounded-md bg-muted/40 px-3 py-2'>
                <p className='text-muted-foreground'>Grounded</p>
                <p className='text-lg font-semibold text-green-500'>
                  {groundedPct}%
                </p>
              </div>
              <div className='rounded-md bg-muted/40 px-3 py-2'>
                <p className='text-muted-foreground'>Hallucinated</p>
                <p className='text-lg font-semibold text-red-500'>
                  {hallucinationPct}%
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
