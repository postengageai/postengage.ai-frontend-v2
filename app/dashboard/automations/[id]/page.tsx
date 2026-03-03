'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  AutomationDetail,
  AutomationData,
} from '@/components/automations/automation-detail';
import { automationsApi } from '@/lib/api/automations';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function AutomationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [automation, setAutomation] = useState<AutomationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchAutomation(params.id as string);
    }
  }, [params.id]);

  const fetchAutomation = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await automationsApi.get(id);

      if (response && response.data) {
        const apiData = response.data;
        const firstTrigger = apiData.triggers?.[0];

        // Map API data to UI component data structure
        const mappedData: AutomationData = {
          id: apiData.id,
          name: apiData.name,
          description: apiData.description,
          status: apiData.status === 'active' ? 'active' : 'paused',
          platform: (firstTrigger?.platform || 'instagram') as
            | 'instagram'
            | 'facebook',
          social_account: {
            id: firstTrigger?.social_account_id || '',
            username: firstTrigger?.social_account_id || 'Unknown',
            avatar: '/diverse-avatars.png',
          },
          trigger: {
            type: 'new_comment' as const,
            scope: 'all',
            content_count: 0,
          },
          condition: firstTrigger?.conditions?.[0]
            ? {
                keywords: [firstTrigger.conditions[0].value],
                operator: 'contains',
                mode: 'any',
              }
            : undefined,
          actions: (apiData.actions ?? []).map(action => ({
            type: 'send_dm' as const,
            text: JSON.stringify(action.params),
            delay_seconds: action.delay_seconds || 0,
          })),
          statistics: {
            total_executions: apiData.total_runs || 0,
            successful_executions: 0,
            failed_executions: 0,
            total_credits_used: 0,
            trend: {
              change: 0,
              period: 'week',
            },
          },
          execution_history: [],
          created_at: apiData.created_at,
          updated_at: apiData.updated_at,
          last_executed_at: apiData.last_run_at || undefined,
        };

        setAutomation(mappedData);
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load automation details',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (status: 'active' | 'paused') => {
    if (!automation) return;

    // Optimistic update
    setAutomation(prev =>
      prev
        ? {
            ...prev,
            status,
          }
        : null
    );

    try {
      await automationsApi.toggle(automation.id);
      toast({
        title: 'Status updated',
        description: `Automation ${status === 'active' ? 'activated' : 'paused'}`,
      });
    } catch (_error) {
      // Revert on failure (reload data)
      fetchAutomation(automation.id);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update automation status',
      });
    }
  };

  const handleDelete = async () => {
    if (!automation) return;

    try {
      await automationsApi.delete(automation.id);
      toast({
        title: 'Automation deleted',
        description: 'The automation has been successfully deleted.',
      });
      router.push('/dashboard/automations');
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete automation',
      });
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-full min-h-[400px]'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
      </div>
    );
  }

  if (!automation) {
    return (
      <div className='flex flex-col items-center justify-center h-full min-h-[400px]'>
        <h2 className='text-xl font-semibold mb-2'>Automation not found</h2>
        <Button onClick={() => router.push('/dashboard/automations')}>
          Back to Automations
        </Button>
      </div>
    );
  }

  return (
    <AutomationDetail
      automation={automation}
      onStatusChange={handleStatusChange}
      onDelete={handleDelete}
    />
  );
}
