'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FlowConnector } from './flow-connector';
import { TriggerCard } from './trigger-card';
import { ConditionCard } from './condition-card';
import { ActionCard } from './action-card';
import type {
  TriggerConfig,
  ActionConfig,
  ActionType,
} from '@/lib/types/automation-builder';

interface SelectedBlock {
  type: 'trigger' | 'conditions' | 'action';
  id: string;
}

interface AutomationBuilder {
  id: string;
  name: string;
  description?: string;
  trigger: TriggerConfig;
  conditions: { id: string };
  actions: ActionConfig[];
}

interface BuilderCanvasProps {
  automation: AutomationBuilder;
  selectedBlock: SelectedBlock;
  onSelectBlock: (block: SelectedBlock) => void;
  onUpdateTrigger: (updates: Partial<TriggerConfig>) => void;
  onUpdateConditions: (updates: Partial<{ id: string }>) => void;
  onUpdateAction: (actionId: string, updates: Partial<ActionConfig>) => void;
  onAddAction: (type: ActionType) => void;
  onRemoveAction: (actionId: string) => void;
  onReorderAction: (actionId: string, direction: 'up' | 'down') => void;
}

export function BuilderCanvas({
  automation,
  selectedBlock,
  onSelectBlock,
  onUpdateTrigger,
  onUpdateConditions,
  onUpdateAction,
  onAddAction,
  onRemoveAction,
  onReorderAction,
}: BuilderCanvasProps) {
  const sortedActions = [...automation.actions].sort(
    (a, b) => a.order - b.order
  );

  return (
    <div className='flex-1 bg-background/30 overflow-y-auto'>
      <div className='max-w-xl mx-auto py-8 px-4'>
        {/* Canvas Header */}
        <div className='text-center mb-8'>
          <h3 className='text-lg font-semibold mb-1'>Automation Flow</h3>
          <p className='text-sm text-muted-foreground'>
            Define when and how your automation runs
          </p>
        </div>

        {/* Flow */}
        <div className='space-y-0'>
          {/* Trigger */}
          <TriggerCard
            trigger={automation.trigger}
            isSelected={
              selectedBlock?.type === 'trigger' &&
              selectedBlock.id === 'trigger'
            }
            onSelect={() => onSelectBlock({ type: 'trigger', id: 'trigger' })}
            onUpdate={onUpdateTrigger}
          />

          <FlowConnector />

          {/* Conditions */}
          <ConditionCard
            conditions={automation.conditions}
            isSelected={
              selectedBlock?.type === 'conditions' &&
              selectedBlock.id === automation.conditions.id
            }
            onSelect={() =>
              onSelectBlock({
                type: 'conditions',
                id: automation.conditions.id,
              })
            }
            onUpdate={onUpdateConditions}
          />

          <FlowConnector />

          {/* Actions */}
          {sortedActions.length > 0 ? (
            <div className='space-y-0'>
              {sortedActions.map((action, index) => (
                <div key={`action-${action.order}`}>
                  <ActionCard
                    action={action}
                    isSelected={
                      selectedBlock?.type === 'action' &&
                      selectedBlock.id === `action-${action.order}`
                    }
                    onSelect={() =>
                      onSelectBlock({
                        type: 'action',
                        id: `action-${action.order}`,
                      })
                    }
                    onUpdate={updates =>
                      onUpdateAction(`action-${action.order}`, updates)
                    }
                    onRemove={() => onRemoveAction(`action-${action.order}`)}
                    canMoveUp={index > 0}
                    canMoveDown={index < sortedActions.length - 1}
                    onMoveUp={() =>
                      onReorderAction(`action-${action.order}`, 'up')
                    }
                    onMoveDown={() =>
                      onReorderAction(`action-${action.order}`, 'down')
                    }
                  />
                  {index < sortedActions.length - 1 && (
                    <FlowConnector variant='dashed' />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='border-2 border-dashed border-border rounded-xl p-8 text-center'>
              <div className='w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center'>
                <Plus className='h-6 w-6 text-muted-foreground' />
              </div>
              <p className='font-medium mb-1'>No actions yet</p>
              <p className='text-sm text-muted-foreground mb-4'>
                Add actions to define what happens when triggered
              </p>
            </div>
          )}

          {/* Add Action Button */}
          <div className='mt-4'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className='w-full border-dashed bg-transparent'
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Add Action
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='center' className='w-48'>
                <DropdownMenuItem onClick={() => onAddAction('send_message')}>
                  <span className='w-2 h-2 rounded-full bg-emerald-500 mr-2' />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddAction('add_tag')}>
                  <span className='w-2 h-2 rounded-full bg-blue-500 mr-2' />
                  Add Tag
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddAction('capture_lead')}>
                  <span className='w-2 h-2 rounded-full bg-pink-500 mr-2' />
                  Capture Lead
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddAction('assign_bot')}>
                  <span className='w-2 h-2 rounded-full bg-purple-500 mr-2' />
                  Assign Bot
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAddAction('send_notification')}
                >
                  <span className='w-2 h-2 rounded-full bg-slate-500 mr-2' />
                  Send Notification
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Action Summary */}
          {sortedActions.length > 0 && (
            <div className='mt-6 p-4 bg-card/50 rounded-xl border border-border'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>Actions Configured</p>
                  <p className='text-xs text-muted-foreground'>
                    {sortedActions.length} action
                    {sortedActions.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
