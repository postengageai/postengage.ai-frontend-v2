'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronRight, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SelectAccountTypeStep } from './steps/select-account-type-step';
import { BasicsStep } from './steps/basics-step';
import { SelectTriggerStep } from './steps/select-trigger-step';
import { ConfigureConditionStep } from './steps/configure-condition-step';
import { ConfigureActionsStep } from './steps/configure-actions-step';
import { MetadataStep } from './steps/metadata-step';
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
} from '@/lib/constants/automations';

const CREATE_STEPS = [
  { id: 1, name: 'Platform', description: 'Choose platform' },
  { id: 2, name: 'Basics', description: 'Account setup' },
  { id: 3, name: 'Trigger', description: 'When to run' },
  { id: 4, name: 'Conditions', description: 'Filter keywords' },
  { id: 5, name: 'Actions', description: 'What happens' },
  { id: 6, name: 'Metadata', description: 'Name & labels' },
  { id: 7, name: 'Review', description: 'Check & launch' },
];

const EDIT_STEPS = [
  { id: 3, name: 'Trigger', description: 'When to run' },
  { id: 4, name: 'Conditions', description: 'Filter keywords' },
  { id: 5, name: 'Actions', description: 'What happens' },
  { id: 6, name: 'Metadata', description: 'Name & labels' },
  { id: 7, name: 'Review & Save', description: 'Apply changes' },
];

