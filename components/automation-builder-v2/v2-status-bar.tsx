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
    <div className='flex h-9 flex-shrink-0 items-center justify-between overflow-x-auto border-t border-white/10 bg-[#0d0d1a] px-3 sm:px-4'>
      {/* Left: node counts — abbreviated on mobile */}
      <div className='flex shrink-0 items-center gap-2.5 text-[11px] text-slate-500 sm:gap-4'>
        <span className='font-medium text-slate-400'>
          {totalNodes}n
          <span className='hidden sm:inline'>
            ode{totalNodes !== 1 ? 's' : ''}
          </span>
        </span>
        <span className='h-3 w-px bg-white/10' />

        <span className='flex items-center gap-1'>
          <Zap className='h-3 w-3 text-amber-400' />
          <span className='hidden sm:inline'>
            {triggerCount} trigger{triggerCount !== 1 ? 's' : ''}
          </span>
          <span className='sm:hidden'>{triggerCount}T</span>
        </span>

        <span className='flex items-center gap-1'>
          <Filter className='h-3 w-3 text-violet-400' />
          <span className='hidden sm:inline'>
            {conditionCount} condition{conditionCount !== 1 ? 's' : ''}
          </span>
          <span className='sm:hidden'>{conditionCount}C</span>
        </span>

        <span className='flex items-center gap-1'>
          <Sparkles className='h-3 w-3 text-blue-400' />
          <span className='hidden sm:inline'>
            {actionCount} action{actionCount !== 1 ? 's' : ''}
          </span>
          <span className='sm:hidden'>{actionCount}A</span>
        </span>
      </div>

      {/* Right: errors indicator */}
      <div className='flex shrink-0 items-center gap-2 text-[11px] sm:gap-3'>
        {errors.length > 0 ? (
          <span className='flex items-center gap-1 text-amber-400'>
            <AlertTriangle className='h-3 w-3' />
            {errors.length}
            <span className='hidden sm:inline'>
              {' '}
              issue{errors.length !== 1 ? 's' : ''}
            </span>
          </span>
        ) : totalNodes > 0 ? (
          <span className='text-green-500'>
            ●<span className='hidden sm:inline'> All nodes valid</span>
          </span>
        ) : null}

        <span className='hidden text-slate-600 sm:inline'>Flow Builder v2</span>
      </div>
    </div>
  );
}
