'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Pencil,
  Settings,
  Play,
  Zap,
  Minus,
  Plus,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface V2ToolbarProps {
  name: string;
  status: 'draft' | 'active' | 'paused';
  zoom: number;
  onNameChange: (name: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onSettings: () => void;
  onTestRun: () => void;
  onSaveActivate: () => void;
  onBack: () => void;
  isSaving?: boolean;
}

export function V2Toolbar({
  name,
  status,
  zoom,
  onNameChange,
  onZoomIn,
  onZoomOut,
  onFitView,
  onSettings,
  onTestRun,
  onSaveActivate,
  onBack,
  isSaving,
}: V2ToolbarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);

  const commitName = () => {
    if (editValue.trim()) onNameChange(editValue.trim());
    else setEditValue(name);
    setIsEditing(false);
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
      <div className='flex items-center gap-3'>
        <Button
          variant='ghost'
          size='sm'
          onClick={onBack}
          className='h-8 gap-1.5 text-slate-400 hover:bg-white/5 hover:text-white'
        >
          <ArrowLeft className='h-3.5 w-3.5' />
          <span className='hidden sm:inline text-sm'>Automations</span>
        </Button>

        {/* Editable title */}
        <div className='flex items-center gap-1.5'>
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
              className='h-7 w-52 border-white/20 bg-white/5 text-sm text-white focus-visible:ring-violet-500'
            />
          ) : (
            <button
              onClick={() => {
                setEditValue(name);
                setIsEditing(true);
              }}
              className='flex items-center gap-1.5 rounded px-1.5 py-1 text-sm font-medium text-white hover:bg-white/5'
            >
              {name}
              <Pencil className='h-3 w-3 text-slate-500' />
            </button>
          )}

          <div className='flex items-center gap-1.5'>
            <span className={cn('h-2 w-2 rounded-full', sc.dot)} />
            <span className={cn('text-xs font-medium', sc.text)}>
              {sc.label}
            </span>
          </div>
        </div>
      </div>

      {/* Center - zoom controls */}
      <div className='flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-1'>
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
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={onSettings}
          className='h-8 gap-1.5 text-slate-400 hover:bg-white/5 hover:text-white'
        >
          <Settings className='h-3.5 w-3.5' />
          <span className='hidden sm:inline text-sm'>Settings</span>
        </Button>
        <Button
          variant='ghost'
          size='sm'
          onClick={onTestRun}
          className='h-8 gap-1.5 text-slate-400 hover:bg-white/5 hover:text-white'
        >
          <Play className='h-3.5 w-3.5' />
          <span className='hidden sm:inline text-sm'>Test Run</span>
        </Button>
        <Button
          size='sm'
          onClick={onSaveActivate}
          disabled={isSaving}
          className='h-8 gap-1.5 bg-violet-600 text-white hover:bg-violet-700'
        >
          <Zap className='h-3.5 w-3.5' />
          <span className='hidden sm:inline'>
            {isSaving ? 'Saving...' : 'Save & Activate'}
          </span>
        </Button>
      </div>
    </div>
  );
}
