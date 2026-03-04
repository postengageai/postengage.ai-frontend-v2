'use client';

import { JobStatus } from '@/lib/types/jobs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

const statusConfig: Record<JobStatus, { color: string; label: string }> = {
  queued: {
    color: 'bg-amber-500/10 text-amber-500 border-amber-200/50',
    label: 'Queued',
  },
  processing: {
    color: 'bg-blue-500/10 text-blue-500 border-blue-200/50',
    label: 'Processing',
  },
  completed: {
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-200/50',
    label: 'Completed',
  },
  failed: {
    color: 'bg-red-500/10 text-red-500 border-red-200/50',
    label: 'Failed',
  },
  cancelled: {
    color: 'bg-slate-500/10 text-slate-500 border-slate-200/50',
    label: 'Cancelled',
  },
};

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant='outline'
      className={cn(config.color, 'text-xs font-medium', className)}
    >
      {config.label}
    </Badge>
  );
}
