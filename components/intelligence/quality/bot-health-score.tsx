'use client';

import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { BotHealthScore, BotHealthLevel } from '@/lib/types/quality';

interface BotHealthScoreDisplayProps {
  health: BotHealthScore;
}

const healthConfig: Record<
  BotHealthLevel,
  { bgColor: string; textColor: string; ringColor: string; label: string }
> = {
  good: {
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    ringColor: 'ring-green-300',
    label: 'Good',
  },
  fair: {
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    ringColor: 'ring-yellow-300',
    label: 'Fair',
  },
  poor: {
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    ringColor: 'ring-red-300',
    label: 'Poor',
  },
};

const factorIcons = {
  good: <CheckCircle className='h-3.5 w-3.5 text-green-500' />,
  warning: <AlertTriangle className='h-3.5 w-3.5 text-yellow-500' />,
  issue: <XCircle className='h-3.5 w-3.5 text-red-500' />,
};

const factorTooltips: Record<string, string> = {
  'Response Quality': 'Measures how well the bot generates appropriate replies',
  Accuracy: 'Tracks grounding accuracy and hallucination rate',
  Engagement: 'Monitors user interaction and response effectiveness',
};

export function BotHealthScoreDisplay({ health }: BotHealthScoreDisplayProps) {
  const config = healthConfig[health.level] || healthConfig.fair;

  return (
    <div className='flex items-center gap-4'>
      {/* Score Circle */}
      <div
        className={`h-16 w-16 rounded-full ${config.bgColor} ring-2 ${config.ringColor} flex items-center justify-center shrink-0`}
      >
        <span className={`text-2xl font-bold ${config.textColor}`}>
          {health.score}
        </span>
      </div>

      <div className='space-y-2'>
        <Badge
          variant='outline'
          className={`${config.bgColor} ${config.textColor} border-current`}
        >
          {config.label}
        </Badge>

        {/* Factor pills */}
        <TooltipProvider>
          <div className='flex flex-wrap gap-1.5'>
            {health.factors.map(factor => (
              <Tooltip key={factor.label}>
                <TooltipTrigger>
                  <div className='flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs'>
                    {factorIcons[factor.status]}
                    <span>{factor.label}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className='text-xs'>
                    {factorTooltips[factor.label] || factor.label}
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        <p className='text-[10px] text-muted-foreground'>
          Updated{' '}
          {new Date(health.last_updated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
