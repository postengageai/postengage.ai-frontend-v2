'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
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
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>AI Configuration</h1>
        <p className='text-muted-foreground mt-2'>
          Manage LLM providers and global settings for your bots.
        </p>
      </div>

      <LlmConfigForm initialConfig={config} />
    </div>
  );
}
