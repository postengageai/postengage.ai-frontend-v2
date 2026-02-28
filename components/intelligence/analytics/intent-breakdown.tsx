'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { IntentAnalytics } from '@/lib/types/quality';

interface IntentBreakdownProps {
  intents: IntentAnalytics;
}

const INTENT_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f97316',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#eab308',
  '#ef4444',
  '#14b8a6',
  '#6366f1',
];

function getIntentColor(index: number): string {
  return INTENT_COLORS[index % INTENT_COLORS.length];
}

export function IntentBreakdown({ intents }: IntentBreakdownProps) {
  const { intent_distribution, intent_trend } = intents;
  const totalCount = intent_distribution.reduce((sum, d) => sum + d.count, 0);

  // Flatten trend data for stacked area
  const allIntents = [...new Set(intent_distribution.map(d => d.intent))];
  const trendData = intent_trend.map(t => ({
    date: t.date,
    ...t.intents,
  }));

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      {/* Donut Chart */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Intent Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {intent_distribution.length === 0 ? (
            <p className='text-sm text-muted-foreground text-center py-8'>
              No intent data available yet.
            </p>
          ) : (
            <div className='h-72'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={intent_distribution}
                    cx='50%'
                    cy='50%'
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey='count'
                    nameKey='intent'
                    label={({ intent, percentage }) =>
                      `${intent} ${percentage.toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {intent_distribution.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getIntentColor(index)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} (${((value / totalCount) * 100).toFixed(1)}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stacked Area Trend */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Intent Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length === 0 ? (
            <p className='text-sm text-muted-foreground text-center py-8'>
              Not enough data for trend analysis.
            </p>
          ) : (
            <div className='h-72'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  {allIntents.map((intent, index) => (
                    <Area
                      key={intent}
                      type='monotone'
                      dataKey={intent}
                      stackId='1'
                      fill={getIntentColor(index)}
                      stroke={getIntentColor(index)}
                      fillOpacity={0.6}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
