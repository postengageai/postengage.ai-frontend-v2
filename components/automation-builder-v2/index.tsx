'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { IntelligenceApi } from '@/lib/api/intelligence';
import type { Bot } from '@/lib/types/intelligence';
import { V2Toolbar } from './v2-toolbar';
import { V2NodePanel } from './v2-node-panel';
import { V2Canvas } from './v2-canvas';
import { V2Inspector } from './v2-inspector';
import { V2StatusBar } from './v2-status-bar';
import { getActionsForTrigger, getNodeDef } from './node-definitions';
import type {
  FlowNode,
  FlowNodeDefinitionId,
  TriggerNodeId,
  ActionNodeId,
  BuilderState,
  NodeConfig,
  ValidationError,
  ReplyCommentConfig,
  PrivateReplyConfig,
  SendDmConfig,
} from './types';
import { DEFAULT_CONFIGS } from './types';

// ── helpers ───────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function hasAiReply(node: FlowNode): boolean {
  if (node.category !== 'action') return false;
  const config = node.config as
    | ReplyCommentConfig
    | PrivateReplyConfig
    | SendDmConfig;
  return Boolean(config.use_ai_reply);
}

function validateNodes(
  nodes: FlowNode[],
  botId: string | undefined
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (nodes.length === 0) return errors;

  const triggers = nodes.filter(n => n.category === 'trigger');
  if (triggers.length === 0) {
    errors.push({
      nodeId: null,
      message: 'Your flow needs at least one trigger node.',
    });
  }
  if (triggers.length > 1) {
    errors.push({
      nodeId: triggers[1].id,
      message: 'Only one trigger node is allowed per flow.',
    });
  }

  const actions = nodes.filter(n => n.category === 'action');
  if (actions.length === 0) {
    errors.push({
      nodeId: null,
      message: 'Add at least one action node to your flow.',
    });
  }

  // Check trigger + action compatibility
  if (triggers.length === 1) {
    const trigId = triggers[0].definitionId as TriggerNodeId;
    const allowed = getActionsForTrigger(trigId);
    for (const action of actions) {
      if (!allowed.includes(action.definitionId as ActionNodeId)) {
        errors.push({
          nodeId: action.id,
          message: `"${getNodeDef(action.definitionId).label}" is not compatible with the selected trigger. Remove it or change the trigger.`,
        });
      }
    }
  }

  // AI validation: if any action uses AI, require a bot + fallback message
  const aiActions = actions.filter(hasAiReply);
  if (aiActions.length > 0) {
    if (!botId) {
      errors.push({
        nodeId: null,
        message: 'Select an AI Bot in the AI Settings tab before activating.',
      });
    }

    for (const node of aiActions) {
      const config = node.config as
        | ReplyCommentConfig
        | PrivateReplyConfig
        | SendDmConfig;
      const hasText =
        'text' in config &&
        typeof config.text === 'string' &&
        config.text.trim().length > 0;
      if (!hasText) {
        errors.push({
          nodeId: node.id,
          message: `"${getNodeDef(node.definitionId).label}" requires a fallback message when AI is enabled.`,
        });
      }
    }
  }

  return errors;
}

// ── component ─────────────────────────────────────────────────────────────

interface AutomationBuilderV2Props {
  initialState?: Partial<BuilderState>;
  onSave?: (state: BuilderState) => Promise<void> | void;
}

