'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usePricing } from '@/hooks/use-pricing';
import { IntelligenceApi } from '@/lib/api/intelligence';
import { parseApiError } from '@/lib/http/errors';
import {
  Bot,
  BotBehavior,
  CreateBotDto,
  BrandVoice,
} from '@/lib/types/intelligence';
import { SocialAccount } from '@/lib/api/social-accounts';

// Fallback defaults — used when API hasn't loaded yet.
// Real values come from usePricing().data.app_limits.bot (sourced from backend env).
const FALLBACK_BOT_BEHAVIOR: BotBehavior = {
  auto_reply_enabled: true,
  max_replies_per_hour: 3,
  max_replies_per_day: 10,
  reply_delay_min_seconds: 30,
  reply_delay_max_seconds: 300,
  escalation_threshold: 0.7,
  cta_aggressiveness: 'soft',
  should_reply_to_spam: false,
  stop_after_escalation: true,
  schedule_enabled: false,
  schedule_start_hour: 9,
  schedule_end_hour: 17,
  schedule_timezone: 'UTC',
  schedule_days: [],
};

// Schema is built with fallback caps; components can display dynamic caps from API
export const botFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  social_account_id: z.string().min(1, 'Social account is required'),
  brand_voice_id: z.string().optional(),
  behavior: z
    .object({
      auto_reply_enabled: z.boolean(),
      max_replies_per_hour: z
        .number()
        .min(0)
        .max(500, 'Keep under 500 replies per hour for safety'),
      max_replies_per_day: z
        .number()
        .min(0)
        .max(5000, 'Keep under 5000 replies per day for safety'),
      reply_delay_min_seconds: z
        .number()
        .min(0)
        .max(3600, 'Delay must be less than 1 hour'),
      reply_delay_max_seconds: z
        .number()
        .min(0)
        .max(3600, 'Delay must be less than 1 hour'),
      escalation_threshold: z.number().min(0).max(1),
      cta_aggressiveness: z.enum(['none', 'soft', 'moderate', 'aggressive']),
      should_reply_to_spam: z.boolean(),
      stop_after_escalation: z.boolean(),
      // Schedule (all optional — defaultValues in useForm provides the actual defaults)
      schedule_enabled: z.boolean().optional(),
      schedule_start_hour: z.number().min(0).max(23).optional(),
      schedule_end_hour: z.number().min(0).max(23).optional(),
      schedule_timezone: z.string().optional(),
      schedule_days: z.array(z.number().min(0).max(6)).optional(),
    })
    .refine(
      values =>
        values.reply_delay_max_seconds === 0 ||
        values.reply_delay_min_seconds === 0 ||
        values.reply_delay_max_seconds >= values.reply_delay_min_seconds,
      {
        message: 'Max delay must be greater than or equal to min delay',
        path: ['reply_delay_max_seconds'],
      }
    ),
});

type BotFormValues = z.infer<typeof botFormSchema>;

interface BotFormProps {
  initialData?: Bot;
  socialAccounts: SocialAccount[];
  onCreated?: (info: {
    botId: string;
    socialAccountId: string;
    brandVoiceId?: string;
  }) => void;
}

