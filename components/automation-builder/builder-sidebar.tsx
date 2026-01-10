'use client';

import { useState } from 'react';
import {
  Instagram,
  Play,
  Pause,
  Clock,
  Zap,
  Timer,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type {
  AutomationBuilder,
  ExecutionMode,
  BuilderUIState,
} from '@/lib/types/automation-builder';

interface BuilderSidebarProps {
  automation: AutomationBuilder;
  uiState: BuilderUIState;
  onUpdate: (updates: Partial<AutomationBuilder>) => void;
  onSave: () => void;
}

export function BuilderSidebar({
  automation,
  uiState,
  onUpdate,
  onSave,
}: BuilderSidebarProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(automation.name);

  const handleNameSave = () => {
    onUpdate({ name: nameValue });
    setIsEditingName(false);
  };

  const handleStatusToggle = (checked: boolean) => {
    onUpdate({
      status: checked ? 'active' : 'paused',
      pausedReason: checked ? undefined : 'Paused by user',
    });
  };

  const isActive = automation.status === 'active';
  const successRate =
    automation.statistics.totalExecutions > 0
      ? Math.round(
          (automation.statistics.successfulExecutions /
            automation.statistics.totalExecutions) *
            100
        )
      : 0;

  const trendIsPositive = automation.statistics.trend.executionsChange >= 0;

  return (
    <div className='w-72 border-r border-border bg-card/50 flex flex-col h-full'>
      {/* Header */}
      <div className='p-4 border-b border-border'>
        {/* Editable Name */}
        <div className='mb-3'>
          {isEditingName ? (
            <div className='flex gap-2'>
              <Input
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                className='h-8 text-sm'
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleNameSave()}
              />
              <Button
                size='sm'
                variant='ghost'
                onClick={handleNameSave}
                className='h-8 px-2'
              >
                <CheckCircle2 className='h-4 w-4' />
              </Button>
            </div>
          ) : (
            <h2
              className='font-semibold text-lg cursor-pointer hover:text-primary transition-colors'
              onClick={() => setIsEditingName(true)}
              title='Click to edit'
            >
              {automation.name}
            </h2>
          )}
        </div>

        {/* Status Toggle */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            {isActive ? (
              <Play className='h-4 w-4 text-emerald-500' />
            ) : (
              <Pause className='h-4 w-4 text-amber-500' />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                isActive ? 'text-emerald-500' : 'text-amber-500'
              )}
            >
              {isActive ? 'Active' : 'Paused'}
            </span>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={handleStatusToggle}
            className='data-[state=checked]:bg-emerald-500'
          />
        </div>

        {automation.pausedReason && !isActive && (
          <p className='text-xs text-muted-foreground mt-1.5 pl-6'>
            {automation.pausedReason}
          </p>
        )}
      </div>

      {/* Scrollable Content */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {/* Platform */}
        <div className='space-y-2'>
          <Label className='text-xs text-muted-foreground uppercase tracking-wide'>
            Platform
          </Label>
          <div className='flex items-center gap-2 bg-background/50 rounded-lg p-2.5 border border-border'>
            <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center'>
              <Instagram className='h-4 w-4 text-white' />
            </div>
            <span className='font-medium text-sm'>Instagram</span>
            <Badge variant='outline' className='ml-auto text-xs'>
              Connected
            </Badge>
          </div>
        </div>

        {/* Execution Mode */}
        <div className='space-y-2'>
          <Label className='text-xs text-muted-foreground uppercase tracking-wide'>
            Execution Mode
          </Label>
          <Select
            value={automation.executionMode}
            onValueChange={(value: ExecutionMode) =>
              onUpdate({ executionMode: value })
            }
          >
            <SelectTrigger className='bg-background/50'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='real_time'>
                <div className='flex items-center gap-2'>
                  <Zap className='h-4 w-4 text-amber-500' />
                  <span>Real-time</span>
                </div>
              </SelectItem>
              <SelectItem value='delayed'>
                <div className='flex items-center gap-2'>
                  <Timer className='h-4 w-4 text-blue-500' />
                  <span>Delayed</span>
                </div>
              </SelectItem>
              <SelectItem value='scheduled'>
                <div className='flex items-center gap-2'>
                  <Clock className='h-4 w-4 text-purple-500' />
                  <span>Scheduled</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {automation.executionMode === 'delayed' && (
            <div className='pt-2'>
              <Label className='text-xs text-muted-foreground'>
                Delay (seconds)
              </Label>
              <Input
                type='number'
                value={automation.delaySeconds || 30}
                onChange={e =>
                  onUpdate({
                    delaySeconds: Number.parseInt(e.target.value) || 30,
                  })
                }
                className='mt-1 bg-background/50'
                min={1}
                max={3600}
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div className='space-y-2'>
          <Label className='text-xs text-muted-foreground uppercase tracking-wide'>
            Description
          </Label>
          <Textarea
            value={automation.description || ''}
            onChange={e => onUpdate({ description: e.target.value })}
            placeholder='Describe what this automation does...'
            className='bg-background/50 resize-none text-sm'
            rows={3}
          />
        </div>

        {/* Statistics Card */}
        <Card className='bg-background/50 border-border'>
          <CardHeader className='py-3 px-4'>
            <CardTitle className='text-xs text-muted-foreground uppercase tracking-wide font-normal flex items-center justify-between'>
              Statistics
              <Badge variant='outline' className='text-xs font-normal'>
                {automation.statistics.trend.period === 'week'
                  ? '7d'
                  : automation.statistics.trend.period === 'day'
                    ? '24h'
                    : '30d'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className='py-0 px-4 pb-4 space-y-3'>
            {/* Executions */}
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Executions</span>
              <div className='flex items-center gap-2'>
                <span className='font-semibold'>
                  {automation.statistics.totalExecutions.toLocaleString()}
                </span>
                <div
                  className={cn(
                    'flex items-center gap-0.5 text-xs',
                    trendIsPositive ? 'text-emerald-500' : 'text-red-500'
                  )}
                >
                  {trendIsPositive ? (
                    <TrendingUp className='h-3 w-3' />
                  ) : (
                    <TrendingDown className='h-3 w-3' />
                  )}
                  <span>
                    {Math.abs(automation.statistics.trend.executionsChange)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Success Rate */}
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>
                Success Rate
              </span>
              <span
                className={cn(
                  'font-semibold',
                  successRate >= 90
                    ? 'text-emerald-500'
                    : successRate >= 70
                      ? 'text-amber-500'
                      : 'text-red-500'
                )}
              >
                {successRate}%
              </span>
            </div>

            {/* Credits Used */}
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>
                Credits Used
              </span>
              <span className='font-semibold'>
                {automation.statistics.totalCreditsUsed.toLocaleString()}
              </span>
            </div>

            {/* Estimated Cost */}
            <div className='flex items-center justify-between pt-2 border-t border-border'>
              <span className='text-sm text-muted-foreground'>
                Est. per execution
              </span>
              <Badge variant='secondary' className='font-mono'>
                {automation.estimatedCreditCost} credits
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card className='bg-background/50 border-border'>
          <CardHeader className='py-3 px-4'>
            <CardTitle className='text-xs text-muted-foreground uppercase tracking-wide font-normal'>
              Rate Limits
            </CardTitle>
          </CardHeader>
          <CardContent className='py-0 px-4 pb-4 space-y-3'>
            {/* Hourly */}
            <div className='space-y-1'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Hourly</span>
                <span className='font-medium'>
                  {automation.rateLimit.currentHourUsage} /{' '}
                  {automation.rateLimit.maxPerHour}
                </span>
              </div>
              <div className='h-1.5 bg-muted rounded-full overflow-hidden'>
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    automation.rateLimit.currentHourUsage /
                      automation.rateLimit.maxPerHour >
                      0.8
                      ? 'bg-amber-500'
                      : 'bg-primary'
                  )}
                  style={{
                    width: `${Math.min((automation.rateLimit.currentHourUsage / automation.rateLimit.maxPerHour) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Daily */}
            <div className='space-y-1'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Daily</span>
                <span className='font-medium'>
                  {automation.rateLimit.currentDayUsage} /{' '}
                  {automation.rateLimit.maxPerDay}
                </span>
              </div>
              <div className='h-1.5 bg-muted rounded-full overflow-hidden'>
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    automation.rateLimit.currentDayUsage /
                      automation.rateLimit.maxPerDay >
                      0.8
                      ? 'bg-amber-500'
                      : 'bg-primary'
                  )}
                  style={{
                    width: `${Math.min((automation.rateLimit.currentDayUsage / automation.rateLimit.maxPerDay) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Validation Errors */}
        {uiState.validationErrors.length > 0 && (
          <Card className='bg-red-500/10 border-red-500/30'>
            <CardContent className='py-3 px-4'>
              <div className='flex items-start gap-2'>
                <AlertCircle className='h-4 w-4 text-red-500 mt-0.5 shrink-0' />
                <div className='space-y-1'>
                  <p className='text-sm font-medium text-red-500'>
                    Validation Errors
                  </p>
                  {uiState.validationErrors.map((error, i) => (
                    <p key={i} className='text-xs text-red-400'>
                      {error.message}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer with Save Button */}
      <div className='p-4 border-t border-border bg-card/80'>
        <Button
          onClick={onSave}
          disabled={uiState.isSaving || !uiState.isDirty}
          className='w-full'
        >
          {uiState.isSaving ? (
            <>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              Saving...
            </>
          ) : (
            <>
              <Save className='h-4 w-4 mr-2' />
              {uiState.isDirty ? 'Save Changes' : 'Saved'}
            </>
          )}
        </Button>

        {uiState.lastSavedAt && (
          <p className='text-xs text-muted-foreground text-center mt-2'>
            Last saved {new Date(uiState.lastSavedAt).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
