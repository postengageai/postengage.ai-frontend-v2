'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SelectAccountTypeStep } from './steps/select-account-type-step';
import { SelectSocialAccountStep } from './steps/select-social-account-step';
import { SelectTriggerStep } from './steps/select-trigger-step';
import { ConfigureConditionStep } from './steps/configure-condition-step';
import { ConfigureActionsStep } from './steps/configure-actions-step';
import { ReviewStep } from './steps/review-step';
import type { Media } from '@/lib/api/media';
import type {
  CreateAutomationRequest,
  AutomationActionPayload,
} from '@/lib/api/automations';
import {
  AutomationPlatform,
  type AutomationPlatformType,
  AutomationStatus,
  type AutomationStatusType,
  AutomationTriggerType,
  type AutomationTriggerTypeType,
  AutomationTriggerSource,
  type AutomationTriggerSourceType,
  AutomationTriggerScope,
  type AutomationTriggerScopeType,
  type AutomationActionTypeType,
  type AutomationConditionTypeType,
  type AutomationConditionOperatorType,
  type AutomationConditionKeywordModeType,
  AutomationConditionSource,
  type AutomationConditionSourceType,
  AutomationExecutionMode,
} from '@/lib/constants/automations';

const STEPS = [
  { id: 1, name: 'Platform', description: 'Choose platform' },
  { id: 2, name: 'Account', description: 'Select account' },
  { id: 3, name: 'Trigger', description: 'When to run' },
  { id: 4, name: 'Condition', description: 'Filter keywords' },
  { id: 5, name: 'Actions', description: 'What happens' },
  { id: 6, name: 'Review', description: 'Name & save' },
];

// Extend CreateAutomationRequest to allow partial data during wizard steps
export interface AutomationFormData extends Partial<
  Omit<CreateAutomationRequest, 'trigger' | 'actions' | 'conditions'>
> {
  // Step 1 & 2
  platform: AutomationPlatformType;
  social_account_id: string;
  social_account_name?: string;

  // Step 3
  trigger_type?: AutomationTriggerTypeType;
  trigger_source?: AutomationTriggerSourceType;
  trigger_scope?: AutomationTriggerScopeType;
  content_ids?: string[];
  selected_media?: Media[];

  // Step 4
  condition?: {
    condition_type: AutomationConditionTypeType;
    condition_operator: AutomationConditionOperatorType;
    condition_keyword_mode?: AutomationConditionKeywordModeType;
    condition_source?: AutomationConditionSourceType;
    condition_value: string[];
    status: 'active';
  } | null;

  // Step 5
  actions: Array<{
    action_type: AutomationActionTypeType;
    execution_order: number;
    delay_seconds: number;
    status: 'active';
    action_payload: AutomationActionPayload;
  }>;

  // Step 6
  name?: string;
  description?: string;
  status?: AutomationStatusType;
}

interface AutomationWizardProps {
  initialData?: AutomationFormData;
  onComplete: (automation: CreateAutomationRequest) => void;

  onCancel: () => void;
  isEditMode?: boolean;
}

