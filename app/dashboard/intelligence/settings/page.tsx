'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LlmConfigForm } from '@/components/intelligence/llm-config-form';
import { IntelligenceApi } from '@/lib/api/intelligence';
import { UserLlmConfig } from '@/lib/types/intelligence';
import { useToast } from '@/hooks/use-toast';

export default function IntelligenceSettingsPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<UserLlmConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await IntelligenceApi.getUserConfig();
      if (response && response.data) {
        setConfig(response.data);
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load configuration',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='p-6 space-y-6'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-4 w-96' />
        </div>
        <Skeleton className='h-[400px] w-full' />
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className='p-6 space-y-8'>
      <div className='space-y-3'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Intelligence Settings
        </h1>
        <p className='text-sm text-muted-foreground max-w-3xl'>
          Control how PostEngage.ai thinks and responds. Configure your AI bots,
          brand voices, knowledge sources, and LLM provider so that every
          automated reply matches your brand and stays within safety limits.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Link href='/dashboard/intelligence/bots'>
          <Card className='h-full cursor-pointer transition-colors hover:border-primary/50'>
            <CardHeader>
              <CardTitle className='text-base'>Bots</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Create and manage AI bots per social account, including reply
                behavior and escalation rules.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href='/dashboard/intelligence/brand-voices'>
          <Card className='h-full cursor-pointer transition-colors hover:border-primary/50'>
            <CardHeader>
              <CardTitle className='text-base'>Brand voices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Define tone, language, and style so AI replies sound like your
                brand in every conversation.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href='/dashboard/intelligence/bots'>
          <Card className='h-full cursor-pointer transition-colors hover:border-primary/50'>
            <CardHeader>
              <CardTitle className='text-base'>Knowledge sources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Attach FAQs, PDFs, and other content to bots so AI can answer
                with accurate, up to date information.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href='/dashboard/intelligence/settings'>
          <Card className='h-full cursor-pointer transition-colors hover:border-primary/50'>
            <CardHeader>
              <CardTitle className='text-base'>LLM provider config</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Choose between platform-managed or your own LLM provider and
                control token limits and language.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href='/dashboard/intelligence/analytics'>
          <Card className='h-full cursor-pointer transition-colors hover:border-primary/50'>
            <CardHeader>
              <CardTitle className='text-base'>
                Intelligence analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-muted-foreground'>
                Monitor AI calls, token usage, fallbacks, and escalations across
                your connected accounts.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className='space-y-4'>
        <div>
          <h2 className='text-xl font-semibold tracking-tight'>
            AI configuration
          </h2>
          <p className='text-sm text-muted-foreground'>
            These settings apply across all of your bots unless overridden by
            per-bot behavior.
          </p>
        </div>
        <LlmConfigForm initialConfig={config} />
      </div>
    </div>
  );
}
