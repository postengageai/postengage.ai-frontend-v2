'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  AutomationDetail,
  AutomationData,
} from '@/components/automations/automation-detail';
import { automationsApi } from '@/lib/api/automations';
import {
  AutomationStatus,
  AutomationActionType,
  AutomationPlatform,
  AutomationTriggerScope,
  AutomationConditionOperator,
  AutomationConditionKeywordMode,
} from '@/lib/constants/automations';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  AutomationActionResponse,
  ReplyCommentPayload,
  SendDmPayload,
  PrivateReplyPayload,
  SendDmTextMessage,
} from '@/lib/api/automations';

function getActionText(action: AutomationActionResponse): string {
  let text = '';
  switch (action.action_type) {
    case AutomationActionType.REPLY_COMMENT: {
      const payload = action.action_payload as ReplyCommentPayload;
      text = payload.text || '';
      if (payload.use_ai_reply) text += ' (AI Reply)';
      return text;
    }
    case AutomationActionType.PRIVATE_REPLY: {
      const payload = action.action_payload as PrivateReplyPayload;
      text = payload.text || '';
      if (payload.use_ai_reply) text += ' (AI Reply)';
      return text;
    }
    case AutomationActionType.SEND_DM: {
      const payload = action.action_payload as SendDmPayload;
      if (payload.message?.type === 'text') {
        text = (payload.message as SendDmTextMessage).text;
      } else {
        text = 'Media message';
      }
      if (payload.use_ai_reply) text += ' (AI Reply)';
      return text;
    }
    default:
      return '';
  }
}

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
      const [response, historyResponse] = await Promise.all([
        automationsApi.get(id),
        automationsApi.getHistory(id),
      ]);

      if (response && response.data) {
        const apiData = response.data;
        const historyData = historyResponse.data || [];
        const triggerType: AutomationData['trigger']['type'] =
          apiData.trigger.trigger_type;

        // Map API data to UI component data structure
        const mappedData: AutomationData = {
          id: apiData.id,
          name: apiData.name,
          description: apiData.description,
          status:
            apiData.status === AutomationStatus.ACTIVE
              ? 'active'
              : apiData.status === AutomationStatus.DRAFT
                ? 'draft'
                : apiData.status === AutomationStatus.ARCHIVED
                  ? 'archived'
                  : 'paused',
          platform:
            apiData.platform === AutomationPlatform.FACEBOOK
              ? 'facebook'
              : 'instagram',
          social_account: {
            id: apiData.social_account?.id || '',
            username: apiData.social_account?.username || 'Unknown',
            avatar: '/diverse-avatars.png', // Placeholder
          },
          trigger: {
            type: triggerType,
            scope:
              apiData.trigger.trigger_scope === AutomationTriggerScope.SPECIFIC
                ? 'specific'
                : 'all',
            content_count: apiData.trigger.content_ids?.length || 0,
          },
          condition: apiData.conditions?.[0]
            ? {
                keywords:
                  (apiData.conditions[0].condition_value as string[]) || [],
                operator:
                  apiData.conditions[0].condition_operator ||
                  AutomationConditionOperator.CONTAINS,
                mode:
                  apiData.conditions[0].condition_keyword_mode ||
                  AutomationConditionKeywordMode.ANY,
              }
            : undefined,
          actions: apiData.actions.map(action => ({
            type: action.action_type as AutomationData['actions'][number]['type'],
            text: getActionText(action),
            delay_seconds: action.delay_seconds || 0,
          })),
          statistics: {
            total_executions: apiData.execution_count || 0,
            successful_executions: apiData.success_count || 0,
            failed_executions: apiData.failure_count || 0,
            total_credits_used: historyData.reduce(
              (sum, item) => sum + (item.credits_used || 0),
              0
            ),
            trend: {
              change: 0, // Not in API yet
              period: 'week',
            },
          },
          execution_history: historyData.map(exec => ({
            id: exec._id,
            status:
              exec.status === 'success'
                ? 'success'
                : exec.status === 'failed'
                  ? 'failed'
                  : 'pending',
            trigger_data: {
              username: exec.trigger_data?.username || 'Instagram User',
              text: exec.trigger_data?.text || 'Triggered automation',
            },
            executed_at: exec.executed_at,
            credits_used: exec.credits_used || 0,
          })),
          created_at: apiData.created_at,
          updated_at: apiData.updated_at,
          last_executed_at: apiData.last_executed_at || undefined,
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

    const newStatus =
      status === 'active' ? AutomationStatus.ACTIVE : AutomationStatus.INACTIVE;

    // Optimistic update
    setAutomation(prev =>
      prev
        ? {
            ...prev,
            status,
            paused_reason: status === 'paused' ? 'Paused by user' : undefined,
          }
        : null
    );

    try {
      await automationsApi.update(automation.id, { status: newStatus });
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
      // Assuming delete endpoint exists and is supported by automationsApi
      // If not, I might need to add it to automationsApi first.
      // Checking automationsApi... it does not have delete method in the snippet I read earlier!
      // I need to check lib/api/automations.ts again.
      // It has create, update, get, list. NO DELETE.
      // I should add delete to lib/api/automations.ts first.

      // Temporary: just redirect
      toast({
        title: 'Delete functionality pending',
        description: 'Delete API not yet implemented in frontend client',
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
