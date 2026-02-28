'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Brain,
  Users,
  Database,
  BarChart3,
  Gauge,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SocialAccountsApi, SocialAccount } from '@/lib/api/social-accounts';
import { IntelligenceApi } from '@/lib/api/intelligence';
import { MemoryApi } from '@/lib/api/memory';
import { Bot } from '@/lib/types/intelligence';
import type { MemoryStats } from '@/lib/types/memory';
import { Badge } from '@/components/ui/badge';
import { BotForm } from '@/components/intelligence/bot-form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditBotPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [bot, setBot] = useState<Bot | null>(null);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
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

      // Fetch memory stats (non-blocking)
      try {
        const statsResponse = await MemoryApi.getMemoryStats(botId);
        if (statsResponse?.data) {
          setMemoryStats(statsResponse.data);
        }
      } catch {
        // Memory stats may not be available yet — that's fine
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

      {/* Memory Quick Stats */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-base font-semibold flex items-center gap-2'>
            <Brain className='h-4 w-4' />
            Memory
          </CardTitle>
          <Link href={`/dashboard/intelligence/bots/${botId}/memory`}>
            <Button variant='outline' size='sm'>
              View Full Memory
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {memoryStats ? (
            <div className='flex gap-6'>
              <div className='flex items-center gap-2'>
                <Users className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm'>
                  <span className='font-medium'>
                    {memoryStats.total_users_tracked}
                  </span>{' '}
                  users tracked
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <Database className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm'>
                  <span className='font-medium'>
                    {memoryStats.total_entities_stored}
                  </span>{' '}
                  entities stored
                </span>
              </div>
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>
              No memory data yet. Memory builds up as the bot interacts with
              users.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Performance Quick Stats */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-base font-semibold flex items-center gap-2'>
            <BarChart3 className='h-4 w-4' />
            Performance
          </CardTitle>
          <Link href='/dashboard/intelligence/analytics'>
            <Button variant='outline' size='sm'>
              View Full Analytics
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className='flex gap-6 flex-wrap'>
            <div className='flex items-center gap-2'>
              <Gauge className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm'>
                Confidence:{' '}
                <span className='font-medium'>
                  {(bot.stats.avg_confidence * 100).toFixed(0)}%
                </span>
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm'>
                Replies:{' '}
                <span className='font-medium'>{bot.stats.total_replies}</span>
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm'>
                Escalations:{' '}
                <Badge
                  variant={
                    bot.stats.total_escalations > 0
                      ? 'destructive'
                      : 'secondary'
                  }
                  className='text-xs'
                >
                  {bot.stats.total_escalations}
                </Badge>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <BotForm initialData={bot} socialAccounts={socialAccounts} />
    </div>
  );
}