export function BotForm({
  initialData,
  socialAccounts,
  onCreated,
}: BotFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: pricingData } = usePricing();
  const [isLoading, setIsLoading] = useState(false);
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);

  // Prefer backend-sourced defaults; fall back to constants if API isn't loaded yet
  const botLimits = pricingData?.app_limits?.bot;
  const DEFAULT_BOT_BEHAVIOR: BotBehavior = {
    ...FALLBACK_BOT_BEHAVIOR,
    max_replies_per_hour: botLimits?.default_max_replies_per_hour ?? FALLBACK_BOT_BEHAVIOR.max_replies_per_hour,
    max_replies_per_day: botLimits?.default_max_replies_per_day ?? FALLBACK_BOT_BEHAVIOR.max_replies_per_day,
    reply_delay_min_seconds: botLimits?.default_reply_delay_min_seconds ?? FALLBACK_BOT_BEHAVIOR.reply_delay_min_seconds,
    reply_delay_max_seconds: botLimits?.default_reply_delay_max_seconds ?? FALLBACK_BOT_BEHAVIOR.reply_delay_max_seconds,
  };

  useEffect(() => {
    fetchBrandVoices();
  }, []);

  const fetchBrandVoices = async () => {
    try {
      const response = await IntelligenceApi.getBrandVoices();
      if (response && response.data) {
        setBrandVoices(response.data);
      }
    } catch (_error) {
      // Silent failure
    }
  };

  const defaultValues: Partial<BotFormValues> = initialData
    ? {
        name: initialData.name,
        description: initialData.description,
        social_account_id: initialData.social_account_id,
        brand_voice_id: initialData.brand_voice_id,
        behavior: {
          auto_reply_enabled: initialData.behavior.auto_reply_enabled,
          max_replies_per_hour: initialData.behavior.max_replies_per_hour,
          max_replies_per_day: initialData.behavior.max_replies_per_day,
          reply_delay_min_seconds: initialData.behavior.reply_delay_min_seconds,
          reply_delay_max_seconds: initialData.behavior.reply_delay_max_seconds,
          escalation_threshold: initialData.behavior.escalation_threshold,
          cta_aggressiveness: initialData.behavior.cta_aggressiveness,
          should_reply_to_spam: initialData.behavior.should_reply_to_spam,
          stop_after_escalation: initialData.behavior.stop_after_escalation,
          schedule_enabled: initialData.behavior.schedule_enabled ?? false,
          schedule_start_hour: initialData.behavior.schedule_start_hour ?? 9,
          schedule_end_hour: initialData.behavior.schedule_end_hour ?? 17,
          schedule_timezone: initialData.behavior.schedule_timezone ?? 'UTC',
          schedule_days: initialData.behavior.schedule_days ?? [],
        },
      }
    : {
        name: '',
        description: '',
        social_account_id: '',
        behavior: DEFAULT_BOT_BEHAVIOR,
      };

  const form = useForm<BotFormValues>({
    resolver: zodResolver(botFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: BotFormValues) => {
    setIsLoading(true);
    try {
      if (initialData) {
        await IntelligenceApi.updateBot(initialData._id, data);
        toast({
          title: 'Success',
          description: 'Bot updated successfully',
        });
      } else {
        const createResponse = await IntelligenceApi.createBot(
          data as CreateBotDto
        );
        toast({
          title: 'Success',
          description: 'Bot created successfully',
        });
        // If onCreated callback provided, hand off to voice setup instead of redirecting
        if (onCreated && createResponse?.data) {
          onCreated({
            botId: createResponse.data._id,
            socialAccountId: data.social_account_id,
            brandVoiceId: data.brand_voice_id,
          });
          return;
        }
      }
      router.push('/dashboard/intelligence/bots');
      router.refresh();
    } catch (error) {
      const err = parseApiError(error);
      toast({
        variant: 'destructive',
        title: err.title,
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Schedule helpers ──────────────────────────────────────────────────────
  const scheduleEnabled = useWatch({ control: form.control, name: 'behavior.schedule_enabled' });
  const scheduleDays = useWatch({ control: form.control, name: 'behavior.schedule_days' }) ?? [];

  function formatHour(h: number): string {
    if (h === 0) return '12:00 AM';
    if (h < 12) return `${h}:00 AM`;
    if (h === 12) return '12:00 PM';
    return `${h - 12}:00 PM`;
  }

  const COMMON_TIMEZONES = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern (US)' },
    { value: 'America/Chicago', label: 'Central (US)' },
    { value: 'America/Denver', label: 'Mountain (US)' },
    { value: 'America/Los_Angeles', label: 'Pacific (US)' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris / Berlin' },
    { value: 'Europe/Moscow', label: 'Moscow' },
    { value: 'Asia/Dubai', label: 'Dubai' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Asia/Dhaka', label: 'Dhaka (BST)' },
    { value: 'Asia/Singapore', label: 'Singapore' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Australia/Sydney', label: 'Sydney' },
    { value: 'Pacific/Auckland', label: 'Auckland' },
  ];

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function toggleDay(idx: number) {
    const current = form.getValues('behavior.schedule_days') ?? [];
    const next = current.includes(idx)
      ? current.filter(d => d !== idx)
      : [...current, idx].sort((a, b) => a - b);
    form.setValue('behavior.schedule_days', next, { shouldDirty: true });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div className='grid gap-6 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                Basic details about your AI bot.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bot Name</FormLabel>
                    <FormControl>
                      <Input placeholder='My Support Bot' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Handles general inquiries...'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='social_account_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Account</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!!initialData}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select an account' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {socialAccounts.map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.username} ({account.platform})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The social account this bot will manage.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='brand_voice_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Voice</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a brand voice' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brandVoices.map(voice => (
                          <SelectItem key={voice._id} value={voice._id}>
                            {voice.name} ({voice.tone_primary})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The personality the bot will use.{' '}
                      <Link
                        href='/dashboard/intelligence/brand-voices/new'
                        className='text-primary hover:underline'
                      >
                        Create new
                      </Link>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Behavior Settings</CardTitle>
              <CardDescription>
                Configure how the bot interacts with users.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <FormField
                control={form.control}
                name='behavior.auto_reply_enabled'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                    <div className='space-y-0.5'>
                      <FormLabel>Auto-Reply</FormLabel>
                      <FormDescription>
                        Enable automatic replies to messages.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='behavior.cta_aggressiveness'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CTA Aggressiveness</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select aggressiveness' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='none'>None</SelectItem>
                        <SelectItem value='soft'>Soft</SelectItem>
                        <SelectItem value='moderate'>Moderate</SelectItem>
                        <SelectItem value='aggressive'>Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How aggressively the bot pushes for a Call to Action.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='behavior.max_replies_per_hour'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Replies / Hour</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          {...field}
                          onChange={e => {
                            const value = e.target.value;
                            field.onChange(
                              value === '' ? 0 : parseInt(value, 10)
                            );
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Helps avoid rate limits. Typical range: 0-60 per hour.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='behavior.max_replies_per_day'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Replies / Day</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          {...field}
                          onChange={e => {
                            const value = e.target.value;
                            field.onChange(
                              value === '' ? 0 : parseInt(value, 10)
                            );
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Total automatic replies per day across this bot.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='behavior.reply_delay_min_seconds'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Reply Delay (seconds)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          {...field}
                          onChange={e => {
                            const value = e.target.value;
                            field.onChange(
                              value === '' ? 0 : parseInt(value, 10)
                            );
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum delay before sending an auto-reply.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='behavior.reply_delay_max_seconds'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Reply Delay (seconds)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          {...field}
                          onChange={e => {
                            const value = e.target.value;
                            field.onChange(
                              value === '' ? 0 : parseInt(value, 10)
                            );
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Upper bound for random reply delay window.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='behavior.escalation_threshold'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escalation Threshold ({field.value})</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={1}
                        step={0.1}
                        defaultValue={[field.value]}
                        onValueChange={vals => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Confidence score below which the bot escalates to a human.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='behavior.should_reply_to_spam'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                    <div className='space-y-0.5'>
                      <FormLabel>Reply To Suspected Spam</FormLabel>
                      <FormDescription>
                        May reply even on low-quality messages.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='behavior.stop_after_escalation'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                    <div className='space-y-0.5'>
                      <FormLabel>Stop After Escalation</FormLabel>
                      <FormDescription>
                        Stops replying after escalation to a human.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* ─── Active Schedule ─────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              Active Schedule
            </CardTitle>
            <CardDescription>
              Restrict when this bot is allowed to reply. Outside the window it will skip messages silently.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-5'>
            {/* Master toggle */}
            <FormField
              control={form.control}
              name='behavior.schedule_enabled'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                  <div className='space-y-0.5'>
                    <FormLabel>Enable Schedule</FormLabel>
                    <FormDescription>
                      Only reply during the configured hours and days.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {scheduleEnabled && (
              <div className='space-y-4 pl-1'>
                {/* Hours row */}
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='behavior.schedule_start_hour'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Hour</FormLabel>
                        <Select
                          onValueChange={v => field.onChange(parseInt(v, 10))}
                          value={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select hour' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={String(i)}>
                                {formatHour(i)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='behavior.schedule_end_hour'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Hour</FormLabel>
                        <Select
                          onValueChange={v => field.onChange(parseInt(v, 10))}
                          value={String(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select hour' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={String(i)}>
                                {formatHour(i)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className='text-[11px]'>
                          If end &lt; start, window wraps overnight.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Timezone */}
                <FormField
                  control={form.control}
                  name='behavior.schedule_timezone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select timezone' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COMMON_TIMEZONES.map(tz => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Days of week */}
                <div className='space-y-2'>
                  <p className='text-sm font-medium leading-none'>
                    Active Days
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Leave all unselected to run every day.
                  </p>
                  <div className='flex flex-wrap gap-2 pt-1'>
                    {DAY_LABELS.map((day, idx) => {
                      const active = scheduleDays.includes(idx);
                      return (
                        <button
                          key={day}
                          type='button'
                          onClick={() => toggleDay(idx)}
                          className={cn(
                            'h-8 min-w-[44px] rounded-full border px-3 text-xs font-medium transition-colors',
                            active
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background text-muted-foreground hover:bg-muted'
                          )}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className='flex justify-end'>
          <Button type='submit' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {initialData ? 'Update Bot' : 'Create Bot'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
