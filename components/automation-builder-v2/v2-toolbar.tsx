'use client';

import { useState, type KeyboardEvent } from 'react';
import {
  ArrowLeft,
  Pencil,
  Settings,
  Play,
  Zap,
  Minus,
  Plus,
  Maximize2,
  Tag,
  X,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface V2ToolbarProps {
  name: string;
  status: 'draft' | 'active' | 'paused';
  zoom: number;
  description?: string;
  labels?: string[];
  onNameChange: (name: string) => void;
  onDescriptionChange: (desc: string) => void;
  onLabelsChange: (labels: string[]) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onTestRun: () => void;
  onSaveActivate: () => void;
  onBack: () => void;
  isSaving?: boolean;
}

export function V2Toolbar({
  name,
  status,
  zoom,
  description = '',
  labels = [],
  onNameChange,
  onDescriptionChange,
  onLabelsChange,
  onZoomIn,
  onZoomOut,
  onFitView,
  onTestRun,
  onSaveActivate,
  onBack,
  isSaving,
}: V2ToolbarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const [labelInput, setLabelInput] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const commitName = () => {
    if (editValue.trim()) onNameChange(editValue.trim());
    else setEditValue(name);
    setIsEditing(false);
  };

  const addLabel = () => {
    const trimmed = labelInput.trim().toLowerCase();
    if (trimmed && !labels.includes(trimmed)) {
      onLabelsChange([...labels, trimmed]);
    }
    setLabelInput('');
  };

  const handleLabelKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLabel();
    } else if (e.key === 'Backspace' && !labelInput && labels.length > 0) {
      onLabelsChange(labels.slice(0, -1));
    }
  };

  const removeLabel = (label: string) => {
    onLabelsChange(labels.filter(l => l !== label));
  };

  const statusConfig = {
    draft: { label: 'Draft', dot: 'bg-amber-400', text: 'text-amber-400' },
    active: {
      label: 'Active',
      dot: 'bg-emerald-400',
      text: 'text-emerald-400',
    },
    paused: { label: 'Paused', dot: 'bg-slate-400', text: 'text-slate-400' },
  };
  const sc = statusConfig[status];

  return (
    <div className='flex h-12 flex-shrink-0 items-center justify-between border-b border-white/10 bg-[#0d0d1a] px-3'>
      {/* Left */}
      <div className='flex min-w-0 items-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={onBack}
          className='h-8 shrink-0 gap-1.5 text-slate-400 hover:bg-white/5 hover:text-white'
        >
          <ArrowLeft className='h-3.5 w-3.5' />
          <span className='hidden text-sm sm:inline'>Automations</span>
        </Button>

        {/* Editable title */}
        <div className='flex min-w-0 items-center gap-1.5'>
          {isEditing ? (
            <Input
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={commitName}
              onKeyDown={e => {
                if (e.key === 'Enter') commitName();
                if (e.key === 'Escape') {
                  setEditValue(name);
                  setIsEditing(false);
                }
              }}
              autoFocus
              className='h-7 w-36 border-white/20 bg-white/5 text-sm text-white focus-visible:ring-violet-500 sm:w-52'
            />
          ) : (
            <button
              onClick={() => {
                setEditValue(name);
                setIsEditing(true);
              }}
              className='flex max-w-[120px] items-center gap-1.5 truncate rounded px-1.5 py-1 text-sm font-medium text-white hover:bg-white/5 sm:max-w-[200px]'
            >
              <span className='truncate'>{name}</span>
              <Pencil className='h-3 w-3 shrink-0 text-slate-500' />
            </button>
          )}

          <div className='hidden items-center gap-1.5 sm:flex'>
            <span className={cn('h-2 w-2 rounded-full', sc.dot)} />
            <span className={cn('text-xs font-medium', sc.text)}>
              {sc.label}
            </span>
          </div>
        </div>
      </div>

      {/* Center - zoom controls (hidden on mobile) */}
      <div className='hidden items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-1 sm:flex'>
        <Button
          variant='ghost'
          size='sm'
          onClick={onZoomOut}
          className='h-7 w-7 p-0 text-slate-400 hover:bg-white/10 hover:text-white'
        >
          <Minus className='h-3.5 w-3.5' />
        </Button>
        <span className='min-w-[52px] text-center text-xs font-medium text-slate-300'>
          {zoom}%
        </span>
        <Button
          variant='ghost'
          size='sm'
          onClick={onZoomIn}
          className='h-7 w-7 p-0 text-slate-400 hover:bg-white/10 hover:text-white'
        >
          <Plus className='h-3.5 w-3.5' />
        </Button>
        <div className='mx-0.5 h-4 w-px bg-white/10' />
        <Button
          variant='ghost'
          size='sm'
          onClick={onFitView}
          className='h-7 w-7 p-0 text-slate-400 hover:bg-white/10 hover:text-white'
        >
          <Maximize2 className='h-3.5 w-3.5' />
        </Button>
      </div>

      {/* Right */}
      <div className='flex shrink-0 items-center gap-1.5'>
        {/* Settings popover — description + labels */}
        <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className={cn(
                'h-8 gap-1.5 text-slate-400 hover:bg-white/5 hover:text-white',
                (description || labels.length > 0) && 'text-violet-400'
              )}
            >
              <Settings className='h-3.5 w-3.5' />
              <span className='hidden text-sm sm:inline'>Settings</span>
              {labels.length > 0 && (
                <span className='flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] font-bold text-white'>
                  {labels.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className='w-80 border-white/10 bg-[#1a1a2e] p-4 text-white'
            align='end'
            sideOffset={8}
          >
            <p className='mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400'>
              Flow Settings
            </p>

            {/* Description */}
            <div className='mb-4'>
              <Label className='mb-1.5 flex items-center gap-1.5 text-xs text-slate-300'>
                <FileText className='h-3 w-3' />
                Description
                <span className='font-normal text-slate-500'>(optional)</span>
              </Label>
              <Textarea
                value={description}
                onChange={e => onDescriptionChange(e.target.value)}
                placeholder='What does this flow do?'
                rows={2}
                className='resize-none border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-600 focus-visible:ring-violet-500'
              />
            </div>

            {/* Labels */}
            <div>
              <Label className='mb-1.5 flex items-center gap-1.5 text-xs text-slate-300'>
                <Tag className='h-3 w-3' />
                Labels
                <span className='font-normal text-slate-500'>(optional)</span>
              </Label>
              <div className='flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/30'>
                {labels.map(label => (
                  <span
                    key={label}
                    className='flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-[11px] font-medium text-violet-300'
                  >
                    {label}
                    <button
                      type='button'
                      onClick={() => removeLabel(label)}
                      className='rounded-full hover:text-white'
                    >
                      <X className='h-2.5 w-2.5' />
                    </button>
                  </span>
                ))}
                <input
                  value={labelInput}
                  onChange={e => setLabelInput(e.target.value)}
                  onKeyDown={handleLabelKeyDown}
                  onBlur={addLabel}
                  placeholder={labels.length === 0 ? 'Add label…' : ''}
                  className='min-w-[80px] flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-600'
                />
              </div>
              <p className='mt-1.5 text-[10px] text-slate-500'>
                Press Enter to add · Backspace to remove
              </p>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant='ghost'
          size='sm'
          onClick={onTestRun}
          className='h-8 gap-1.5 text-slate-400 hover:bg-white/5 hover:text-white'
        >
          <Play className='h-3.5 w-3.5' />
          <span className='hidden text-sm sm:inline'>Test</span>
        </Button>
        <Button
          size='sm'
          onClick={onSaveActivate}
          disabled={isSaving}
          className='h-8 gap-1.5 bg-violet-600 text-white hover:bg-violet-700'
        >
          <Zap className='h-3.5 w-3.5' />
          <span className='hidden sm:inline'>
            {isSaving ? 'Saving…' : 'Save & Activate'}
          </span>
        </Button>
      </div>
    </div>
  );
}
