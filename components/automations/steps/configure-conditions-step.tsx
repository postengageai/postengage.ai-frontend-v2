'use client';

import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type {
  ConditionConfig,
  ConditionOperator,
} from '@/lib/types/automation-builder';

interface ConfigureConditionsStepProps {
  conditions: ConditionConfig[];
  onChange: (conditions: ConditionConfig[]) => void;
}

export function ConfigureConditionsStep({
  conditions,
  onChange,
}: ConfigureConditionsStepProps) {
  const addCondition = () => {
    const newCondition: ConditionConfig = {
      id: `cond_${Date.now()}`,
      condition_type: 'KEYWORD',
      condition_operator: 'CONTAINS',
      condition_value: [],
      condition_keyword_mode: 'ANY',
    };
    onChange([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    onChange(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<ConditionConfig>) => {
    onChange(conditions.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-semibold'>Add conditions (optional)</h2>
        <p className='text-muted-foreground mt-2'>
          Filter which comments or messages trigger the automation
        </p>
      </div>

      {conditions.length === 0 ? (
        <Card className='p-8 text-center border-dashed'>
          <p className='text-muted-foreground mb-4'>
            No conditions added. The automation will run for all triggers.
          </p>
          <Button onClick={addCondition} variant='outline'>
            <Plus className='h-4 w-4 mr-2' />
            Add Condition
          </Button>
        </Card>
      ) : (
        <div className='space-y-4'>
          {conditions.map((condition, index) => (
            <Card key={condition.id} className='p-4'>
              <div className='flex items-start gap-4'>
                <div className='flex-1 space-y-4'>
                  <div className='flex items-center gap-2'>
                    {index > 0 && (
                      <Badge variant='secondary' className='mr-2'>
                        AND
                      </Badge>
                    )}
                    <div className='flex-1'>
                      <Label className='text-xs text-muted-foreground'>
                        When text
                      </Label>
                      <Select
                        value={condition.condition_operator}
                        onValueChange={value =>
                          updateCondition(condition.id, {
                            condition_operator: value as ConditionOperator,
                          })
                        }
                      >
                        <SelectTrigger className='mt-1'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='CONTAINS'>Contains</SelectItem>
                          <SelectItem value='EQUALS'>Equals</SelectItem>
                          <SelectItem value='STARTS_WITH'>
                            Starts with
                          </SelectItem>
                          <SelectItem value='ENDS_WITH'>Ends with</SelectItem>
                          <SelectItem value='NOT_CONTAINS'>
                            Does not contain
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className='text-xs text-muted-foreground'>
                      Keywords (comma separated)
                    </Label>
                    <Input
                      placeholder='price, cost, how much'
                      value={condition.condition_value.join(', ')}
                      onChange={e =>
                        updateCondition(condition.id, {
                          condition_value: e.target.value
                            .split(',')
                            .map(k => k.trim())
                            .filter(Boolean),
                        })
                      }
                      className='mt-1'
                    />
                  </div>
                </div>

                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => removeCondition(condition.id)}
                  className='shrink-0'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </Card>
          ))}

          <Button onClick={addCondition} variant='outline' size='sm'>
            <Plus className='h-4 w-4 mr-2' />
            Add Another Condition
          </Button>
        </div>
      )}
    </div>
  );
}
