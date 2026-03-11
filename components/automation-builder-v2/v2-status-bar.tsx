'use client';

import { Zap, Filter, Sparkles, AlertTriangle } from 'lucide-react';
import type { FlowNode, ValidationError } from './types';

interface V2StatusBarProps {
  nodes: FlowNode[];
  errors: ValidationError[];
}

export function V2StatusBar({ nodes, errors }: V2StatusBarProps) {
  const triggerCount = nodes.filter(n => n.category === 'trigger').length;
  const conditionCount = nodes.filter(n => n.category === 'condition').length;
  const actionCount = nodes.filter(n => n.category === 'action').length;
  const totalNodes = nodes.length;

  return (
    <div className='flex h-9 flex-shrink-0 items-center justify-between border-t border-white/10 bg-[#0d0d1a] px-4'>
      {/* Left: node counts */}
      <div className='flex items-center gap-4 text-[11px] text-slate-500'>
        <span className='font-medium text-slate-400'>
          {totalNodes} node{totalNodes !== 1 ? 's' : ''}
        </span>
        <span className='h-3 w-px bg-white/10' />

        <span className='flex items-center gap-1'>
          <Zap className='h-3 w-3 text-amber-400' />
          {triggerCount} trigger{triggerCount !== 1 ? 's' : ''}
        </span>

        <span className='flex items-center gap-1'>
          <Filter className='h-3 w-3 text-violet-400' />
          {conditionCount} condition{conditionCount !== 1 ? 's' : ''}
        </span>

        <span className='flex items-center gap-1'>
          <Sparkles className='h-3 w-3 text-blue-400' />
          {actionCount} action{actionCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Right: errors indicator */}
      <div className='flex items-center gap-3 text-[11px]'>
        {errors.length > 0 ? (
          <span className='flex items-center gap-1 text-amber-400'>
            <AlertTriangle className='h-3 w-3' />
            {errors.length} issue{errors.length !== 1 ? 's' : ''}
          </span>
        ) : totalNodes > 0 ? (
          <span className='text-green-500'>● All nodes valid</span>
        ) : null}

        <span className='text-slate-600'>Flow Builder v2</span>
      </div>
    </div>
  );
}
