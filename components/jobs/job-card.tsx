'use client';

import { format } from 'date-fns';
import { Job } from '@/lib/types/jobs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JobStatusBadge } from './job-status-badge';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobCardProps {
  job: Job;
  onCancel?: (jobId: string) => void;
  isLoading?: boolean;
}

const jobTypeLabels: Record<string, string> = {
  lead_export: 'Lead Export',
  lead_import: 'Lead Import',
  report_generation: 'Report Generation',
  bulk_automation_update: 'Bulk Automation Update',
  account_data_export: 'Account Data Export',
};

export function JobCard({ job, onCancel, isLoading = false }: JobCardProps) {
  const canCancel = job.status === 'queued' || job.status === 'processing';
  const progressPercentage = job.progress > 0 ? job.progress : 0;

  return (
    <Card className='hover:border-primary/50 transition-all'>
      <CardContent className='p-5'>
        <div className='space-y-4'>
          {/* Header */}
          <div className='flex items-start justify-between gap-4'>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-sm font-mono text-muted-foreground truncate'>
                  {job.job_id.slice(0, 8)}...{job.job_id.slice(-4)}
                </span>
                <JobStatusBadge status={job.status} />
              </div>
              <p className='text-sm font-semibold'>
                {jobTypeLabels[job.type] || job.type}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {(job.status === 'processing' || job.status === 'queued') && (
            <div className='space-y-2'>
              <div className='flex items-center justify-between text-xs text-muted-foreground'>
                <span>Processing...</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className='w-full bg-muted rounded-full h-2 overflow-hidden'>
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    job.status === 'processing' ? 'bg-blue-500' : 'bg-amber-500'
                  )}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {job.error && (
            <div className='p-3 rounded-lg bg-red-500/10 border border-red-200/50'>
              <p className='text-xs font-medium text-red-500 mb-1'>
                {job.error.code}
              </p>
              <p className='text-xs text-red-600 line-clamp-2'>
                {job.error.message}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className='grid grid-cols-2 gap-3 text-xs text-muted-foreground'>
            <div>
              <p className='text-muted-foreground/70'>Created</p>
              <p className='font-mono'>
                {format(new Date(job.created_at), 'MMM d, HH:mm')}
              </p>
            </div>
            {job.completed_at && (
              <div>
                <p className='text-muted-foreground/70'>Completed</p>
                <p className='font-mono'>
                  {format(new Date(job.completed_at), 'MMM d, HH:mm')}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          {canCancel && (
            <div className='flex gap-2 pt-2 border-t border-border'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => onCancel?.(job.job_id)}
                disabled={isLoading}
                className='flex-1'
              >
                {isLoading ? (
                  <Loader2 className='h-3.5 w-3.5 animate-spin mr-1.5' />
                ) : (
                  <X className='h-3.5 w-3.5 mr-1.5' />
                )}
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
