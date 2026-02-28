'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { IntelligenceApi } from '@/lib/api/intelligence';
import {
  Bot,
  BotBehavior,
  CreateBotDto,
  BrandVoice,
} from '@/lib/types/intelligence';
import { SocialAccount } from '@/lib/api/social-accounts';

const DEFAULT_BOT_BEHAVIOR: BotBehavior = {
  auto_reply_enabled: true,
  max_replies_per_hour: 3,
  max_replies_per_day: 10,
  reply_delay_min_seconds: 30,
  reply_delay_max_seconds: 300,
  escalation_threshold: 0.7,
  cta_aggressiveness: 'soft',
  should_reply_to_spam: false,
  stop_after_escalation: true,
};

export const botFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  social_account_id: z.string().min(1, 'Social account is required'),
  brand_voice_id: z.string().optional(),
  behavior: z
    .object({
      auto_reply_enabled: z.boolean().default(true),
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
      should_reply_to_spam: z.boolean().default(false),
      stop_after_escalation: z.boolean().default(true),
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
  const [isLoading, setIsLoading] = useState(false);
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);

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
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: initialData
          ? 'Failed to update bot'
          : 'Failed to create bot',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
