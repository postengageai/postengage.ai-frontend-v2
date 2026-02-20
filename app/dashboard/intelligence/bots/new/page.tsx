'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SocialAccountsApi, SocialAccount } from '@/lib/api/social-accounts';
import { BotForm } from '@/components/intelligence/bot-form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewBotPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSocialAccounts();
  }, []);

  const fetchSocialAccounts = async () => {
    try {
      const response = await SocialAccountsApi.list();
      if (response && response.data) {
        setSocialAccounts(response.data);
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load social accounts',
      });
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

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={() => router.back()}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Create New Bot</h1>
          <p className='text-muted-foreground'>
            Configure a new AI assistant for your social account.
          </p>
        </div>
      </div>

      <BotForm socialAccounts={socialAccounts} />
    </div>
  );
}
