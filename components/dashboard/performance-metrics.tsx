'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  MessageCircle,
  MousePointerClick,
  Clock,
} from 'lucide-react';
import type { PerformanceMetrics as IPerformanceMetrics } from '@/lib/types/dashboard';

interface PerformanceMetricsProps {
  metrics: IPerformanceMetrics;
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  const items = [
    {
      title: 'Engagement Rate',
      value: `${metrics.engagement_rate}%`,
      icon: TrendingUp,
      description: 'Interactions per impression',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Reply Rate',
      value: `${metrics.reply_rate}%`,
      icon: MessageCircle,
      description: 'Auto-replies to comments',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Conversion Rate',
      value: `${metrics.conversion_rate}%`,
      icon: MousePointerClick,
      description: 'Click-through from DMs',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Avg Response Time',
      value: `${metrics.average_response_time}s`,
      icon: Clock,
      description: 'Time to auto-reply',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg font-semibold'>Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {items.map(item => (
            <div
              key={item.title}
              className='flex flex-col space-y-2 p-4 rounded-lg border bg-card/50'
            >
              <div className='flex items-center gap-2'>
                <div className={`p-2 rounded-md ${item.bgColor}`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <span className='text-sm font-medium text-muted-foreground'>
                  {item.title}
                </span>
              </div>
              <div className='space-y-1'>
                <span className='text-2xl font-bold'>{item.value}</span>
                <p className='text-xs text-muted-foreground'>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
