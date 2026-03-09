'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResponseActionsProps {
  actions: {
    auto_replied: number;
    held_for_approval: number;
    escalated: number;
    skipped: number;
    safe_template_used: number;
  };
}

const ACTION_COLORS: Record<string, string> = {
  'Auto Replied': '#22c55e',
  'Held for Approval': '#eab308',
  Escalated: '#f97316',
  Skipped: '#9ca3af',
  'Safe Template': '#3b82f6',
};

export function ResponseActions({ actions }: ResponseActionsProps) {
  const data = [
    { name: 'Auto Replied', value: actions.auto_replied },
    { name: 'Held for Approval', value: actions.held_for_approval },
    { name: 'Escalated', value: actions.escalated },
    { name: 'Skipped', value: actions.skipped },
    { name: 'Safe Template', value: actions.safe_template_used },
  ].filter(d => d.value > 0);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Response Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className='text-sm text-muted-foreground text-center py-8'>
            No response action data available yet.
          </p>
        ) : (
          <div className='flex flex-col md:flex-row items-center gap-6'>
            <div className='h-64 w-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={data}
                    cx='50%'
                    cy='50%'
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey='value'
                  >
                    {data.map(entry => (
                      <Cell
                        key={entry.name}
                        fill={ACTION_COLORS[entry.name] || '#6b7280'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} (${((value / total) * 100).toFixed(1)}%)`,
                      name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className='flex-1 space-y-2'>
              {data.map(item => (
                <div
                  key={item.name}
                  className='flex items-center justify-between text-sm'
                >
                  <div className='flex items-center gap-2'>
                    <div
                      className='h-3 w-3 rounded-full'
                      style={{
                        backgroundColor: ACTION_COLORS[item.name] || '#6b7280',
                      }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className='font-medium'>{item.value}</span>
                    <span className='text-xs text-muted-foreground w-12 text-right'>
                      {((item.value / total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
