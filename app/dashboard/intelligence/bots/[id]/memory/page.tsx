'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { MemoryStatsOverview } from '@/components/intelligence/memory/memory-stats';
import { EntityBrowser } from '@/components/intelligence/memory/entity-browser';
import { UserMemorySheet } from '@/components/intelligence/memory/user-memory-sheet';
import { MemoryApi } from '@/lib/api/memory';
import { IntelligenceApi } from '@/lib/api/intelligence';
import type { MemoryStats } from '@/lib/types/memory';
import type { UserRelationshipMemory } from '@/lib/types/memory';
import { useToast } from '@/hooks/use-toast';

export default function BotMemoryPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const botId = params.id as string;

  const [botName, setBotName] = useState('');
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] =
    useState<UserRelationshipMemory | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [botId]);

  const fetchData = async () => {
    try {
      const [botResponse, statsResponse] = await Promise.all([
        IntelligenceApi.getBot(botId),
        MemoryApi.getMemoryStats(botId),
      ]);
      if (botResponse?.data) {
        setBotName(botResponse.data.name);
      }
      if (statsResponse?.data) {
        setStats(statsResponse.data);
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load memory data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (user: UserRelationshipMemory) => {
    setSelectedUser(user);
    setSheetOpen(true);
  };

  if (isLoading) {
    return (
      <div className='p-6 space-y-6'>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-10 w-10' />
          <div>
            <Skeleton className='h-7 w-48' />
            <Skeleton className='h-4 w-32 mt-1' />
          </div>
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className='h-28 w-full' />
          ))}
        </div>
        <Skeleton className='h-64 w-full' />
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' onClick={() => router.back()}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-2xl font-bold tracking-tight'>
                {botName || 'Bot'} Memory
              </h1>
              <Brain className='h-5 w-5 text-muted-foreground' />
            </div>
            <p className='text-muted-foreground'>
              View what this bot remembers about its conversations and users.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && <MemoryStatsOverview stats={stats} />}

      {/* Tabs */}
      <Tabs defaultValue='users' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='users'>Users</TabsTrigger>
          <TabsTrigger value='insights'>Insights</TabsTrigger>
        </TabsList>

        <TabsContent value='users'>
          <EntityBrowser botId={botId} onSelectUser={handleSelectUser} />
        </TabsContent>

        <TabsContent value='insights'>
          {stats ? (
            <div className='space-y-4'>
              {/* Entity Type Distribution */}
              <div className='rounded-lg border p-6 bg-card'>
                <h3 className='text-sm font-semibold mb-4'>
                  Entity Types Distribution
                </h3>
                <div className='space-y-3'>
                  {Object.entries(stats.entities_by_type)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className='space-y-1'>
                        <div className='flex justify-between text-xs'>
                          <span className='text-muted-foreground capitalize'>
                            {type.replace(/_/g, ' ')}
                          </span>
                          <span className='font-medium'>{count}</span>
                        </div>
                        <div className='h-2 rounded-full bg-muted overflow-hidden'>
                          <div
                            className='h-full bg-primary rounded-full transition-all'
                            style={{
                              width: `${
                                stats.total_entities_stored > 0
                                  ? (count / stats.total_entities_stored) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <Brain className='h-10 w-10 text-muted-foreground mb-3 opacity-40' />
              <p className='text-sm text-muted-foreground'>
                No insights available yet.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* User Memory Sheet */}
      <UserMemorySheet
        user={selectedUser}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
