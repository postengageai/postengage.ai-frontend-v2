'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DiversityMetrics } from '@/lib/types/quality';

interface DiversityChartProps {
  diversity: DiversityMetrics;
}

const DIVERSITY_TARGET = 85;

export function DiversityChart({ diversity }: DiversityChartProps) {
  const {
    unique_reply_percentage,
    diversity_score,
    most_repeated_phrases,
    diversity_trend,
  } = diversity;

  const aboveTarget = unique_reply_percentage >= DIVERSITY_TARGET;

  return (
    <div className='space-y-4'>
      {/* Diversity Score Card */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Reply Diversity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-baseline gap-2'>
              <span className='text-3xl font-bold'>
                {unique_reply_percentage.toFixed(1)}%
              </span>
              <span className='text-sm text-muted-foreground'>
                unique replies
              </span>
            </div>
            <Badge
              variant='outline'
              className={`mt-2 ${
                aboveTarget
                  ? 'bg-green-50 text-green-700 border-green-300'
                  : 'bg-orange-50 text-orange-700 border-orange-300'
              }`}
            >
              {aboveTarget ? 'Above' : 'Below'} target ({DIVERSITY_TARGET}%)
            </Badge>
            <div className='mt-3 text-xs text-muted-foreground'>
              Semantic diversity score:{' '}
              <span className='font-medium'>
                {(diversity_score * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Diversity Trend */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Diversity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {diversity_trend.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-6'>
                Not enough data for trend.
              </p>
            ) : (
              <div className='h-44'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={diversity_trend}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='date' tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value.toFixed(1)}%`,
                        'Unique %',
                      ]}
                    />
                    <ReferenceLine
                      y={DIVERSITY_TARGET}
                      stroke='#22c55e'
                      strokeDasharray='5 5'
                      label={{
                        value: 'Target',
                        position: 'right',
                        fontSize: 10,
                      }}
                    />
                    <Area
                      type='monotone'
                      dataKey='score'
                      stroke='#8b5cf6'
                      fill='#8b5cf6'
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Most Repeated Phrases */}
      {most_repeated_phrases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Most Repeated Phrases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='border rounded-lg overflow-hidden'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-muted/40 hover:bg-muted/40'>
                    <TableHead>Phrase</TableHead>
                    <TableHead className='text-right w-24'>Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {most_repeated_phrases.slice(0, 10).map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className='text-sm'>
                        &ldquo;{item.phrase}&rdquo;
                      </TableCell>
                      <TableCell className='text-right font-medium'>
                        {item.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
