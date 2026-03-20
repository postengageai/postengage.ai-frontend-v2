'use client';

import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Tag, X } from 'lucide-react';
import type { AutomationFormData } from '../automation-wizard';

interface MetadataStepProps {
  formData: AutomationFormData;
  updateFormData: (data: Partial<AutomationFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  isEditMode?: boolean;
}

export function MetadataStep({
  formData,
  updateFormData,
  nextStep,
  prevStep,
  isEditMode = false,
}: MetadataStepProps) {
  const [name, setName] = useState(formData.name || '');
  const [description, setDescription] = useState(formData.description || '');
  const [labels, setLabels] = useState<string[]>(formData.labels || []);
  const [labelInput, setLabelInput] = useState('');

  const handleAddLabel = () => {
    const trimmed = labelInput.trim().toLowerCase();
    if (trimmed && !labels.includes(trimmed)) {
      const newLabels = [...labels, trimmed];
      setLabels(newLabels);
    }
    setLabelInput('');
  };

  const handleLabelKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLabel();
    } else if (e.key === 'Backspace' && !labelInput && labels.length > 0) {
      setLabels(labels.slice(0, -1));
    }
  };

  const removeLabel = (label: string) => {
    setLabels(labels.filter(l => l !== label));
  };

  const handleNext = () => {
    updateFormData({ name, description, labels });
    nextStep();
  };

  const descCount = description.length;
  const descMax = 500;

  return (
    <div>
      <h2 className='mb-2 text-2xl font-bold text-foreground'>
        {isEditMode ? 'Edit Metadata' : 'Name Your Automation'}
      </h2>
      <p className='mb-8 text-muted-foreground'>
        {isEditMode
          ? 'Update the name, description and labels for this automation'
          : 'Give your automation a clear name so you can find it later'}
      </p>

      <div className='space-y-6'>
        {/* Name */}
        <div>
          <Label
            htmlFor='automation-name'
            className='mb-2 block text-sm font-medium'
          >
            Automation Name <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='automation-name'
            placeholder='e.g., Price Inquiry Auto-Responder'
            value={name}
            onChange={e => setName(e.target.value)}
            className='text-base'
          />
          <p className='mt-1.5 text-xs text-muted-foreground'>
            Choose a name that describes what this automation does
          </p>
        </div>

        {/* Description */}
        <div>
          <Label
            htmlFor='automation-description'
            className='mb-2 block text-sm font-medium'
          >
            Description{' '}
            <span className='font-normal text-muted-foreground'>
              (Optional)
            </span>
          </Label>
          <Textarea
            id='automation-description'
            placeholder='Briefly describe what this automation does and when it runs...'
            value={description}
            onChange={e => {
              if (e.target.value.length <= descMax) {
                setDescription(e.target.value);
              }
            }}
            rows={3}
          />
          <div className='mt-1.5 flex items-center justify-between'>
            <p className='text-xs text-muted-foreground'>Optional</p>
            <p
              className={`text-xs ${descCount > descMax * 0.9 ? 'text-amber-500' : 'text-muted-foreground'}`}
            >
              {descCount}/{descMax}
            </p>
          </div>
        </div>

        {/* Labels */}
        <div>
          <Label className='mb-2 block text-sm font-medium'>
            <div className='flex items-center gap-1.5'>
              <Tag className='h-3.5 w-3.5' />
              Labels{' '}
              <span className='font-normal text-muted-foreground'>
                (Optional)
              </span>
            </div>
          </Label>
          <div className='flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'>
            {labels.map(label => (
              <Badge
                key={label}
                variant='secondary'
                className='gap-1 bg-primary/10 text-primary'
              >
                {label}
                <button
                  type='button'
                  onClick={() => removeLabel(label)}
                  className='ml-0.5 rounded-sm hover:bg-primary/20'
                >
                  <X className='h-3 w-3' />
                </button>
              </Badge>
            ))}
            <input
              value={labelInput}
              onChange={e => setLabelInput(e.target.value)}
              onKeyDown={handleLabelKeyDown}
              onBlur={handleAddLabel}
              placeholder={labels.length === 0 ? 'Add label...' : ''}
              className='min-w-[100px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
            />
          </div>
          <p className='mt-1.5 text-xs text-muted-foreground'>
            Press Enter to add a label. Labels help you organize automations.
          </p>
        </div>
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
        <Button
          onClick={handleNext}
          disabled={!name.trim()}
          className='w-full sm:w-auto'
        >
          Continue to Review
        </Button>
      </div>
    </div>
  );
}
