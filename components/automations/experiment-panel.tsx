'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FlaskConical,
  Loader2,
  BarChart3,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AutomationsApi,
  ExperimentConfig,
  ExperimentResults,
} from '@/lib/api/automations';
import { IntelligenceApi } from '@/lib/api/intelligence';
import type { Bot } from '@/lib/types/intelligence';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/http/errors';

interface ExperimentPanelProps {
  automationId: string;
  currentExperimentConfig?: ExperimentConfig | null;
  onConfigUpdated?: (config: ExperimentConfig) => void;
}

interface VariantBarProps {
  label: string;
  value: number;
  total: number;
  color: 'green' | 'blue';
}

function VariantBar({ label, value, total, color }: VariantBarProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className='space-y-1'>
      <div className='flex justify-between text-xs'>
        <span className='text-muted-foreground'>{label}</span>
        <span className='font-medium'>{value.toLocaleString()}</span>
      </div>
      <div className='h-1.5 rounded-full bg-muted overflow-hidden'>
        <div
          className={cn(
            'h-full rounded-full transition-all',
            color === 'green' ? 'bg-green-500' : 'bg-blue-500'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ExperimentPanel({
  automationId,
  currentExperimentConfig,
  onConfigUpdated,
}: ExperimentPanelProps) {
  const { toast } = useToast();
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoadingBots, setIsLoadingBots] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<ExperimentResults | null>(null);

  const [enabled, setEnabled] = useState(
    currentExperimentConfig?.enabled ?? false
  );
  const [botAId, setBotAId] = useState(currentExperimentConfig?.bot_a_id ?? '');
  const [botBId, setBotBId] = useState(currentExperimentConfig?.bot_b_id ?? '');

  const loadBots = useCallback(async () => {
    setIsLoadingBots(true);
    try {
      const res = await IntelligenceApi.getBots();
      setBots(res.data ?? []);
    } catch {
      // silent
    } finally {
      setIsLoadingBots(false);
    }
  }, []);

  const loadResults = useCallback(async () => {
    setIsLoadingResults(true);
    try {
      const res = await AutomationsApi.getExperimentResults(automationId);
      setResults(res.data ?? null);
    } catch {
      // silent
    } finally {
      setIsLoadingResults(false);
    }
  }, [automationId]);

  useEffect(() => {
    loadBots();
    loadResults();
  }, [loadBots, loadResults]);

  const handleSave = async () => {
    if (enabled && (!botAId || !botBId)) {
      toast({
        variant: 'destructive',
        title: 'Select both bots',
        description: 'You must choose a Bot A and Bot B to run the experiment.',
      });
      return;
    }
    if (enabled && botAId === botBId) {
      toast({
        variant: 'destructive',
        title: 'Choose different bots',
        description: 'Bot A and Bot B must be different.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const config: ExperimentConfig = {
        enabled,
        bot_a_id: enabled ? botAId : undefined,
        bot_b_id: enabled ? botBId : undefined,
      };
      await AutomationsApi.setExperiment(automationId, config);
      onConfigUpdated?.(config);
      toast({
        title: enabled ? 'Experiment started' : 'Experiment stopped',
        description: enabled
          ? 'Incoming messages will now be split between Bot A and Bot B.'
          : 'A/B experiment has been disabled.',
      });
      // Refresh results
      await loadResults();
    } catch (err) {
      const parsed = parseApiError(err);
      toast({
        variant: 'destructive',
        title: parsed.title,
        description: parsed.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasResults =
    results && (results.variant_a.total > 0 || results.variant_b.total > 0);
  const minForConclusion = 50;
  const hasEnoughData =
    results &&
    results.variant_a.total >= minForConclusion &&
    results.variant_b.total >= minForConclusion;

  const getBotName = (id: string | null | undefined) => {
    if (!id) return 'Unknown bot';
    return bots.find(b => b._id === id)?.name ?? id;
  };

  return (
    <div className='rounded-xl border border-border bg-card p-5 space-y-5'>
      {/* Header */}
      <div className='flex items-center gap-2.5'>
        <div className='h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0'>
          <FlaskConical className='h-4 w-4 text-violet-600 dark:text-violet-400' />
        </div>
        <div>
          <p className='text-sm font-semibold'>Reply Quality A/B Test</p>
          <p className='text-xs text-muted-foreground'>
            Split traffic between two bots to find the best performer
          </p>
        </div>
        {enabled && (
          <Badge
            variant='secondary'
            className='ml-auto text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
          >
            Running
          </Badge>
        )}
      </div>

      {/* Config */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Label htmlFor='exp-toggle' className='text-sm'>
            Enable experiment
          </Label>
          <Switch
            id='exp-toggle'
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {enabled && (
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground'>
                Bot A (50%)
              </Label>
              {isLoadingBots ? (
                <div className='h-9 rounded-md border border-border flex items-center px-3 gap-2 text-xs text-muted-foreground'>
                  <Loader2 className='h-3 w-3 animate-spin' />
                  Loading…
                </div>
              ) : (
                <Select value={botAId} onValueChange={setBotAId}>
                  <SelectTrigger className='h-9 text-xs'>
                    <SelectValue placeholder='Select bot' />
                  </SelectTrigger>
                  <SelectContent>
                    {bots.map(b => (
                      <SelectItem
                        key={b._id}
                        value={b._id}
                        disabled={b._id === botBId}
                      >
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label className='text-xs text-muted-foreground'>
                Bot B (50%)
              </Label>
              {isLoadingBots ? (
                <div className='h-9 rounded-md border border-border flex items-center px-3 gap-2 text-xs text-muted-foreground'>
                  <Loader2 className='h-3 w-3 animate-spin' />
                  Loading…
                </div>
              ) : (
                <Select value={botBId} onValueChange={setBotBId}>
                  <SelectTrigger className='h-9 text-xs'>
                    <SelectValue placeholder='Select bot' />
                  </SelectTrigger>
                  <SelectContent>
                    {bots.map(b => (
                      <SelectItem
                        key={b._id}
                        value={b._id}
                        disabled={b._id === botAId}
                      >
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        )}

        <Button
          size='sm'
          onClick={handleSave}
          disabled={isSaving}
          className='w-full'
        >
          {isSaving && <Loader2 className='h-3.5 w-3.5 mr-1.5 animate-spin' />}
          {enabled ? 'Save & Start Experiment' : 'Save'}
        </Button>
      </div>

      {/* Results */}
      {isLoadingResults ? (
        <div className='flex items-center gap-2 text-xs text-muted-foreground py-2'>
          <Loader2 className='h-3.5 w-3.5 animate-spin' />
          Loading results…
        </div>
      ) : hasResults ? (
        <div className='space-y-3 pt-1 border-t'>
          <div className='flex items-center gap-1.5'>
            <BarChart3 className='h-3.5 w-3.5 text-muted-foreground' />
            <span className='text-xs font-medium'>Experiment Results</span>
            {hasEnoughData ? (
              <CheckCircle2 className='h-3.5 w-3.5 text-green-500 ml-auto' />
            ) : (
              <AlertCircle className='h-3.5 w-3.5 text-amber-500 ml-auto' />
            )}
          </div>

          {!hasEnoughData && (
            <p className='text-xs text-muted-foreground'>
              Need {minForConclusion} executions per variant for reliable
              results. Currently: A={results!.variant_a.total}, B=
              {results!.variant_b.total}
            </p>
          )}

          <div className='grid grid-cols-2 gap-4'>
            {/* Variant A */}
            <div className='space-y-2.5 p-3 rounded-lg bg-muted/50 border border-border'>
              <div className='flex items-center justify-between'>
                <span className='text-xs font-semibold'>
                  Bot A
                  {results?.experiment_config?.bot_a_id && (
                    <span className='ml-1 font-normal text-muted-foreground'>
                      · {getBotName(results.experiment_config.bot_a_id)}
                    </span>
                  )}
                </span>
                <Badge
                  variant='secondary'
                  className={cn(
                    'text-xs',
                    results!.variant_a.success_rate >=
                      results!.variant_b.success_rate
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                      : ''
                  )}
                >
                  {results!.variant_a.success_rate}%
                </Badge>
              </div>
              <VariantBar
                label='Successful'
                value={results!.variant_a.successful}
                total={results!.variant_a.total}
                color='green'
              />
              <VariantBar
                label='Total'
                value={results!.variant_a.total}
                total={Math.max(
                  results!.variant_a.total,
                  results!.variant_b.total
                )}
                color='blue'
              />
              <p className='text-xs text-muted-foreground'>
                {results!.variant_a.total_credits} credits used
              </p>
            </div>

            {/* Variant B */}
            <div className='space-y-2.5 p-3 rounded-lg bg-muted/50 border border-border'>
              <div className='flex items-center justify-between'>
                <span className='text-xs font-semibold'>
                  Bot B
                  {results?.experiment_config?.bot_b_id && (
                    <span className='ml-1 font-normal text-muted-foreground'>
                      · {getBotName(results.experiment_config.bot_b_id)}
                    </span>
                  )}
                </span>
                <Badge
                  variant='secondary'
                  className={cn(
                    'text-xs',
                    results!.variant_b.success_rate >
                      results!.variant_a.success_rate
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                      : ''
                  )}
                >
                  {results!.variant_b.success_rate}%
                </Badge>
              </div>
              <VariantBar
                label='Successful'
                value={results!.variant_b.successful}
                total={results!.variant_b.total}
                color='green'
              />
              <VariantBar
                label='Total'
                value={results!.variant_b.total}
                total={Math.max(
                  results!.variant_a.total,
                  results!.variant_b.total
                )}
                color='blue'
              />
              <p className='text-xs text-muted-foreground'>
                {results!.variant_b.total_credits} credits used
              </p>
            </div>
          </div>

          {hasEnoughData && (
            <div className='rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-3 py-2 text-xs text-green-800 dark:text-green-300'>
              {results!.variant_a.success_rate >=
              results!.variant_b.success_rate ? (
                <>
                  <strong>Bot A</strong> is performing better with a{' '}
                  {results!.variant_a.success_rate}% success rate vs{' '}
                  {results!.variant_b.success_rate}% for Bot B.
                </>
              ) : (
                <>
                  <strong>Bot B</strong> is performing better with a{' '}
                  {results!.variant_b.success_rate}% success rate vs{' '}
                  {results!.variant_a.success_rate}% for Bot A.
                </>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
