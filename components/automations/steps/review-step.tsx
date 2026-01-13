'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Check,
  Instagram,
  MessageCircle,
  Mail,
} from 'lucide-react';
import type { AutomationFormData } from '../automation-wizard';
import {
  AutomationPlatform,
  AutomationTriggerType,
  AutomationStatus,
  AutomationTriggerScope,
} from '@/lib/constants/automations';

interface ReviewStepProps {
  formData: AutomationFormData;
  updateFormData: (data: Partial<AutomationFormData>) => void;
  prevStep: () => void;
  onComplete: (isDraft: boolean) => void;
  isEditMode?: boolean;
}

export function ReviewStep({
  formData,
  updateFormData,
  prevStep,
  onComplete,
  isEditMode = false,
}: ReviewStepProps) {
  const [name, setName] = useState(formData.name || '');
  const [description, setDescription] = useState(formData.description || '');

  const handleSave = (isDraft: boolean) => {
    updateFormData({
      name,
      description,
      status: isDraft ? AutomationStatus.DRAFT : AutomationStatus.ACTIVE,
    });
    onComplete(isDraft);
  };

  // Calculate total credit cost
  const totalCredits = formData.actions.reduce(sum => sum + 2, 0);

  return (
    <div>
      <h2 className='mb-2 text-2xl font-bold text-foreground'>
        {isEditMode ? 'Review & Update Automation' : 'Review & Name Automation'}
      </h2>
      <p className='mb-8 text-muted-foreground'>
        {isEditMode
          ? 'Review your changes and update the automation'
          : 'Give your automation a name and review the details'}
      </p>

      <div className='space-y-6'>
        {/* Name & Description */}
        <Card className='p-6'>
          <div className='space-y-4'>
            <div>
              <Label
                htmlFor='automation-name'
                className='mb-2 block text-sm font-medium'
              >
                Automation Name *
              </Label>
              <Input
                id='automation-name'
                placeholder='e.g., Price Inquiry Auto-Responder'
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div>
              <Label
                htmlFor='automation-description'
                className='mb-2 block text-sm font-medium'
              >
                Description (Optional)
              </Label>
              <Textarea
                id='automation-description'
                placeholder='Brief description of what this automation does...'
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </Card>

        {/* Summary */}
        <Card className='border-primary/20 bg-primary/5 p-6'>
          <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold text-foreground'>
            <Check className='h-5 w-5 text-primary' />
            Automation Summary
          </h3>

          <div className='space-y-3'>
            <div className='flex items-center gap-3'>
              <Instagram className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>Platform:</span>
              <Badge
                variant='secondary'
                className='bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              >
                {formData.platform === AutomationPlatform.INSTAGRAM
                  ? 'Instagram'
                  : 'Facebook'}
              </Badge>
            </div>

            <div className='flex items-center gap-3'>
              <span className='text-sm text-muted-foreground'>Account:</span>
              <span className='text-sm font-medium text-foreground'>
                {formData.social_account_name || 'Selected Account'}
              </span>
            </div>

            <div className='flex items-center gap-3'>
              {formData.trigger_type === AutomationTriggerType.NEW_COMMENT ? (
                <MessageCircle className='h-4 w-4 text-muted-foreground' />
              ) : (
                <Mail className='h-4 w-4 text-muted-foreground' />
              )}
              <span className='text-sm text-muted-foreground'>Trigger:</span>
              <Badge variant='secondary'>
                {formData.trigger_type === AutomationTriggerType.NEW_COMMENT
                  ? 'New Comment'
                  : 'DM Received'}
              </Badge>
              {formData.trigger_type === AutomationTriggerType.NEW_COMMENT &&
                formData.trigger_scope && (
                  <Badge variant='outline' className='text-xs'>
                    {formData.trigger_scope === AutomationTriggerScope.ALL
                      ? 'All Posts'
                      : 'Specific Posts'}
                  </Badge>
                )}
            </div>

            {formData.condition &&
              formData.condition.condition_value.length > 0 && (
                <div className='flex items-center gap-3'>
                  <span className='text-sm text-muted-foreground'>
                    Condition:
                  </span>
                  <Badge variant='secondary'>
                    {formData.condition.condition_operator} keywords (
                    {formData.condition.condition_keyword_mode})
                  </Badge>
                  <div className='flex flex-wrap gap-1'>
                    {formData.condition.condition_value
                      .slice(0, 3)
                      .map(keyword => (
                        <Badge
                          key={keyword}
                          variant='outline'
                          className='text-xs'
                        >
                          {keyword}
                        </Badge>
                      ))}
                    {formData.condition.condition_value.length > 3 && (
                      <Badge variant='outline' className='text-xs'>
                        +{formData.condition.condition_value.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

            <div className='flex items-center gap-3'>
              <span className='text-sm text-muted-foreground'>Actions:</span>
              <Badge variant='secondary'>
                {formData.actions.length} action(s)
              </Badge>
            </div>

            <div className='flex items-center gap-3'>
              <span className='text-sm text-muted-foreground'>
                Cost per execution:
              </span>
              <Badge variant='default' className='bg-primary'>
                {totalCredits} credits
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <div className='mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between'>
        <Button
          variant='outline'
          onClick={prevStep}
          className='w-full bg-transparent sm:w-auto'
        >
          <ChevronLeft className='mr-2 h-4 w-4' />
          Back
        </Button>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <Button
            variant='outline'
            onClick={() => handleSave(true)}
            disabled={!name.trim()}
            className='w-full sm:w-auto'
          >
            {isEditMode ? 'Save as Draft' : 'Save as Draft'}
          </Button>
          <Button
            onClick={() => handleSave(false)}
            disabled={!name.trim()}
            className='w-full sm:w-auto'
          >
            <Check className='mr-2 h-4 w-4' />
            {isEditMode ? 'Update & Activate' : 'Create & Activate'}
          </Button>
        </div>
      </div>
    </div>
  );
}
