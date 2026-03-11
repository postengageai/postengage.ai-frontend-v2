'use client';

import { useRef } from 'react';
import { Zap, LayoutTemplate, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { V2FlowNode } from './v2-flow-node';
import { V2Connector } from './v2-connector';
import type { FlowNode, ValidationError, FlowNodeDefinitionId } from './types';

interface V2CanvasProps {
  nodes: FlowNode[];
  selectedNodeId: string | null;
  errors: ValidationError[];
  onSelectNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onDropNode: (definitionId: FlowNodeDefinitionId) => void;
  onAddTrigger: () => void;
  onDismissError: (nodeId: string | null) => void;
}

export function V2Canvas({
  nodes,
  selectedNodeId,
  errors,
  onSelectNode,
  onDeleteNode,
  onDuplicateNode,
  onDropNode,
  onAddTrigger,
  onDismissError,
}: V2CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const definitionId = e.dataTransfer.getData(
      'text/plain'
    ) as FlowNodeDefinitionId;
    if (definitionId) {
      onDropNode(definitionId);
    }
  };

  // Compute action index for each action node (0-based)
  let actionCounter = -1;
  const getActionIndex = (node: FlowNode): number | undefined => {
    if (node.category !== 'action') return undefined;
    actionCounter++;
    return actionCounter;
  };
  // Reset counter before render
  actionCounter = -1;

  const actionIndices = nodes.map(node => getActionIndex(node));

  // Connector labels: after trigger = "THEN", after condition = "THEN"
  const getConnectorLabel = (index: number): string | undefined => {
    if (index < nodes.length - 1) {
      if (nodes[index].category === 'trigger') return 'THEN';
      if (nodes[index].category === 'condition') return 'THEN';
      return undefined;
    }
    return undefined;
  };

  return (
    <div
      ref={canvasRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className='relative flex h-full w-full flex-1 flex-col items-center overflow-auto bg-[#0a0a14]'
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      {/* Error banner */}
      {errors.length > 0 && (
        <div className='sticky top-4 z-10 w-full max-w-sm'>
          {errors.map((err, i) => (
            <div
              key={i}
              className='mb-2 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 shadow-lg'
            >
              <AlertTriangle className='mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400' />
              <p className='flex-1 text-sm text-amber-300'>{err.message}</p>
              <button
                onClick={() => onDismissError(err.nodeId)}
                className='text-amber-400 hover:text-amber-200'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {nodes.length === 0 ? (
        <div className='flex h-full flex-col items-center justify-center gap-6 px-6 py-20'>
          <div className='flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-[#131320]'>
            <Zap className='h-8 w-8 text-violet-400' />
          </div>
          <div className='text-center'>
            <h3 className='mb-2 text-xl font-bold text-white'>
              Start building your flow
            </h3>
            <p className='max-w-xs text-sm text-slate-500'>
              Drag nodes from the left panel onto the canvas, or click below to
              add your first trigger.
            </p>
          </div>
          <div className='flex flex-wrap justify-center gap-3'>
            <Button
              onClick={onAddTrigger}
              className='gap-2 bg-violet-600 text-white hover:bg-violet-700'
            >
              <Zap className='h-4 w-4' />
              Add Trigger Node
            </Button>
            <Button
              variant='outline'
              className='gap-2 border-white/10 bg-transparent text-slate-300 hover:bg-white/5'
            >
              <LayoutTemplate className='h-4 w-4' />
              Browse Templates
            </Button>
          </div>
        </div>
      ) : (
        /* Flow nodes */
        <div className='flex min-h-full flex-col items-center py-10'>
          {nodes.map((node, index) => {
            const actionIdx = actionIndices[index];
            const nodeErrors = errors.filter(e => e.nodeId === node.id);
            const hasError = nodeErrors.length > 0;
            const connectorLabel = getConnectorLabel(index);

            return (
              <div key={node.id} className='flex flex-col items-center'>
                <V2FlowNode
                  node={node}
                  actionIndex={actionIdx}
                  isSelected={selectedNodeId === node.id}
                  hasError={hasError}
                  onSelect={() => onSelectNode(node.id)}
                  onDelete={() => onDeleteNode(node.id)}
                  onDuplicate={
                    node.category !== 'trigger'
                      ? () => onDuplicateNode(node.id)
                      : undefined
                  }
                />
                {index < nodes.length - 1 && (
                  <V2Connector label={connectorLabel} />
                )}
              </div>
            );
          })}

          {/* Drop zone hint at bottom */}
          <div className='mt-4 flex h-14 w-[260px] items-center justify-center rounded-xl border-2 border-dashed border-white/10 text-xs text-slate-600 transition-colors hover:border-violet-500/40 hover:text-violet-400'>
            + Drop node here
          </div>
        </div>
      )}
    </div>
  );
}
