'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, X, Plus, AlertCircle } from 'lucide-react';
import type { AutomationFormData } from '../automation-wizard';
import {
  AutomationConditionType,
  AutomationConditionOperator,
  type AutomationConditionOperatorType,
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
  const [operator, setOperator] = useState<AutomationConditionOperatorType>(
    formData.condition?.condition_operator ||
      AutomationConditionOperator.CONTAINS
  );
  const [keywordMode, setKeywordMode] =
    useState<AutomationConditionKeywordModeType>(
      formData.condition?.condition_keyword_mode ||
        AutomationConditionKeywordMode.ANY
    );

  const conditionSource =
    formData.trigger_type === AutomationTriggerType.NEW_COMMENT
      ? AutomationConditionSource.COMMENT_TEXT
      : AutomationConditionSource.DM_TEXT;

  const addKeyword = () => {
    if (
      keywordInput.trim() &&
      !keywords.includes(keywordInput.trim().toLowerCase())
    ) {
      const newKeywords = [...keywords, keywordInput.trim().toLowerCase()];
      setKeywords(newKeywords);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleNext = () => {
    updateFormData({
      condition:
        keywords.length > 0
          ? {
              condition_type: AutomationConditionType.KEYWORD,
              condition_operator: operator,
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

  // Quick add templates
  const quickKeywords = {
    [AutomationTriggerType.NEW_COMMENT]: [
      { label: 'Pricing', keywords: ['price', 'cost', 'how much'] },
      { label: 'Interested', keywords: ['interested', 'want', 'need'] },
      { label: 'Questions', keywords: ['how', 'what', 'when', 'where'] },
    ],
    [AutomationTriggerType.DM_RECEIVED]: [
      { label: 'Product Info', keywords: ['product', 'details', 'info'] },
      { label: 'Support', keywords: ['help', 'support', 'issue', 'problem'] },
      { label: 'Order', keywords: ['order', 'buy', 'purchase', 'payment'] },
    ],
  };

  const templates =
    formData.trigger_type && formData.trigger_type in quickKeywords
      ? quickKeywords[formData.trigger_type as keyof typeof quickKeywords]
      : [];

  return (
    <div>
      <h2 className='mb-2 text-2xl font-bold text-foreground'>
        Add Keyword Condition
      </h2>
      <p className='mb-2 text-muted-foreground'>
        Filter{' '}
        {formData.trigger_type === AutomationTriggerType.NEW_COMMENT
          ? 'comments'
          : 'DMs'}{' '}
        by keywords (optional)
      </p>
      <div className='mb-8 flex items-start gap-2 rounded-lg border border-warning/20 bg-warning/5 p-3'>
        <AlertCircle className='mt-0.5 h-4 w-4 text-warning' />
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
          <Label className='mb-3 block text-sm font-medium'>
            Quick Add Templates
          </Label>
          <div className='flex flex-wrap gap-2'>
            {templates.map(template => (
              <Button
                key={template.label}
                variant='outline'
                size='sm'
                onClick={() => {
                  const newKeywords = [
                    ...new Set([...keywords, ...template.keywords]),
                  ];
                  setKeywords(newKeywords);
                }}
              >
                <Plus className='mr-1 h-3 w-3' />
                {template.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Operator Selection */}
      <div className='mb-6'>
        <Label htmlFor='operator' className='mb-3 block text-sm font-medium'>
          Keyword Operator
        </Label>
        <Select
          value={operator}
          onValueChange={(value: AutomationConditionOperatorType) =>
            setOperator(value)
          }
        >
          <SelectTrigger id='operator'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={AutomationConditionOperator.CONTAINS}>
              Contains keyword
            </SelectItem>
            <SelectItem value={AutomationConditionOperator.EQUALS}>
              Equals exactly
            </SelectItem>
            <SelectItem value={AutomationConditionOperator.STARTS_WITH}>
              Starts with
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Keyword Input */}
      <div className='mb-6'>
        <Label
          htmlFor='keyword-input'
          className='mb-3 block text-sm font-medium'
        >
          Keywords
        </Label>
        <div className='flex gap-2'>
          <Input
            id='keyword-input'
            placeholder='Type keyword and press Enter...'
            value={keywordInput}
            onChange={e => setKeywordInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addKeyword();
              }
            }}
          />
          <Button onClick={addKeyword} disabled={!keywordInput.trim()}>
            <Plus className='mr-2 h-4 w-4' />
            Add
          </Button>
        </div>

        {/* Keywords List */}
        {keywords.length > 0 && (
          <div className='mt-3 flex flex-wrap gap-2'>
            {keywords.map(keyword => (
              <Badge
                key={keyword}
                variant='secondary'
                className='gap-1 bg-primary/10 text-primary'
              >
                {keyword}
                <button
                  onClick={() => removeKeyword(keyword)}
                  className='ml-1 rounded-sm hover:bg-primary/20'
                >
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Keyword Mode */}
      {keywords.length > 1 && (
        <div className='mb-6'>
          <Label className='mb-3 block text-sm font-medium'>Match Mode</Label>
          <RadioGroup
            value={keywordMode}
            onValueChange={(value: AutomationConditionKeywordModeType) =>
              setKeywordMode(value)
            }
          >
            <div className='flex items-center space-x-2 rounded-md border border-border p-3'>
              <RadioGroupItem
                value={AutomationConditionKeywordMode.ANY}
                id='any'
              />
              <Label htmlFor='any' className='cursor-pointer'>
                <p className='font-medium'>Match ANY keyword</p>
                <p className='text-sm text-muted-foreground'>
                  Trigger if message contains at least one keyword
                </p>
              </Label>
            </div>
            <div className='flex items-center space-x-2 rounded-md border border-border p-3'>
              <RadioGroupItem
                value={AutomationConditionKeywordMode.ALL}
                id='all'
              />
              <Label htmlFor='all' className='cursor-pointer'>
                <p className='font-medium'>Match ALL keywords</p>
                <p className='text-sm text-muted-foreground'>
                  Trigger only if message contains all keywords
                </p>
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      <div className='mt-8 flex justify-between'>
        <Button variant='outline' onClick={prevStep}>
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
