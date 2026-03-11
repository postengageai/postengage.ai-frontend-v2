'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  SIDEBAR_GROUPS,
  getActionsForTrigger,
  type NodeDefinition,
} from './node-definitions';
import type {
  FlowNodeDefinitionId,
  TriggerNodeId,
  ActionNodeId,
} from './types';
import { cn } from '@/lib/utils';

interface V2NodePanelProps {
  onAddNode: (definitionId: FlowNodeDefinitionId) => void;
  /** The currently placed trigger node ID — used to dim incompatible action nodes */
  activeTriggerNodeId: TriggerNodeId | null;
}

export function V2NodePanel({
  onAddNode,
  activeTriggerNodeId,
}: V2NodePanelProps) {
  const [search, setSearch] = useState('');

  // Determine which action IDs are allowed given the current trigger
  const allowedActions: ActionNodeId[] | null = activeTriggerNodeId
    ? getActionsForTrigger(activeTriggerNodeId)
    : null;

  const filtered = search.trim()
    ? SIDEBAR_GROUPS.map(group => ({
        ...group,
        nodes: group.nodes.filter(
          n =>
            n.label.toLowerCase().includes(search.toLowerCase()) ||
            n.description.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(g => g.nodes.length > 0)
    : SIDEBAR_GROUPS;

  const handleDragStart = (
    e: React.DragEvent,
    definitionId: FlowNodeDefinitionId
  ) => {
    e.dataTransfer.setData('text/plain', definitionId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  /** Returns true when the node should be dimmed (incompatible with current trigger) */
  const isDisabled = (node: NodeDefinition): boolean => {
    if (node.category !== 'action') return false;
    if (!allowedActions) return false;
    return !allowedActions.includes(node.id as ActionNodeId);
  };

  return (
    <aside className='flex w-[232px] flex-shrink-0 flex-col border-r border-white/10 bg-[#0d0d1a]'>
      {/* Panel Header */}
      <div className='border-b border-white/10 px-4 py-3'>
        <p className='text-[10px] font-semibold uppercase tracking-widest text-slate-500'>
          Nodes
        </p>
        <p className='mt-0.5 text-xs text-slate-600'>
          Drag to canvas or click to add
        </p>
      </div>

      {/* Search */}
      <div className='px-3 py-2.5'>
        <div className='relative'>
          <Search className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600' />
          <Input
            placeholder='Search nodes...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='h-8 border-white/10 bg-white/5 pl-8 text-xs text-slate-300 placeholder:text-slate-600 focus-visible:ring-violet-500'
          />
        </div>
      </div>

      {/* Node groups */}
      <div className='flex-1 overflow-y-auto px-2 pb-4'>
        {filtered.map(group => (
          <div key={group.label} className='mb-4'>
            <div className='mb-1.5 flex items-center gap-1.5 px-2 py-1'>
              <span className='text-[10px] font-semibold uppercase tracking-widest text-slate-500'>
                {group.icon} {group.label}
              </span>
            </div>
            <div className='space-y-0.5'>
              {group.nodes.map(node => {
                const disabled = isDisabled(node);
                return (
                  <DraggableNodeItem
                    key={node.id}
                    node={node}
                    disabled={disabled}
                    onDragStart={handleDragStart}
                    onClick={() => !disabled && onAddNode(node.id)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function DraggableNodeItem({
  node,
  disabled,
  onDragStart,
  onClick,
}: {
  node: NodeDefinition;
  disabled: boolean;
  onDragStart: (e: React.DragEvent, id: FlowNodeDefinitionId) => void;
  onClick: () => void;
}) {
  const Icon = node.icon;
  return (
    <div
      draggable={!disabled}
      onDragStart={e => !disabled && onDragStart(e, node.id)}
      onClick={onClick}
      title={
        disabled ? 'Not available for the current trigger' : `Add ${node.label}`
      }
      className={cn(
        'group flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-all',
        disabled
          ? 'cursor-not-allowed opacity-30'
          : 'cursor-grab hover:bg-white/5 active:cursor-grabbing'
      )}
    >
      <div
        className={cn(
          'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md',
          node.iconBg
        )}
      >
        <Icon className={cn('h-3.5 w-3.5', node.iconColor)} />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-1.5'>
          <p className='text-xs font-medium text-slate-200'>{node.label}</p>
          {node.badge && (
            <span className='rounded-full bg-amber-500/20 px-1.5 py-0 text-[9px] font-semibold text-amber-400'>
              {node.badge}
            </span>
          )}
        </div>
        <p className='truncate text-[10px] text-slate-500'>
          {node.description}
        </p>
      </div>
    </div>
  );
}
