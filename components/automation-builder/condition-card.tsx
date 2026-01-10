'use client';
import {
  Filter,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type {
  ConditionsConfig,
  Condition,
  ConditionOperator,
} from '@/lib/types/automation-builder';

interface ConditionCardProps {
  conditions: ConditionsConfig;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ConditionsConfig>) => void;
}

export function ConditionCard({
  conditions,
  isSelected,
  onSelect,
  onUpdate,
}: ConditionCardProps) {
  const addCondition = () => {
    const newCondition: Condition = {
      id: `c_${Date.now()}`,
      field: 'comment_text',
      operator: 'contains',
      value: '',
      caseSensitive: false,
    };
    onUpdate({
      conditions: [...conditions.conditions, newCondition],
      enabled: true,
    });
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    onUpdate({
      conditions: conditions.conditions.map(c =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  };

  const removeCondition = (id: string) => {
    const updated = conditions.conditions.filter(c => c.id !== id);
    onUpdate({
      conditions: updated,
      enabled: updated.length > 0 ? conditions.enabled : false,
    });
  };

  const hasEmptyConditions = conditions.conditions.some(c => !c.value.trim());

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:translate-y-[-2px]',
        isSelected
          ? 'ring-2 ring-primary border-primary shadow-lg shadow-primary/10'
          : 'border-border hover:border-primary/50',
        !conditions.enabled && 'opacity-60'
      )}
      onClick={onSelect}
    >
      <CardContent className='p-4'>
        {/* Header */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                conditions.enabled
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Filter className='h-4 w-4' />
            </div>
            <div>
              <p className='text-xs text-muted-foreground uppercase tracking-wide'>
                If
              </p>
              <p className='font-medium text-sm'>
                {conditions.conditions.length > 0
                  ? `${conditions.conditions.length} condition${conditions.conditions.length > 1 ? 's' : ''}`
                  : 'No conditions'}
              </p>
            </div>
          </div>
          <div
            className='flex items-center gap-2'
            onClick={e => e.stopPropagation()}
          >
            <Badge
              variant='secondary'
              className={cn(
                'border',
                conditions.enabled
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  : 'bg-muted text-muted-foreground border-border'
              )}
            >
              Conditions
            </Badge>
            <Switch
              checked={conditions.enabled}
              onCheckedChange={checked => onUpdate({ enabled: checked })}
              className='data-[state=checked]:bg-amber-500'
            />
          </div>
        </div>

        {/* Conditions List */}
        {conditions.enabled && (
          <div className='space-y-3' onClick={e => e.stopPropagation()}>
            {/* Logic selector */}
            {conditions.conditions.length > 1 && (
              <div className='flex items-center gap-2 text-sm'>
                <span className='text-muted-foreground'>Match</span>
                <Select
                  value={conditions.logic}
                  onValueChange={(value: 'and' | 'or') =>
                    onUpdate({ logic: value })
                  }
                >
                  <SelectTrigger className='w-20 h-7 text-xs bg-background/50'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='and'>ALL</SelectItem>
                    <SelectItem value='or'>ANY</SelectItem>
                  </SelectContent>
                </Select>
                <span className='text-muted-foreground'>
                  of these conditions
                </span>
              </div>
            )}

            {/* Condition rows */}
            {conditions.conditions.map((condition, index) => (
              <div key={condition.id} className='flex items-center gap-2'>
                <GripVertical className='h-4 w-4 text-muted-foreground cursor-grab' />

                <Select
                  value={condition.field}
                  onValueChange={(value: Condition['field']) =>
                    updateCondition(condition.id, { field: value })
                  }
                >
                  <SelectTrigger className='w-28 h-8 text-xs bg-background/50'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='comment_text'>Comment</SelectItem>
                    <SelectItem value='username'>Username</SelectItem>
                    <SelectItem value='follower_count'>Followers</SelectItem>
                    <SelectItem value='is_verified'>Verified</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={condition.operator}
                  onValueChange={(value: ConditionOperator) =>
                    updateCondition(condition.id, { operator: value })
                  }
                >
                  <SelectTrigger className='w-24 h-8 text-xs bg-background/50'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='contains'>contains</SelectItem>
                    <SelectItem value='equals'>equals</SelectItem>
                    <SelectItem value='starts_with'>starts with</SelectItem>
                    <SelectItem value='ends_with'>ends with</SelectItem>
                    <SelectItem value='regex'>matches regex</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={condition.value}
                  onChange={e =>
                    updateCondition(condition.id, { value: e.target.value })
                  }
                  placeholder='value...'
                  className='flex-1 h-8 text-xs bg-background/50'
                />

                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 p-0 text-muted-foreground hover:text-destructive'
                  onClick={() => removeCondition(condition.id)}
                >
                  <Trash2 className='h-3.5 w-3.5' />
                </Button>
              </div>
            ))}

            {/* Add condition button */}
            <Button
              variant='outline'
              size='sm'
              className='w-full h-8 text-xs border-dashed bg-transparent'
              onClick={addCondition}
            >
              <Plus className='h-3.5 w-3.5 mr-1' />
              Add Condition
            </Button>
          </div>
        )}

        {/* Empty state when disabled */}
        {!conditions.enabled && (
          <div className='border border-dashed border-border rounded-lg p-4 text-center'>
            <p className='text-xs text-muted-foreground'>Conditions disabled</p>
            <p className='text-xs text-muted-foreground'>
              Enable to filter triggers
            </p>
          </div>
        )}

        {/* Validation indicator */}
        <div className='flex items-center gap-1.5 mt-4 pt-3 border-t border-border'>
          {!conditions.enabled ||
          (conditions.conditions.length > 0 && !hasEmptyConditions) ? (
            <>
              <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
              <span className='text-xs text-emerald-500'>
                {conditions.enabled ? 'Configured' : 'Optional'}
              </span>
            </>
          ) : (
            <>
              <AlertCircle className='h-3.5 w-3.5 text-amber-500' />
              <span className='text-xs text-amber-500'>Missing values</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
