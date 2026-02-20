'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SocialAccountsApi, SocialAccount } from '@/lib/api/social-accounts';
import { IntelligenceApi } from '@/lib/api/intelligence';
import { Bot } from '@/lib/types/intelligence';
import { BotForm } from '@/components/intelligence/bot-form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditBotPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [bot, setBot] = useState<Bot | null>(null);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const botId = params.id as string;

  useEffect(() => {
    fetchData();
  }, [botId]);

  const fetchData = async () => {
    try {
      const [botResponse, accountsResponse] = await Promise.all([
        IntelligenceApi.getBot(botId),
        SocialAccountsApi.list(),
      ]);

      if (botResponse && botResponse.data) {
        setBot(botResponse.data);
      }
      if (accountsResponse && accountsResponse.data) {
        setSocialAccounts(accountsResponse.data);
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load bot details',
      });
      router.push('/dashboard/intelligence/bots');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='p-6 space-y-6'>
        <Skeleton className='h-8 w-32' />
        <Skeleton className='h-[600px] w-full' />
      </div>
    );
  }

  if (!bot) return null;

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={() => router.back()}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Edit Bot</h1>
          <p className='text-muted-foreground'>Configure your AI assistant.</p>
        </div>
      </div>

      <BotForm initialData={bot} socialAccounts={socialAccounts} />
    </div>
  );
}
