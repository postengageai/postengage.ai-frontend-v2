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
  AutomationConditionType,
  AutomationPlatform,
  AutomationStatus,
  type AutomationPlatformType,
  type AutomationTriggerTypeType,
  type AutomationConditionOperatorType,
  type AutomationActionTypeType,
  type AutomationStatusType,
} from '@/lib/constants/automations';
import {
  automationsApi,
  type Automation,
  type CreateAutomationRequest,
} from '@/lib/api/automations';
import type { ActionPayload } from '@/lib/types/automation-builder';
import { toast } from '@/hooks/use-toast';

interface AutomationEditWizardProps {
  automationId: string;
  onComplete: (automation: CreateAutomationRequest) => void;
  onCancel: () => void;
}

function _parseEnum<T>(
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
  const firstTrigger = apiData.triggers?.[0];

  return {
    platform: (apiData.platform ||
      AutomationPlatform.INSTAGRAM) as AutomationPlatformType,
    social_account_id: apiData.social_account_id || '',
    social_account_name: apiData.social_account_id,
    trigger_type: (firstTrigger?.type ||
      AutomationTriggerType.NEW_COMMENT) as AutomationTriggerTypeType,
    trigger_source: AutomationTriggerSource.POST,
    trigger_scope: AutomationTriggerScope.ALL,
    content_ids: [],
    condition:
      firstTrigger && firstTrigger.condition
        ? {
            condition_type: AutomationConditionType.KEYWORD,
            condition_operator:
              AutomationConditionOperator.CONTAINS as AutomationConditionOperatorType,
            condition_keyword_mode: AutomationConditionKeywordMode.ANY,
            condition_source: AutomationConditionSource.COMMENT_TEXT,
            condition_value: [firstTrigger.condition],
            status: 'active',
          }
        : null,
    actions:
      apiData.actions?.map((action, index) => {
        const payload: ActionPayload = (action.payload || {}) as ActionPayload;

        return {
          action_type:
            (action.type as unknown as AutomationActionTypeType) ||
            AutomationActionType.REPLY_COMMENT,
          execution_order: action.payload ? 0 : index + 1,
          delay_seconds: action.delay_seconds || 0,
          status: 'active',
          action_payload: payload,
        };
      }) || [],
    name: apiData.name,
    description: apiData.description,
    status: (apiData.status === AutomationStatus.ACTIVE
      ? AutomationStatus.ACTIVE
      : AutomationStatus.INACTIVE) as AutomationStatusType,
    bot_id: apiData.bot_id,
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
