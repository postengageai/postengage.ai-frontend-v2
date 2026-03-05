'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { IntelligenceApi } from '@/lib/api/intelligence';
import {
  UserLlmConfig,
  LlmConfigMode,
  ByomProvider,
  ResponseLengthPreference,
} from '@/lib/types/intelligence';

export const createLlmConfigSchema = (hasMaskedKey: boolean) =>
  z
    .object({
      mode: z.nativeEnum(LlmConfigMode),
      byom_config: z
        .object({
          provider: z.nativeEnum(ByomProvider),
          api_key: z.string().optional(),
          preferred_model: z.string().optional(),
          fallback_model: z.string().optional(),
          max_tokens_per_request: z.number().min(1).optional(),
          monthly_token_budget: z.number().min(1).optional(),
        })
        .optional(),
      settings: z
        .object({
          temperature: z.number().min(0).max(2).optional(),
          max_response_length: z
            .nativeEnum(ResponseLengthPreference)
            .optional(),
          language: z.string().optional(),
        })
        .optional(),
    })
    .refine(
      data => {
        if (data.mode === LlmConfigMode.BYOM) {
          // If we have a masked key, empty input is allowed (means keep existing)
          if (hasMaskedKey && !data.byom_config?.api_key) {
            return true;
          }
          // Otherwise, key is required
          return !!data.byom_config?.api_key;
        }
        return true;
      },
      {
        message: 'API Key is required for BYOM mode',
        path: ['byom_config', 'api_key'],
      }
    );

type LlmConfigFormValues = z.infer<ReturnType<typeof createLlmConfigSchema>>;

interface LlmConfigFormProps {
  initialConfig: UserLlmConfig;
}