export function AutomationBuilderV2({
  initialState,
  onSave,
}: AutomationBuilderV2Props) {
  const router = useRouter();

  const [name, setName] = useState(initialState?.name || 'Untitled Automation');
  const [status, setStatus] = useState<BuilderState['status']>(
    initialState?.status || 'draft'
  );
  const [nodes, setNodes] = useState<FlowNode[]>(initialState?.nodes || []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Bot state (needed for AI action validation)
  const [bots, setBots] = useState<Bot[]>([]);
  const [selectedBotId, setSelectedBotId] = useState<string | undefined>(
    initialState?.bot_id
  );

  // Derive the active trigger node (at most one)
  const activeTrigger = nodes.find(n => n.category === 'trigger') ?? null;
  const activeTriggerNodeId = activeTrigger
    ? (activeTrigger.definitionId as TriggerNodeId)
    : null;

  const selectedNode = nodes.find(n => n.id === selectedNodeId) ?? null;

  // Fetch bots when component mounts
  useEffect(() => {
    IntelligenceApi.getBots()
      .then(res => setBots(res.data || []))
      .catch(() => setBots([]));
  }, []);

  // ── node operations ────────────────────────────────────────────────────

  const addNode = useCallback(
    (definitionId: FlowNodeDefinitionId) => {
      const def = getNodeDef(definitionId);

      // Enforce: only one trigger
      if (
        def.category === 'trigger' &&
        nodes.some(n => n.category === 'trigger')
      ) {
        setErrors([
          {
            nodeId: null,
            message:
              'Only one trigger node is allowed. Remove the existing trigger first.',
          },
        ]);
        return;
      }

      // Enforce: action must be compatible with the active trigger
      if (def.category === 'action' && activeTriggerNodeId) {
        const allowed = getActionsForTrigger(activeTriggerNodeId);
        if (!allowed.includes(definitionId as ActionNodeId)) {
          const triggerLabel = getNodeDef(activeTriggerNodeId).label;
          const allowedLabels = allowed.map(id => getNodeDef(id).label);
          setErrors([
            {
              nodeId: null,
              message: `"${def.label}" is not available for the "${triggerLabel}" trigger. Allowed: ${allowedLabels.join(', ')}.`,
            },
          ]);
          return;
        }
      }

      // Enforce: each action type only once
      if (
        def.category === 'action' &&
        nodes.some(n => n.definitionId === definitionId)
      ) {
        setErrors([
          {
            nodeId: null,
            message: `"${def.label}" is already in the flow. Each action can only be added once.`,
          },
        ]);
        return;
      }

      const newNode: FlowNode = {
        id: generateId(),
        definitionId,
        category: def.category,
        order: nodes.length,
        config: { ...DEFAULT_CONFIGS[definitionId] },
      };

      setNodes(prev => {
        const updated = [...prev, newNode];
        const order: Record<FlowNode['category'], number> = {
          trigger: 0,
          condition: 1,
          action: 2,
        };
        return updated
          .sort((a, b) => order[a.category] - order[b.category])
          .map((n, i) => ({ ...n, order: i }));
      });

      setErrors([]);
      setSelectedNodeId(newNode.id);
    },
    [nodes, activeTriggerNodeId]
  );

  const deleteNode = useCallback(
    (id: string) => {
      const target = nodes.find(n => n.id === id);
      if (!target) return;

      setNodes(prev => {
        // Deleting the trigger → cascade-remove all actions & conditions too
        // (they were built for that trigger and may be incompatible with the next one)
        const idsToRemove =
          target.category === 'trigger'
            ? new Set(prev.map(n => n.id)) // remove everything
            : new Set([id]);

        return prev
          .filter(n => !idsToRemove.has(n.id))
          .map((n, i) => ({ ...n, order: i }));
      });

      setSelectedNodeId(prev => (prev === id ? null : prev));
      setErrors([]);

      if (target.category === 'trigger') {
        toast({
          title: 'Trigger removed',
          description:
            'All dependent actions and conditions were removed along with the trigger.',
        });
      }
    },
    [nodes]
  );

  const duplicateNode = useCallback(
    (id: string) => {
      const original = nodes.find(n => n.id === id);
      if (!original || original.category === 'trigger') return;

      if (
        original.category === 'action' &&
        nodes.some(n => n.definitionId === original.definitionId && n.id !== id)
      ) {
        toast({
          title: 'Cannot duplicate',
          description: 'Each action type can only appear once in a flow.',
          variant: 'destructive',
        });
        return;
      }

      const copy: FlowNode = {
        ...original,
        id: generateId(),
        order: original.order + 0.5,
        config: { ...original.config },
      };

      setNodes(prev =>
        [...prev, copy]
          .sort((a, b) => a.order - b.order)
          .map((n, i) => ({ ...n, order: i }))
      );
      setSelectedNodeId(copy.id);
    },
    [nodes]
  );

  const updateNodeConfig = useCallback(
    (nodeId: string, patch: Partial<NodeConfig>) => {
      setNodes(prev =>
        prev.map(n =>
          n.id === nodeId ? { ...n, config: { ...n.config, ...patch } } : n
        )
      );
    },
    []
  );

  // ── save / activate ────────────────────────────────────────────────────

  const handleSave = async (activate: boolean) => {
    const validationErrors = validateNodes(nodes, selectedBotId);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast({
        title: 'Fix issues before saving',
        description: validationErrors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const state: BuilderState = {
        id: initialState?.id || generateId(),
        name,
        status: activate ? 'active' : 'draft',
        nodes,
        bot_id: selectedBotId,
      };
      setStatus(state.status);
      await onSave?.(state);
      router.push('/dashboard/automations');
    } catch (_err) {
      toast({
        title: 'Save failed',
        description: 'An error occurred while saving. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='flex h-screen flex-col bg-[#0a0a14] text-white'>
      <V2Toolbar
        name={name}
        status={status}
        zoom={zoom}
        isSaving={isSaving}
        onNameChange={setName}
        onZoomIn={() => setZoom(z => Math.min(z + 10, 200))}
        onZoomOut={() => setZoom(z => Math.max(z - 10, 50))}
        onFitView={() => setZoom(100)}
        onSettings={() => {}}
        onTestRun={() => {}}
        onSaveActivate={() => handleSave(true)}
        onBack={() => router.push('/dashboard/automations')}
      />

      <div className='flex flex-1 overflow-hidden'>
        <V2NodePanel
          onAddNode={addNode}
          activeTriggerNodeId={activeTriggerNodeId}
        />

        <V2Canvas
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          errors={errors}
          onSelectNode={setSelectedNodeId}
          onDeleteNode={deleteNode}
          onDuplicateNode={duplicateNode}
          onDropNode={addNode}
          onAddTrigger={() => addNode('new_comment')}
          onDismissError={nodeId =>
            setErrors(prev =>
              nodeId === null
                ? prev.filter(e => e.nodeId !== null)
                : prev.filter(e => e.nodeId !== nodeId)
            )
          }
        />

        {selectedNode && (
          <V2Inspector
            node={selectedNode}
            bots={bots}
            selectedBotId={selectedBotId}
            onSelectBot={setSelectedBotId}
            onUpdateConfig={updateNodeConfig}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>

      <V2StatusBar nodes={nodes} errors={errors} />
    </div>
  );
}
