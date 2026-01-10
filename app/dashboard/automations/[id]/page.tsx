'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { BuilderSidebar } from '@/components/automation-builder/builder-sidebar';
import { BuilderCanvas } from '@/components/automation-builder/builder-canvas';
import { BuilderInspector } from '@/components/automation-builder/builder-inspector';
import {
  mockAutomation,
  mockBuilderUIState,
} from '@/lib/mock/automation-builder-data';
import type {
  AutomationBuilder,
  BuilderUIState,
  TriggerConfig,
  ConditionsConfig,
  ActionConfig,
  ActionType,
  SelectedBlock,
} from '@/lib/types/automation-builder';

export default function EditAutomationPage() {
  // const params = useParams();
  // const id = params.id as string;
  const router = useRouter();
  const [automation, setAutomation] =
    useState<AutomationBuilder>(mockAutomation);
  const [uiState, setUiState] = useState<BuilderUIState>(mockBuilderUIState);

  // Update automation
  const updateAutomation = useCallback(
    (updates: Partial<AutomationBuilder>) => {
      setAutomation(prev => ({
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      }));
      setUiState(prev => ({ ...prev, isDirty: true }));
    },
    []
  );

  // Update trigger
  const updateTrigger = useCallback((updates: Partial<TriggerConfig>) => {
    setAutomation(prev => ({
      ...prev,
      trigger: { ...prev.trigger, ...updates },
      updatedAt: new Date().toISOString(),
    }));
    setUiState(prev => ({ ...prev, isDirty: true }));
  }, []);

  // Update conditions
  const updateConditions = useCallback((updates: Partial<ConditionsConfig>) => {
    setAutomation(prev => ({
      ...prev,
      conditions: { ...prev.conditions, ...updates },
      updatedAt: new Date().toISOString(),
    }));
    setUiState(prev => ({ ...prev, isDirty: true }));
  }, []);

  // Update action
  const updateAction = useCallback(
    (actionId: string, updates: Partial<ActionConfig>) => {
      setAutomation(prev => {
        const updatedActions = prev.actions.map(a =>
          a.id === actionId ? { ...a, ...updates } : a
        );
        const estimatedCost = updatedActions
          .filter(a => a.enabled)
          .reduce((sum, a) => sum + a.creditCost, 0);
        return {
          ...prev,
          actions: updatedActions,
          estimatedCreditCost: estimatedCost,
          updatedAt: new Date().toISOString(),
        };
      });
      setUiState(prev => ({ ...prev, isDirty: true }));
    },
    []
  );

  // Add action
  const addAction = useCallback((type: ActionType) => {
    const creditCosts: Record<ActionType, number> = {
      reply_comment: 1,
      send_dm: 2,
      like_comment: 0,
      hide_comment: 0,
      add_tag: 0,
    };

    const newAction: ActionConfig = {
      id: `act_${Date.now()}`,
      type,
      order: 0,
      enabled: true,
      creditCost: creditCosts[type],
      config:
        type === 'reply_comment' ? { useAI: true, aiTone: 'friendly' } : {},
    };

    setAutomation(prev => {
      const maxOrder =
        prev.actions.length > 0
          ? Math.max(...prev.actions.map(a => a.order))
          : 0;
      newAction.order = maxOrder + 1;

      const updatedActions = [...prev.actions, newAction];
      const estimatedCost = updatedActions
        .filter(a => a.enabled)
        .reduce((sum, a) => sum + a.creditCost, 0);

      return {
        ...prev,
        actions: updatedActions,
        estimatedCreditCost: estimatedCost,
        updatedAt: new Date().toISOString(),
      };
    });
    setUiState(prev => ({
      ...prev,
      isDirty: true,
      selectedBlock: { type: 'action', id: newAction.id },
    }));
  }, []);

  // Remove action
  const removeAction = useCallback((actionId: string) => {
    setAutomation(prev => {
      const updatedActions = prev.actions.filter(a => a.id !== actionId);
      const estimatedCost = updatedActions
        .filter(a => a.enabled)
        .reduce((sum, a) => sum + a.creditCost, 0);
      return {
        ...prev,
        actions: updatedActions,
        estimatedCreditCost: estimatedCost,
        updatedAt: new Date().toISOString(),
      };
    });
    setUiState(prev => ({
      ...prev,
      isDirty: true,
      selectedBlock:
        prev.selectedBlock?.id === actionId ? null : prev.selectedBlock,
    }));
  }, []);

  // Reorder action
  const reorderAction = useCallback(
    (actionId: string, direction: 'up' | 'down') => {
      setAutomation(prev => {
        const sortedActions = [...prev.actions].sort(
          (a, b) => a.order - b.order
        );
        const actionIndex = sortedActions.findIndex(a => a.id === actionId);

        if (
          (direction === 'up' && actionIndex === 0) ||
          (direction === 'down' && actionIndex === sortedActions.length - 1)
        ) {
          return prev;
        }

        const swapIndex =
          direction === 'up' ? actionIndex - 1 : actionIndex + 1;
        const tempOrder = sortedActions[actionIndex].order;
        sortedActions[actionIndex].order = sortedActions[swapIndex].order;
        sortedActions[swapIndex].order = tempOrder;

        return {
          ...prev,
          actions: sortedActions,
          updatedAt: new Date().toISOString(),
        };
      });
      setUiState(prev => ({ ...prev, isDirty: true }));
    },
    []
  );

  // Select block
  const selectBlock = useCallback((block: SelectedBlock) => {
    setUiState(prev => ({ ...prev, selectedBlock: block }));
  }, []);

  // Save automation
  const saveAutomation = useCallback(() => {
    setUiState(prev => ({ ...prev, isSaving: true }));

    // Simulate API call
    setTimeout(() => {
      setUiState(prev => ({
        ...prev,
        isSaving: false,
        isDirty: false,
        lastSavedAt: new Date().toISOString(),
      }));
    }, 1000);
  }, []);

  // Delete automation
  const deleteAutomation = () => {
    router.push('/dashboard/automations');
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Top Bar */}
      <div className='h-14 border-b border-border flex items-center justify-between px-4 bg-card/50 shrink-0'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='sm' asChild>
            <Link href='/dashboard/automations'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back
            </Link>
          </Button>
          <div className='h-4 w-px bg-border' />
          <span className='text-sm font-medium'>{automation.name}</span>
        </div>

        <div className='flex items-center gap-2'>
          {uiState.isDirty && (
            <span className='text-xs text-muted-foreground'>
              Unsaved changes
            </span>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='text-destructive hover:text-destructive'
              >
                <Trash2 className='h-4 w-4 mr-2' />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Automation</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{automation.name}"? This
                  action cannot be undone and will stop all running automations.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteAutomation}
                  className='bg-destructive text-destructive-foreground'
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Builder Layout */}
      <div className='flex-1 flex overflow-hidden'>
        {/* Left Sidebar */}
        <BuilderSidebar
          automation={automation}
          uiState={uiState}
          onUpdate={updateAutomation}
          onSave={saveAutomation}
        />

        {/* Center Canvas */}
        <BuilderCanvas
          automation={automation}
          selectedBlock={uiState.selectedBlock}
          onSelectBlock={selectBlock}
          onUpdateTrigger={updateTrigger}
          onUpdateConditions={updateConditions}
          onUpdateAction={updateAction}
          onAddAction={addAction}
          onRemoveAction={removeAction}
          onReorderAction={reorderAction}
        />

        {/* Right Inspector */}
        <BuilderInspector
          automation={automation}
          selectedBlock={uiState.selectedBlock}
          onClose={() => selectBlock(null)}
          onUpdateTrigger={updateTrigger}
          onUpdateConditions={updateConditions}
          onUpdateAction={updateAction}
        />
      </div>
    </div>
  );
}