export function LlmConfigForm({ initialConfig }: LlmConfigFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [llmDefaults, setLlmDefaults] = useState<{
    provider: string;
    model: string;
    max_tokens: number;
  } | null>(null);
  const maskedApiKey = initialConfig.byom_config?.api_key_last_four;

  const defaultValues: Partial<LlmConfigFormValues> = {
    mode: initialConfig.mode,
    byom_config: {
      provider: initialConfig.byom_config?.provider || ByomProvider.OPENAI,
      api_key: '',
      preferred_model: initialConfig.byom_config?.preferred_model || 'gpt-4o',
      fallback_model:
        initialConfig.byom_config?.fallback_model || 'gpt-3.5-turbo',
      max_tokens_per_request:
        initialConfig.byom_config?.max_tokens_per_request || 500,
      monthly_token_budget:
        initialConfig.byom_config?.monthly_token_budget || 1000000,
    },
    settings: {
      temperature: initialConfig.settings.temperature,
      max_response_length:
        initialConfig.settings.max_response_length ||
        ResponseLengthPreference.MEDIUM,
      language: initialConfig.settings.language || 'en',
    },
  };

  const formSchema = useMemo(
    () => createLlmConfigSchema(!!maskedApiKey),
    [maskedApiKey]
  );

  const form = useForm<LlmConfigFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const watchMode = form.watch('mode');

  useEffect(() => {
    let isMounted = true;
    IntelligenceApi.getLlmDefaults()
      .then(response => {
        if (!isMounted) return;
        setLlmDefaults(response.data);
      })
      .catch(() => {
        // Silently ignore; form still works without defaults
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const onSubmit = async (data: LlmConfigFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        byom_config:
          data.mode === LlmConfigMode.BYOM && data.byom_config
            ? {
                ...data.byom_config,
                // If api_key is empty string, send undefined to backend (keeps existing key)
                api_key: data.byom_config.api_key || undefined,
              }
            : undefined,
      };
      await IntelligenceApi.updateUserConfig(payload);
      toast({
        title: 'Success',
        description: 'Configuration updated successfully',
      });
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update configuration',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <Card>
          <CardHeader>
            <CardTitle>LLM Provider</CardTitle>
            <CardDescription>
              Choose how your AI responses are generated.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <FormField
              control={form.control}
              name='mode'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className='flex flex-col space-y-1'
                    >
                      <FormItem className='flex items-center space-x-3 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value={LlmConfigMode.PLATFORM} />
                        </FormControl>
                        <FormLabel className='font-normal'>
                          <strong>Managed (Recommended)</strong> - Use
                          PostEngageAI's optimized models. No setup required.
                        </FormLabel>
                      </FormItem>
                      <FormItem className='flex items-center space-x-3 space-y-0'>
                        <FormControl>
                          <RadioGroupItem value={LlmConfigMode.BYOM} />
                        </FormControl>
                        <FormLabel className='font-normal'>
                          <strong>Bring Your Own Model (BYOM)</strong> - Use
                          your own API keys (OpenAI, Anthropic, etc.).
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchMode === LlmConfigMode.BYOM && (
              <div className='space-y-4 pt-4 border-t'>
                <Alert>
                  <AlertTriangle className='h-4 w-4' />
                  <AlertTitle>BYOM Configuration</AlertTitle>
                  <AlertDescription>
                    Usage is billed by your provider based on tokens. Configure
                    models and token budgets carefully to control costs and
                    avoid rate limits.
                    {llmDefaults ? (
                      <span className='block mt-2'>
                        Platform defaults:{' '}
                        <strong>{llmDefaults.provider}</strong> —{' '}
                        <strong>{llmDefaults.model}</strong> (max{' '}
                        {llmDefaults.max_tokens} tokens per request).
                      </span>
                    ) : null}
                  </AlertDescription>
                </Alert>

                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='byom_config.provider'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select provider' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='openai'>OpenAI</SelectItem>
                            <SelectItem value='anthropic'>Anthropic</SelectItem>
                            <SelectItem value='google'>
                              Google Vertex AI
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='byom_config.api_key'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input
                            type='password'
                            placeholder={
                              maskedApiKey
                                ? `Key ends with ${maskedApiKey}`
                                : 'sk-...'
                            }
                            {...field}
                          />
                        </FormControl>
                        {maskedApiKey ? (
                          <FormDescription>
                            Saved key ends with {maskedApiKey}. Enter a new key
                            to update.
                          </FormDescription>
                        ) : null}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='byom_config.preferred_model'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model Name</FormLabel>
                        <FormControl>
                          <Input placeholder='gpt-4o' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='byom_config.fallback_model'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fallback Model</FormLabel>
                        <FormControl>
                          <Input placeholder='gpt-3.5-turbo' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='byom_config.max_tokens_per_request'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Tokens per Request</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            onChange={e => {
                              const value = e.target.value;
                              field.onChange(
                                value === '' ? undefined : parseInt(value, 10)
                              );
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Upper limit for tokens used in a single request.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='byom_config.monthly_token_budget'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Token Budget</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            onChange={e => {
                              const value = e.target.value;
                              field.onChange(
                                value === '' ? undefined : parseInt(value, 10)
                              );
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Approximate monthly token allowance for this account.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Global Settings</CardTitle>
            <CardDescription>
              Default settings for your AI responses.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-3'>
              <FormField
                control={form.control}
                name='settings.temperature'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Creativity (Temperature)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.1'
                        min='0'
                        max='2'
                        {...field}
                        onChange={e =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      0 = Focused, 1+ = Creative
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='settings.max_response_length'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response Length</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select length' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ResponseLengthPreference.SHORT}>
                          Short
                        </SelectItem>
                        <SelectItem value={ResponseLengthPreference.MEDIUM}>
                          Medium
                        </SelectItem>
                        <SelectItem value={ResponseLengthPreference.LONG}>
                          Long
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className='flex justify-end'>
          <Button type='submit' disabled={isLoading}>
            {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Save Configuration
          </Button>
        </div>
      </form>
    </Form>
  );
}
