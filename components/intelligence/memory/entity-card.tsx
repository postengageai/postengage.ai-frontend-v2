'use client';

import {
  User,
  Heart,
  Flag,
  HelpCircle,
  ShoppingBag,
  Calendar,
  DollarSign,
  Handshake,
  Tag,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { MemoryEntity, EntityType } from '@/lib/types/memory';

interface EntityCardProps {
  entity: MemoryEntity;
}

const entityTypeConfig: Record<
  EntityType,
  { icon: React.ElementType; label: string; color: string }
> = {
  user_name: { icon: User, label: 'Name', color: 'text-blue-500' },
  preference: { icon: Heart, label: 'Preference', color: 'text-pink-500' },
  commitment: { icon: Handshake, label: 'Commitment', color: 'text-green-500' },
  question_asked: {
    icon: HelpCircle,
    label: 'Question',
    color: 'text-yellow-500',
  },
  product_interest: {
    icon: ShoppingBag,
    label: 'Product Interest',
    color: 'text-purple-500',
  },
  objection: { icon: Flag, label: 'Objection', color: 'text-red-500' },
  timeline: { icon: Calendar, label: 'Timeline', color: 'text-cyan-500' },
  budget: { icon: DollarSign, label: 'Budget', color: 'text-emerald-500' },
  custom: { icon: Tag, label: 'Custom', color: 'text-gray-500' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isExpiringSoon(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000; // 7 days
}

export function EntityCard({ entity }: EntityCardProps) {
  const config = entityTypeConfig[entity.type] || entityTypeConfig.custom;
  const Icon = config.icon;
  const confidencePercent = Math.round(entity.confidence * 100);
  const expiring = isExpiringSoon(entity.expires_at);

  return (
    <div className='rounded-lg border p-3 space-y-2 bg-card hover:shadow-sm transition-shadow'>
      <div className='flex items-start justify-between gap-2'>
        <div className='flex items-center gap-2 min-w-0'>
          <Icon className={`h-4 w-4 shrink-0 ${config.color}`} />
          <span className='text-xs font-medium text-muted-foreground truncate'>
            {entity.key}
          </span>
        </div>
        <Badge
          variant='outline'
          className={`text-[10px] shrink-0 ${
            entity.source === 'llm'
              ? 'bg-purple-50 text-purple-600 border-purple-200'
              : entity.source === 'deterministic'
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'
          }`}
        >
          {entity.source}
        </Badge>
      </div>

      <p className='text-sm font-medium truncate' title={entity.value}>
        {entity.value}
      </p>

      <div className='space-y-1'>
        <div className='flex justify-between text-[10px] text-muted-foreground'>
          <span>Confidence</span>
          <span
            className={`font-medium ${
              confidencePercent >= 80
                ? 'text-green-600'
                : confidencePercent >= 50
                  ? 'text-yellow-600'
                  : 'text-red-600'
            }`}
          >
            {confidencePercent}%
          </span>
        </div>
        <Progress
          value={confidencePercent}
          className={`h-1 ${
            confidencePercent >= 80
              ? '[&>div]:bg-green-500'
              : confidencePercent >= 50
                ? '[&>div]:bg-yellow-500'
                : '[&>div]:bg-red-500'
          }`}
        />
      </div>

      <div className='flex items-center justify-between text-[10px] text-muted-foreground'>
        <span>Updated {formatDate(entity.last_updated_at)}</span>
        {expiring && (
          <span className='text-orange-500 font-medium'>Expiring soon</span>
        )}
      </div>
    </div>
  );
}
