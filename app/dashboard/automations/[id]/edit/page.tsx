'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AutomationFormPage } from '@/components/automations/automation-form-page';
import type { AutomationFormData } from '@/components/automations/automation-form-page';
import {
  automationsApi,
  AutomationsApi,
  type CreateAutomationRequest,
  type Automation,
  type AutomationActionPayload,
  type SendDmPayload,
  type ReplyCommentPayload,
  type PrivateReplyPayload,
  type SendDmTextMessage,
  type SendDmTextPayload,
  type SendDmMediaMessage,
  type SendDmMediaPayload,
} from '@/lib/api/automations';
import {
  AutomationPlatform,
  AutomationTriggerType,
  AutomationTriggerSource,
  AutomationTriggerScope,
  AutomationConditionOperator,
  AutomationConditionKeywordMode,
  AutomationConditionSource,
  AutomationActionType,
  AutomationStatus,
  type AutomationPlatformType,
  type AutomationTriggerTypeType,
  type AutomationTriggerSourceType,
  type AutomationTriggerScopeType,
  type AutomationConditionOperatorType,
  type AutomationConditionKeywordModeType,
  type AutomationConditionSourceType,
  type AutomationActionTypeType,
  type AutomationStatusType,
} from '@/lib/constants/automations';
import { parseApiError } from '@/lib/http/errors';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

function parseEnum<T>(
  value: unknown,
  enumValues: Record<string, T>,
  defaultValue: T
): T {
  if (!value || typeof value !== 'string') return defaultValue;
  const normalizedValue = value.toLowerCase();
  const match = Object.values(enumValues).find(
    v => (v as string).toLowerCase() === normalizedValue
  );
  return match || defaultValue;
}

function apiToFormData(apiData: Automation): AutomationFormData {
  return {
    platform: parseEnum<AutomationPlatformType>(
      apiData.platform,
      AutomationPlatform,
      AutomationPlatform.INSTAGRAM
    ),
    social_account_id: apiData.social_account?.id || '',
    social_account_name: apiData.social_account?.username,
    trigger_type: parseEnum<AutomationTriggerTypeType>(
      apiData.trigger?.trigger_type,
      AutomationTriggerType,
      AutomationTriggerType.NEW_COMMENT
    ),
    trigger_source: parseEnum<AutomationTriggerSourceType>(
      apiData.trigger?.trigger_source,
      AutomationTriggerSource,
      AutomationTriggerSource.POST
    ),
    trigger_scope: parseEnum<AutomationTriggerScopeType>(
      apiData.trigger?.trigger_scope,
      AutomationTriggerScope,
      AutomationTriggerScope.ALL
    ),
    content_ids: apiData.trigger?.content_ids,
    condition: apiData.conditions?.[0]
      ? {
          condition_type: 'keyword',
          condition_operator: parseEnum<AutomationConditionOperatorType>(
            apiData.conditions[0].condition_operator,
            AutomationConditionOperator,
            AutomationConditionOperator.CONTAINS
          ),
          condition_keyword_mode: parseEnum<AutomationConditionKeywordModeType>(
            apiData.conditions[0].condition_keyword_mode,
            AutomationConditionKeywordMode,
            AutomationConditionKeywordMode.ANY
          ),
          condition_source: parseEnum<AutomationConditionSourceType>(
            apiData.conditions[0].condition_source,
            AutomationConditionSource,
            AutomationConditionSource.COMMENT_TEXT
          ),
          condition_value:
            (apiData.conditions[0].condition_value as string[]) || [],
          status: 'active',
        }
      : null,
    actions:
      apiData.actions?.map((action, index) => {
        const actionType = parseEnum<AutomationActionTypeType>(
          action.action_type,
          AutomationActionType,
          AutomationActionType.REPLY_COMMENT
        );
        let payload: AutomationActionPayload;
        if (actionType === AutomationActionType.SEND_DM) {
          const dmPayload = action.action_payload as SendDmPayload;
          const message = dmPayload?.message || { type: 'text', text: '' };
          if (message.type === 'text') {
            payload = {
              ...dmPayload,
              message: message as SendDmTextMessage,
            } as SendDmTextPayload;
          } else {
            payload = {
              ...dmPayload,
              message: message as SendDmMediaMessage,
            } as SendDmMediaPayload;
          }
        } else {
          const textPayload = action.action_payload as
            | ReplyCommentPayload
            | PrivateReplyPayload;
          payload = { ...textPayload, text: textPayload?.text || '' };
        }
        return {
          action_type: actionType,
          execution_order: index + 1,
          delay_seconds: action.delay_seconds || 0,
          status: 'active' as const,
          action_payload: payload,
          bot_id: action.bot_id,
          bot_name: undefined,
        };
      }) || [],
    name: apiData.name,
    description: apiData.description,
    labels: Array.isArray(apiData.labels) ? (apiData.labels as string[]) : [],
    status: parseEnum<AutomationStatusType>(
      apiData.status,
      AutomationStatus,
      AutomationStatus.ACTIVE
    ),
  };
}

export default function EditAutomationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast: toastHook } = useToast();
  const automationId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<AutomationFormData | null>(
    null
  );

  useEffect(() => {
    if (!automationId) return;
    setIsLoading(true);
    automationsApi
      .get(automationId)
      .then(res => {
        if (res?.data) setInitialData(apiToFormData(res.data));
      })
      .catch(err => {
        const e = parseApiError(err);
        toastHook({
          variant: 'destructive',
          title: e.title,
          description: e.message,
        });
      })
      .finally(() => setIsLoading(false));
  }, [automationId, toastHook]);

  const handleComplete = async (request: CreateAutomationRequest) => {
    await AutomationsApi.update(automationId, request);
    toast.success('Automation updated successfully');
    router.push(`/dashboard/automations/${automationId}`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/automations/${automationId}`);
  };

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <Loader2 className='h-7 w-7 animate-spin text-primary' />
          <p className='text-sm text-muted-foreground'>Loading automation…</p>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-sm text-muted-foreground'>Automation not found</p>
      </div>
    );
  }

  return (
    <AutomationFormPage
      initialData={initialData}
      onComplete={handleComplete}
      onCancel={handleCancel}
      isEditMode
    />
  );
}