export function AutomationWizard({
  initialData,
  onComplete,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCancel,
  isEditMode = false,
}: AutomationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AutomationFormData>(
    initialData || {
      platform: AutomationPlatform.INSTAGRAM,
      social_account_id: '',
      actions: [],
    }
  );

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const updateFormData = (data: Partial<AutomationFormData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...data };

      // If trigger_type changes, reset trigger-specific fields
      if (data.trigger_type && data.trigger_type !== prev.trigger_type) {
        // Reset trigger scope and content_ids for DM triggers
        if (data.trigger_type === AutomationTriggerType.DM_RECEIVED) {
          delete newData.trigger_scope;
          delete newData.content_ids;
          delete newData.selected_media;
        } else {
          // Set default scope for comment triggers
          newData.trigger_scope = AutomationTriggerScope.ALL;
        }

        // Reset condition source based on trigger
        if (newData.condition) {
          newData.condition = {
            ...newData.condition,
            condition_source:
              data.trigger_type === AutomationTriggerType.NEW_COMMENT
                ? AutomationConditionSource.COMMENT_TEXT
                : AutomationConditionSource.DM_TEXT,
          };
        }

        // Reset actions since different triggers have different action types
        newData.actions = [];
      }

      // If platform changes, reset everything except platform
      if (data.platform && data.platform !== prev.platform) {
        return {
          platform: data.platform,
          social_account_id: '',
          actions: [],
        };
      }

      return newData;
    });
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = (isDraft: boolean) => {
    if (
      !formData.platform ||
      !formData.social_account_id ||
      !formData.trigger_type
    ) {
      // Basic validation failure - should be handled by steps disabling continue
      return;
    }

    const payload: CreateAutomationRequest = {
      name: formData.name || 'New Automation',
      description: formData.description,
      social_account_id: formData.social_account_id,
      platform: formData.platform,
      status: isDraft ? AutomationStatus.DRAFT : AutomationStatus.ACTIVE,
      execution_mode: AutomationExecutionMode.REAL_TIME,
      trigger: {
        trigger_type: formData.trigger_type,
        trigger_source:
          formData.trigger_source ||
          (formData.trigger_type === AutomationTriggerType.DM_RECEIVED
            ? AutomationTriggerSource.DIRECT_MESSAGE
            : AutomationTriggerSource.POST),
        trigger_scope: formData.trigger_scope || AutomationTriggerScope.ALL,
        ...(formData.trigger_type === AutomationTriggerType.NEW_COMMENT
          ? {
              content_ids: formData.content_ids,
              trigger_config: {
                include_reply_to_comments: true,
              },
            }
          : {}),
      },
      conditions: formData.condition
        ? [
            {
              condition_type: formData.condition.condition_type,
              condition_operator: formData.condition.condition_operator,
              condition_keyword_mode: formData.condition.condition_keyword_mode,
              condition_source: formData.condition.condition_source,
              condition_value: formData.condition.condition_value,
              status: AutomationStatus.ACTIVE,
            },
          ]
        : [],
      actions: formData.actions.map(action => ({
        action_type: action.action_type,
        execution_order: action.execution_order,
        delay_seconds: action.delay_seconds,
        status: action.status as 'active' | 'inactive', // Cast to match API type
        action_payload: action.action_payload,
      })),
    };
    onComplete(payload);
  };

  return (
    <div className='flex h-full flex-col bg-background'>
      {/* Progress Bar */}
      <div className='border-b border-border bg-card/30'>
        <div className='mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6'>
          {isEditMode && (
            <div className='mb-4 text-center'>
              <h2 className='text-lg font-semibold'>Edit Automation</h2>
              <p className='text-sm text-muted-foreground'>
                Update your automation settings
              </p>
            </div>
          )}

          <div className='flex items-center justify-between gap-2'>
            {STEPS.map((step, index) => (
              <div key={step.id} className='flex flex-1 items-center'>
                <div className='flex flex-1 flex-col items-center'>
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all sm:h-10 sm:w-10 sm:text-sm',
                      currentStep > step.id
                        ? 'bg-primary text-white'
                        : currentStep === step.id
                          ? 'bg-primary text-white ring-2 ring-primary/20 sm:ring-4'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className='h-4 w-4 sm:h-5 sm:w-5' />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className='mt-1 text-center sm:mt-2'>
                    <div
                      className={cn(
                        'text-xs font-medium sm:text-sm',
                        currentStep >= step.id
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      <span className='hidden sm:inline'>{step.name}</span>
                      <span className='sm:hidden'>{step.id}</span>
                    </div>
                    <div className='hidden text-xs text-muted-foreground lg:block'>
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      '-mt-6 mx-2 h-px flex-1 transition-colors sm:-mt-8 sm:mx-4',
                      currentStep > step.id ? 'bg-primary' : 'bg-border'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className='flex-1 overflow-y-auto'>
        <div className='mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-12'>
          {currentStep === 1 && (
            <SelectAccountTypeStep
              formData={formData}
              updateFormData={updateFormData}
              nextStep={nextStep}
            />
          )}
          {currentStep === 2 && (
            <SelectSocialAccountStep
              formData={formData}
              updateFormData={updateFormData}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
          {currentStep === 3 && (
            <SelectTriggerStep
              formData={formData}
              updateFormData={updateFormData}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
          {currentStep === 4 && (
            <ConfigureConditionStep
              formData={formData}
              updateFormData={updateFormData}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
          {currentStep === 5 && (
            <ConfigureActionsStep
              formData={formData}
              updateFormData={updateFormData}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
          {currentStep === 6 && (
            <ReviewStep
              formData={formData}
              updateFormData={updateFormData}
              prevStep={prevStep}
              onComplete={handleComplete}
              isEditMode={isEditMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}
