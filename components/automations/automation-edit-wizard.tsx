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

interface AutomationEditWizardProps {
  automationId: string;
  onComplete: (automation: any) => void;
  onCancel: () => void;
}

function parseEnum<T>(
  value: any,
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
function apiToFormData(apiData: any): AutomationFormData {
  return {
    platform: parseEnum<AutomationPlatformType>(
      apiData.platform,
      AutomationPlatform,
      AutomationPlatform.INSTAGRAM
    ),
    social_account_id: apiData.social_account_id || '',
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
          condition_value: apiData.conditions[0].condition_value || [],
          status: 'active',
        }
      : null,
    actions:
      apiData.actions?.map((action: any, index: number) => ({
        action_type: parseEnum<AutomationActionTypeType>(
          action.action_type,
          AutomationActionType,
          AutomationActionType.REPLY_COMMENT
        ),
        execution_order: index + 1,
        delay_seconds: action.delay_seconds || 0,
        status: 'active',
        action_payload: {
          text: action.action_payload?.text || '',
          attachment_type: action.action_payload?.attachment_type,
          attachment_url: action.action_payload?.attachment_url,
        },
      })) || [],
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
    // Simulate fetching automation data
    const fetchAutomation = async () => {
      setIsLoading(true);

      // Mock API response - in production this would be a real API call
      const mockApiData = {
        id: automationId,
        name: 'Welcome New Commenters',
        description:
          'Automatically reply to new comments and send a welcome DM',
        social_account_id: 'acc_123',
        social_account: {
          username: 'alexcreates',
        },
        platform: 'instagram',
        status: 'active',
        trigger: {
          trigger_type: 'new_comment',
          trigger_source: 'post',
          trigger_scope: 'all',
        },
        conditions: [
          {
            condition_type: 'keyword',
            condition_operator: 'contains',
            condition_keyword_mode: 'any',
            condition_source: 'comment_text',
            condition_value: ['price', 'cost', 'how much'],
          },
        ],
        actions: [
          {
            action_type: 'reply_comment',
            execution_order: 1,
            delay_seconds: 0,
            action_payload: {
              text: 'Thanks for your comment! Check your DMs for more info 💬',
            },
          },
          {
            action_type: 'private_reply',
            execution_order: 2,
            delay_seconds: 5,
            action_payload: {
              text: 'Hey! Thanks for showing interest. Our pricing starts at ₹499. Would you like more details?',
            },
          },
        ],
      };

      const formData = apiToFormData(mockApiData);
      setInitialData(formData);
      setIsLoading(false);
    };

    fetchAutomation();
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