const QUICK_TIPS: Record<number, string> = {
  1: 'Instagram is where most automations run. Connect once and create unlimited automations.',
  2: 'Instant mode responds the moment a trigger fires — fastest for engagement.',
  3: 'New Comment is the most popular trigger. Use Specific Posts to target a campaign.',
  4: 'Keyword conditions focus your automation. Leave empty to respond to all triggers.',
  5: 'Add up to 2 actions per automation. AI replies can personalize every response.',
  6: 'A clear name like "Price Inquiry Responder" makes it easy to manage later.',
  7: 'Review all steps before saving. You can always edit after activation.',
};

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

  // Step 5 — each action can independently use a different AI bot
  actions: Array<{
    action_type: AutomationActionTypeType;
    execution_order: number;
    delay_seconds: number;
    status: 'active';
    action_payload: AutomationActionPayload;
    /** Bot selected for this specific action (only relevant when use_ai_reply is true). */
    bot_id?: string;
    /** Display name for the selected bot — kept for the Review step label. */
    bot_name?: string;
  }>;

  // Step 6
  name?: string;
  description?: string;
  labels?: string[];
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
  onCancel,
  isEditMode = false,
}: AutomationWizardProps) {
  const [currentStep, setCurrentStep] = useState(isEditMode ? 3 : 1);
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
        const isCommentTrigger =
          data.trigger_type === AutomationTriggerType.NEW_COMMENT;
        if (isCommentTrigger) {
          newData.trigger_scope = AutomationTriggerScope.ALL;
        } else {
          delete newData.trigger_scope;
          delete newData.content_ids;
          delete newData.selected_media;
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
    const maxStep = 7;
    if (currentStep < maxStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    const minStep = isEditMode ? 3 : 1;
    if (currentStep > minStep) {
      setCurrentStep(currentStep - 1);
    } else if (isEditMode && currentStep === 3) {
      onCancel();
    }
  };

  const goToStep = (step: number) => {
    const minStep = isEditMode ? 3 : 1;
    // Only allow navigating to steps the user has already visited (≤ currentStep).
    // Forward jumps to unvisited steps are blocked — each step must be completed
    // in order before proceeding.
    if (step >= minStep && step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const handleComplete = (isDraft: boolean) => {
    if (
      !formData.platform ||
      !formData.social_account_id ||
      !formData.trigger_type
    ) {
      return;
    }

    const payload: CreateAutomationRequest = {
      name: formData.name || 'New Automation',
      description: formData.description,
      social_account_id: formData.social_account_id,
      platform: formData.platform,
      status: isDraft ? AutomationStatus.DRAFT : AutomationStatus.ACTIVE,
      trigger: {
        trigger_type: formData.trigger_type,
        trigger_source:
          formData.trigger_source ||
          (formData.trigger_type === AutomationTriggerType.DM_RECEIVED
            ? AutomationTriggerSource.DIRECT_MESSAGE
            : formData.trigger_type === AutomationTriggerType.STORY_REPLY
              ? AutomationTriggerSource.STORY
              : formData.trigger_type === AutomationTriggerType.NEW_FOLLOWER
                ? AutomationTriggerSource.PROFILE
                : AutomationTriggerSource.POST),
        ...(formData.trigger_type === AutomationTriggerType.NEW_COMMENT
          ? {
              trigger_scope:
                formData.trigger_scope || AutomationTriggerScope.ALL,
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
        status: action.status as 'active' | 'inactive',
        action_payload: action.action_payload,
        // Only send bot_id when the action actually uses AI
        ...(action.bot_id ? { bot_id: action.bot_id } : {}),
      })),
    };
    onComplete(payload);
  };

  const steps = isEditMode ? EDIT_STEPS : CREATE_STEPS;

  const currentStepName =
    steps.find(s => s.id === currentStep)?.name ||
    (currentStep === 7 ? 'Review' : '');

  const isStepCompleted = (stepId: number) => currentStep > stepId;
  const isStepActive = (stepId: number) => currentStep === stepId;

  return (
    <div className='flex h-full bg-background'>
      {/* ── Left Sidebar ── */}
      <aside className='hidden w-60 flex-shrink-0 flex-col border-r border-border bg-card/50 lg:flex'>
        {/* Sidebar Header */}
        <div className='border-b border-border px-5 py-5'>
          <span className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
            {isEditMode ? 'Edit Automation' : 'New Automation'}
          </span>
        </div>

        {/* Step List */}
        <nav className='flex-1 space-y-0.5 px-3 py-4'>
          {steps.map((step, index) => {
            const displayIndex = isEditMode ? index + 1 : step.id;
            const completed = isStepCompleted(step.id);
            const active = isStepActive(step.id);

            const isFuture = step.id > currentStep;

            return (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                disabled={isFuture}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                  active
                    ? 'bg-primary/10 text-foreground'
                    : completed
                      ? 'text-foreground hover:bg-muted/60'
                      : isFuture
                        ? 'cursor-not-allowed text-muted-foreground/40'
                        : 'text-muted-foreground'
                )}
              >
                <div
                  className={cn(
                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    active
                      ? 'bg-primary text-white'
                      : completed
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {completed ? <Check className='h-3.5 w-3.5' /> : displayIndex}
                </div>
                <div className='min-w-0'>
                  <p
                    className={cn(
                      'truncate text-sm font-medium',
                      active ? 'text-foreground' : ''
                    )}
                  >
                    {step.name}
                  </p>
                  <p className='truncate text-xs text-muted-foreground'>
                    {step.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Quick Tip */}
        <div className='border-t border-border p-4'>
          <div className='rounded-lg border border-primary/10 bg-primary/5 p-3'>
            <div className='mb-1.5 flex items-center gap-1.5'>
              <Lightbulb className='h-3.5 w-3.5 text-primary' />
              <span className='text-xs font-semibold text-primary'>
                Quick Tip
              </span>
            </div>
            <p className='text-xs leading-relaxed text-muted-foreground'>
              {QUICK_TIPS[currentStep]}
            </p>
          </div>
        </div>
      </aside>

      {/* ── Right Content Area ── */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Breadcrumb Header */}
        <header className='flex items-center gap-1.5 border-b border-border px-6 py-3 text-sm text-muted-foreground'>
          <button
            onClick={onCancel}
            className='hover:text-foreground transition-colors'
          >
            Automations
          </button>
          <ChevronRight className='h-3.5 w-3.5 flex-shrink-0' />
          <span className='hidden sm:inline'>
            {isEditMode ? 'Edit Automation' : 'New Automation'}
          </span>
          <ChevronRight className='hidden h-3.5 w-3.5 flex-shrink-0 sm:block' />
          <span className='font-medium text-foreground'>{currentStepName}</span>
        </header>

        {/* Scrollable Step Content */}
        <div className='flex-1 overflow-y-auto'>
          <div className='mx-auto max-w-3xl px-4 py-8 sm:px-8'>
            {currentStep === 1 && !isEditMode && (
              <SelectAccountTypeStep
                formData={formData}
                updateFormData={updateFormData}
                nextStep={nextStep}
                onCancel={onCancel}
              />
            )}
            {currentStep === 2 && !isEditMode && (
              <BasicsStep
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
              <MetadataStep
                formData={formData}
                updateFormData={updateFormData}
                nextStep={nextStep}
                prevStep={prevStep}
                isEditMode={isEditMode}
              />
            )}
            {currentStep === 7 && (
              <ReviewStep
                formData={formData}
                updateFormData={updateFormData}
                prevStep={prevStep}
                onComplete={handleComplete}
                goToStep={goToStep}
                isEditMode={isEditMode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
