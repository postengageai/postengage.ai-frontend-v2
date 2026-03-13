'use client';

import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ChevronLeft, X, Plus, AlertCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AutomationFormData } from '../automation-wizard';
import {
  AutomationConditionType,
  AutomationConditionOperator,
  AutomationConditionKeywordMode,
  type AutomationConditionKeywordModeType,
  AutomationConditionSource,
  AutomationTriggerType,
  AutomationStatus,
} from '@/lib/constants/automations';

interface ConfigureConditionStepProps {
  formData: AutomationFormData;
  updateFormData: (data: Partial<AutomationFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const MATCH_MODES = [
  {
    value: AutomationConditionKeywordMode.ANY,
    label: 'Contains any keyword',
    description: 'Trigger if at least one keyword matches',
  },
  {
    value: AutomationConditionKeywordMode.ALL,
    label: 'Contains all keywords',
    description: 'Trigger only when every keyword is present',
  },
  {
    value: AutomationConditionKeywordMode.EXACT,
    label: 'Exact match',
    description: 'Message must match the keyword exactly',
  },
] as const;

const QUICK_ADD_TEMPLATES = {
  [AutomationTriggerType.NEW_COMMENT]: [
    { label: 'Giveaway', keywords: ['giveaway', 'win', 'prize', 'entry'] },
    {
      label: 'Product inquiry',
      keywords: ['price', 'cost', 'how much', 'buy'],
    },
    { label: 'Link request', keywords: ['link', 'where', 'find', 'website'] },
    {
      label: 'Testimonial',
      keywords: ['love', 'amazing', 'recommend', 'great'],
    },
  ],
  [AutomationTriggerType.DM_RECEIVED]: [
    {
      label: 'Product info',
      keywords: ['product', 'details', 'info', 'pricing'],
    },
    {
      label: 'Support',
      keywords: ['help', 'support', 'issue', 'problem', 'broken'],
    },
    { label: 'Order', keywords: ['order', 'buy', 'purchase', 'payment'] },
    { label: 'Collab', keywords: ['collab', 'partnership', 'brand deal'] },
  ],
};

export function ConfigureConditionStep({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}: ConfigureConditionStepProps) {
  const [keywords, setKeywords] = useState<string[]>(
    formData.condition?.condition_value || []
  );
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordMode, setKeywordMode] =
    useState<AutomationConditionKeywordModeType>(
      formData.condition?.condition_keyword_mode ||
        AutomationConditionKeywordMode.ANY
    );

  const conditionSource =
    formData.trigger_type === AutomationTriggerType.NEW_COMMENT
      ? AutomationConditionSource.COMMENT_TEXT
      : AutomationConditionSource.DM_TEXT;

  const addKeyword = (raw: string) => {
    const trimmed = raw.trim().toLowerCase();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords(prev => [...prev, trimmed]);
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword(keywordInput);
      setKeywordInput('');
    } else if (e.key === 'Backspace' && !keywordInput && keywords.length > 0) {
      setKeywords(prev => prev.slice(0, -1));
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(prev => prev.filter(k => k !== keyword));
  };

  const handleNext = () => {
    updateFormData({
      condition:
        keywords.length > 0
          ? {
              condition_type: AutomationConditionType.KEYWORD,
              condition_operator: AutomationConditionOperator.CONTAINS,
              condition_keyword_mode: keywordMode,
              condition_source: conditionSource,
              condition_value: keywords,
              status: AutomationStatus.ACTIVE,
            }
          : null,
    });
    nextStep();
  };

  const handleSkip = () => {
    updateFormData({ condition: null });
    nextStep();
  };

  const triggerType =
    formData.trigger_type && formData.trigger_type in QUICK_ADD_TEMPLATES
      ? (formData.trigger_type as keyof typeof QUICK_ADD_TEMPLATES)
      : null;
  const templates = triggerType ? QUICK_ADD_TEMPLATES[triggerType] : [];

  return (
    <div>
      <div className='mb-2 flex items-center gap-2'>
        <h2 className='text-2xl font-bold text-foreground'>
          Add Keyword Condition
        </h2>
        <Badge
          variant='secondary'
          className='bg-muted text-xs text-muted-foreground'
        >
          Optional
        </Badge>
      </div>
      <p className='mb-4 text-muted-foreground'>
        Filter{' '}
        {formData.trigger_type === AutomationTriggerType.NEW_COMMENT
          ? 'comments'
          : 'DMs'}{' '}
        by keywords
      </p>

      <div className='mb-6 flex items-start gap-2 rounded-lg border border-warning/20 bg-warning/5 p-3'>
        <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-warning' />
        <p className='text-sm text-muted-foreground'>
          Leave empty to trigger on all{' '}
          {formData.trigger_type === AutomationTriggerType.NEW_COMMENT
            ? 'comments'
            : 'DMs'}
        </p>
      </div>

      {/* Quick Add Templates */}
      {templates.length > 0 && (
        <div className='mb-6'>
          <p className='mb-2.5 text-sm font-medium text-foreground'>
            Quick add templates
          </p>
          <div className='flex flex-wrap gap-2'>
            {templates.map(template => (
              <Button
                key={template.label}
                variant='outline'
                size='sm'
                onClick={() => {
                  template.keywords.forEach(k => addKeyword(k));
                }}
                className='h-8 gap-1.5 text-xs'
              >
                <Plus className='h-3 w-3' />
                {template.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Inline Tag Input */}
      <div className='mb-6'>
        <p className='mb-2 text-sm font-medium text-foreground'>Keywords</p>
        <div className='flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-input bg-background px-3 py-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'>
          {keywords.map(keyword => (
            <Badge
              key={keyword}
              variant='secondary'
              className='gap-1 bg-primary/10 text-primary'
            >
              {keyword}
              <button
                type='button'
                onClick={() => removeKeyword(keyword)}
                className='ml-0.5 rounded-sm hover:bg-primary/20'
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          ))}
          <input
            value={keywordInput}
            onChange={e => setKeywordInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onBlur={() => {
              if (keywordInput.trim()) {
                addKeyword(keywordInput);
                setKeywordInput('');
              }
            }}
            placeholder={
              keywords.length === 0 ? 'Type keyword and press Enter...' : ''
            }
            className='min-w-[180px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
          />
          {keywords.length > 0 && (
            <span className='ml-auto flex-shrink-0 text-xs text-muted-foreground'>
              {keywords.length} keyword{keywords.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Match Mode — 3 horizontal cards */}
      {keywords.length > 1 && (
        <div className='mb-8'>
          <p className='mb-3 text-sm font-medium text-foreground'>Match Mode</p>
          <div className='grid gap-3 sm:grid-cols-3'>
            {MATCH_MODES.map(mode => {
              const isSelected = keywordMode === mode.value;
              return (
                <Card
                  key={mode.value}
                  onClick={() => setKeywordMode(mode.value)}
                  className={cn(
                    'cursor-pointer p-4 transition-all hover:border-primary/60',
                    isSelected ? 'border-primary bg-primary/5' : 'border-border'
                  )}
                >
                  <div className='mb-2 flex items-center justify-between'>
                    <div
                      className={cn(
                        'h-4 w-4 rounded-full border-2 flex items-center justify-center',
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      )}
                    >
                      {isSelected && (
                        <Check className='h-2.5 w-2.5 text-white' />
                      )}
                    </div>
                  </div>
                  <p className='text-sm font-semibold text-foreground'>
                    {mode.label}
                  </p>
                  <p className='mt-1 text-xs text-muted-foreground'>
                    {mode.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className='flex justify-between'>
        <Button variant='outline' onClick={prevStep} className='bg-transparent'>
          <ChevronLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={handleNext}>Continue</Button>
        </div>
      </div>
    </div>
  );
}
