'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/jobs/job-card';
import { Job, JobStatus } from '@/lib/types/jobs';
import { JobsApi } from '@/lib/api/jobs';
import { useToast } from '@/hooks/use-toast';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  RefreshCw,
} from 'lucide-react';

const STATUS_FILTERS: { label: string; value: JobStatus }[] = [
  { label: 'Queued', value: 'queued' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
];

export default function JobsPage() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | JobStatus>('all');
  const [cancelingJobId, setCancelingJobId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    queued: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });

  const fetchJobs = useCallback(async () => {
    try {
      const status = activeTab === 'all' ? undefined : activeTab;
      const response = await JobsApi.list({ status, per_page: 100 });

      if (response.data) {
        setJobs(response.data);

        // Calculate stats
        const newStats = {
          total: response.data.length,
          queued: response.data.filter(j => j.status === 'queued').length,
          processing: response.data.filter(j => j.status === 'processing')
            .length,
          completed: response.data.filter(j => j.status === 'completed').length,
          failed: response.data.filter(j => j.status === 'failed').length,
        };
        setStats(newStats);
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load jobs',
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, toast]);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Auto-refresh for processing jobs
  useEffect(() => {
    const hasProcessingJobs = jobs.some(j => j.status === 'processing');
    if (!hasProcessingJobs) return;

    const interval = setInterval(() => {
      setIsRefreshing(true);
      fetchJobs();
      setIsRefreshing(false);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [jobs, fetchJobs]);

  const handleCancel = async (jobId: string) => {
    if (!confirm('Are you sure you want to cancel this job?')) return;

    setCancelingJobId(jobId);
    try {
      await JobsApi.cancel(jobId);
      setJobs(prev => prev.filter(j => j.job_id !== jobId));
      toast({
        title: 'Success',
        description: 'Job cancelled',
      });
      await fetchJobs();
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to cancel job',
      });
    } finally {
      setCancelingJobId(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchJobs();
    setIsRefreshing(false);
  };

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'all') return true;
    return job.status === activeTab;
  });

  return (
    <div className='flex flex-col h-full'>
      {/* Header */}
      <div className='border-b border-border bg-background/95 backdrop-blur-sm p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold mb-1'>Background Jobs</h1>
            <p className='text-muted-foreground'>
              Monitor and manage your background jobs
            </p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
            ) : (
              <RefreshCw className='h-4 w-4 mr-2' />
            )}
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-5 gap-3'>
          <Card className='bg-card/50'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Total
                  </p>
                  <p className='text-2xl font-bold mt-1'>{stats.total}</p>
                </div>
                <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center'>
                  <Zap className='h-5 w-5 text-primary' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card/50'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Queued
                  </p>
                  <p className='text-2xl font-bold mt-1 text-amber-500'>
                    {stats.queued}
                  </p>
                </div>
                <div className='w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center'>
                  <Clock className='h-5 w-5 text-amber-500' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card/50'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Processing
                  </p>
                  <p className='text-2xl font-bold mt-1 text-blue-500'>
                    {stats.processing}
                  </p>
                </div>
                <div className='w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center'>
                  <Activity className='h-5 w-5 text-blue-500' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card/50'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Completed
                  </p>
                  <p className='text-2xl font-bold mt-1 text-emerald-500'>
                    {stats.completed}
                  </p>
                </div>
                <div className='w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center'>
                  <CheckCircle2 className='h-5 w-5 text-emerald-500' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-card/50'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                    Failed
                  </p>
                  <p className='text-2xl font-bold mt-1 text-red-500'>
                    {stats.failed}
                  </p>
                </div>
                <div className='w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center'>
                  <AlertCircle className='h-5 w-5 text-red-500' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className='flex-1 overflow-y-auto p-6'>
        <Tabs
          value={activeTab}
          onValueChange={val => setActiveTab(val as typeof activeTab)}
          className='w-full'
        >
          <TabsList className='mb-6'>
            <TabsTrigger value='all'>All</TabsTrigger>
            {STATUS_FILTERS.map(filter => (
              <TabsTrigger key={filter.value} value={filter.value}>
                {filter.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {['all', ...STATUS_FILTERS.map(f => f.value)].map(tabValue => (
            <TabsContent key={tabValue} value={tabValue} className='space-y-3'>
              {isLoading ? (
                <div className='flex justify-center items-center h-40'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className='space-y-3'>
                  {filteredJobs.map(job => (
                    <JobCard
                      key={job.job_id}
                      job={job}
                      onCancel={handleCancel}
                      isLoading={cancelingJobId === job.job_id}
                    />
                  ))}
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center h-64 text-center'>
                  <Activity className='h-12 w-12 text-muted-foreground/30 mb-4' />
                  <h3 className='font-semibold mb-2'>No jobs found</h3>
                  <p className='text-sm text-muted-foreground'>
                    There are no {activeTab !== 'all' ? activeTab : ''} jobs to
                    display
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
