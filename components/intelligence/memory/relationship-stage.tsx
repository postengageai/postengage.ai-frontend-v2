'use client';

import { Badge } from '@/components/ui/badge';
import type { RelationshipStage } from '@/lib/types/memory';

interface RelationshipStageBadgeProps {
  stage: RelationshipStage;
  className?: string;
}

const stageConfig: Record<
  RelationshipStage,
  { label: string; className: string }
> = {
  new: {
    label: 'New',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  engaged: {
    label: 'Engaged',
    className: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  loyal: {
    label: 'Loyal',
    className: 'bg-green-100 text-green-700 border-green-300',
  },
  at_risk: {
    label: 'At Risk',
    className: 'bg-orange-100 text-orange-700 border-orange-300',
  },
  churned: {
    label: 'Churned',
    className: 'bg-red-100 text-red-700 border-red-300',
  },
};

export function RelationshipStageBadge({
  stage,
  className,
}: RelationshipStageBadgeProps) {
  const config = stageConfig[stage] || stageConfig.new;

  return (
    <Badge
      variant='outline'
      className={`${config.className} ${className || ''}`}
    >
      {config.label}
    </Badge>
  );
}
