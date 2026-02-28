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
  Shield,
  Dna,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SocialAccountsApi, SocialAccount } from '@/lib/api/social-accounts';
import { IntelligenceApi } from '@/lib/api/intelligence';
import { VoiceDnaApi } from '@/lib/api/voice-dna';
import { MemoryApi } from '@/lib/api/memory';
import { Bot } from '@/lib/types/intelligence';
import type { VoiceDna } from '@/lib/types/voice-dna';
import type { MemoryStats } from '@/lib/types/memory';
import type { BotHealthScore } from '@/lib/types/quality';
import { Badge } from '@/components/ui/badge';
import { BotForm } from '@/components/intelligence/bot-form';
import { BotHealthScoreDisplay } from '@/components/intelligence/quality/bot-health-score';
import { FlaggedReviewQueue } from '@/components/intelligence/quality/flagged-review-queue';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditBotPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [bot, setBot] = useState<Bot | null>(null);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [healthScore, setHealthScore] = useState<BotHealthScore | null>(null);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [voiceDna, setVoiceDna] = useState<VoiceDna | null>(null);
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false);
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

      // Fetch memory stats + health (non-blocking)
      try {
        const [statsResponse, healthResponse, flaggedResponse] =
          await Promise.all([
            MemoryApi.getMemoryStats(botId).catch(() => null),
            IntelligenceApi.getBotHealth(botId).catch(() => null),
            IntelligenceApi.getFlaggedReplies(botId, {
              limit: 1,
              reviewed: false,
            }).catch(() => null),
          ]);
        if (statsResponse?.data) setMemoryStats(statsResponse.data);
        if (healthResponse?.data) setHealthScore(healthResponse.data);
        if (flaggedResponse?.pagination?.total)
          setFlaggedCount(flaggedResponse.pagination.total);

        // Fetch Voice DNA if bot has a brand_voice_id
        if (botResponse?.data?.brand_voice_id) {
          try {
            const vdnaResponse = await VoiceDnaApi.getVoiceDnaByBrandVoice(
              botResponse.data.brand_voice_id
            );
            if (vdnaResponse?.data) setVoiceDna(vdnaResponse.data);
          } catch {
            // Voice DNA might not exist yet
          }
        }
      } catch {
        // Optional data — failures are fine
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

      {/* Bot Health */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-base font-semibold flex items-center gap-2'>
            <Shield className='h-4 w-4' />
            Bot Health
          </CardTitle>
          <div className='flex items-center gap-2'>
            {flaggedCount > 0 && (
              <Badge variant='destructive' className='text-xs'>
                {flaggedCount} needs review
              </Badge>
            )}
            <Button
              variant='outline'
              size='sm'
              onClick={() => setReviewSheetOpen(true)}
            >
              Review Flagged Replies
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {healthScore ? (
            <BotHealthScoreDisplay health={healthScore} />
          ) : (
            <p className='text-sm text-muted-foreground'>
              Health data will appear once the bot starts generating replies.
            </p>
          )}
        </CardContent>
      </Card>

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

      {/* Voice DNA */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-base font-semibold flex items-center gap-2'>
            <Dna className='h-4 w-4' />
            Voice DNA
          </CardTitle>
          {voiceDna ? (
            <Link href={`/dashboard/intelligence/voice-dna/${voiceDna._id}`}>
              <Button variant='outline' size='sm'>
                View Voice DNA
              </Button>
            </Link>
          ) : (
            <Link href={`/dashboard/intelligence/voice-dna`}>
              <Button variant='outline' size='sm'>
                Set Up Voice
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {voiceDna ? (
            <div className='flex gap-6 flex-wrap'>
              <div className='flex items-center gap-2'>
                <Badge
                  variant={
                    voiceDna.status === 'ready' ? 'default' : 'secondary'
                  }
                >
                  {voiceDna.status === 'ready'
                    ? 'Active'
                    : voiceDna.status.charAt(0).toUpperCase() +
                      voiceDna.status.slice(1)}
                </Badge>
              </div>
              <span className='text-sm'>
                Source:{' '}
                <span className='font-medium capitalize'>
                  {voiceDna.source.replace(/_/g, ' ')}
                </span>
              </span>
              <span className='text-sm'>
                Examples:{' '}
                <span className='font-medium'>
                  {voiceDna.few_shot_examples.length}
                </span>
              </span>
              <span className='text-sm'>
                Feedback:{' '}
                <span className='font-medium'>
                  {voiceDna.feedback_signals_processed}
                </span>
              </span>
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>
              No Voice DNA configured. Set up your voice to make the bot sound
              like you.
            </p>
          )}
        </CardContent>
      </Card>

      <BotForm initialData={bot} socialAccounts={socialAccounts} />

      {/* Flagged Replies Review Sheet */}
      <Sheet open={reviewSheetOpen} onOpenChange={setReviewSheetOpen}>
        <SheetContent className='sm:max-w-lg w-full p-0'>
          <SheetHeader className='px-6 pt-6 pb-4 border-b'>
            <SheetTitle>Flagged Replies</SheetTitle>
          </SheetHeader>
          <ScrollArea className='h-[calc(100vh-5rem)]'>
            <div className='px-6 py-4'>
              <FlaggedReviewQueue botId={botId} />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
