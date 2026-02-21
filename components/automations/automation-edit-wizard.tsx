'use client';

import { useState, useEffect } from 'react';
import { AutomationWizard, type AutomationFormData } from './automation-wizard';
import {
  AutomationTriggerType,
  AutomationTriggerSource,
  AutomationTriggerScope,
  AutomationConditionOperator,
  AutomationConditionKeywordMode,
  AutomationConditionSource,
  AutomationActionType,
  AutomationPlatform,
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
import {
  automationsApi,
  type Automation,
  type CreateAutomationRequest,
  type AutomationActionPayload,
  type SendDmPayload,
  type ReplyCommentPayload,
  type PrivateReplyPayload,
  type SendDmTextMessage,
  type SendDmTextPayload,
  type SendDmMediaMessage,
  type SendDmMediaPayload,
} from '@/lib/api/automations';
import { toast } from '@/hooks/use-toast';

interface AutomationEditWizardProps {
  automationId: string;
  onComplete: (automation: CreateAutomationRequest) => void;
  onCancel: () => void;
}

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

// Convert API data to form data format
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
          const message = dmPayload?.message || {
            type: 'text',
            text: '',
          };

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
          payload = {
            ...textPayload,
            text: textPayload?.text || '',
          };
        }

        return {
          action_type: actionType,
          execution_order: index + 1,
          delay_seconds: action.delay_seconds || 0,
          status: 'active',
          action_payload: payload,
        };
      }) || [],
    name: apiData.name,
    description: apiData.description,
    status: parseEnum<AutomationStatusType>(
      apiData.status,
      AutomationStatus,
      AutomationStatus.ACTIVE
    ),
  };
}

export function AutomationEditWizard({
  automationId,
  onComplete,
  onCancel,
}: AutomationEditWizardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState<AutomationFormData | null>(
    null
  );

  useEffect(() => {
    const fetchAutomation = async () => {
      setIsLoading(true);
      try {
        const response = await automationsApi.get(automationId);
        if (response && response.data) {
          const formData = apiToFormData(response.data);
          setInitialData(formData);
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

    if (automationId) {
      fetchAutomation();
    }
  }, [automationId]);

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
          <p className='text-sm text-muted-foreground'>Loading automation...</p>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-center'>
          <p className='text-sm text-muted-foreground'>Automation not found</p>
        </div>
      </div>
    );
  }

  return (
    <AutomationWizard
      initialData={initialData}
      onComplete={onComplete}
      onCancel={onCancel}
      isEditMode
    />
  );
}
