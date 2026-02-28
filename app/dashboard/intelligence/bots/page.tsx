'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Bot,
  MoreHorizontal,
  Settings,
  Trash,
  Play,
  Pause,
  Brain,
  Users,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IntelligenceApi } from '@/lib/api/intelligence';
import { Bot as BotType, BotStatus } from '@/lib/types/intelligence';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function BotsPage() {
  const [bots, setBots] = useState<BotType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBots();
  }, []);

  const fetchBots = async () => {
    try {
      const response = await IntelligenceApi.getBots();
      if (response && response.data) {
        setBots(response.data);
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load bots',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBotStatus = async (bot: BotType) => {
    try {
      const newStatus = bot.is_active ? BotStatus.PAUSED : BotStatus.ACTIVE;
      await IntelligenceApi.updateBot(bot._id, {
        is_active: !bot.is_active,
        status: newStatus,
      });

      setBots(
        bots.map(b =>
          b._id === bot._id
            ? { ...b, is_active: !bot.is_active, status: newStatus }
            : b
        )
      );

      toast({
        title: 'Success',
        description: `Bot ${!bot.is_active ? 'activated' : 'paused'} successfully`,
      });
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update bot status',
      });
    }
  };

  const deleteBot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bot?')) return;

    try {
      await IntelligenceApi.deleteBot(id);
      setBots(bots.filter(b => b._id !== id));
      toast({
        title: 'Success',
        description: 'Bot deleted successfully',
      });
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete bot',
      });
    }
  };

  const getStatusLabel = (bot: BotType) => {
    switch (bot.status) {
      case BotStatus.DRAFT:
        return 'Draft';
      case BotStatus.ACTIVE:
        return 'Active';
      case BotStatus.PAUSED:
        return 'Paused';
      case BotStatus.ARCHIVED:
        return 'Archived';
      default:
        return bot.is_active ? 'Active' : 'Paused';
    }
  };

  const getStatusVariant = (bot: BotType) =>
    bot.status === BotStatus.ACTIVE && bot.is_active ? 'default' : 'secondary';

  if (isLoading) {
    return (
      <div className='p-6 space-y-6'>
        <div className='flex justify-between items-center'>
          <Skeleton className='h-8 w-32' />
          <Skeleton className='h-10 w-32' />
        </div>
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className='h-48 w-full' />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>AI Bots</h1>
          <p className='text-muted-foreground mt-2'>
            Manage your AI assistants for different social accounts.
          </p>
        </div>
        <Link href='/dashboard/intelligence/bots/new'>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Create Bot
          </Button>
        </Link>
      </div>

      {bots.length === 0 ? (
        <div className='text-center py-12 border rounded-lg bg-muted/10'>
          <Bot className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
          <h3 className='text-lg font-medium'>No bots created yet</h3>
          <p className='text-muted-foreground mt-2 mb-6'>
            Create your first AI bot to automate your engagement.
          </p>
          <Link href='/dashboard/intelligence/bots/new'>
            <Button>Create Bot</Button>
          </Link>
        </div>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {bots.map(bot => (
            <Card key={bot._id}>
              <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
                <div className='space-y-1'>
                  <CardTitle className='text-xl flex items-center gap-2'>
                    {bot.name}
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${
                        bot.stats.avg_confidence >= 0.7
                          ? 'bg-green-500'
                          : bot.stats.avg_confidence >= 0.5
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      title={`Health: ${(bot.stats.avg_confidence * 100).toFixed(0)}%`}
                    />
                  </CardTitle>
                  <CardDescription className='line-clamp-1'>
                    {bot.description || 'No description'}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' className='h-8 w-8 p-0'>
                      <MoreHorizontal className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => toggleBotStatus(bot)}>
                      {bot.is_active ? (
                        <>
                          <Pause className='mr-2 h-4 w-4' /> Pause
                        </>
                      ) : (
                        <>
                          <Play className='mr-2 h-4 w-4' /> Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/intelligence/bots/${bot._id}`}>
                        <Settings className='mr-2 h-4 w-4' /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/intelligence/bots/${bot._id}/knowledge`}
                      >
                        <Brain className='mr-2 h-4 w-4' /> Knowledge
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/intelligence/bots/${bot._id}/memory`}
                      >
                        <Users className='mr-2 h-4 w-4' /> Memory
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className='text-destructive focus:text-destructive'
                      onClick={() => deleteBot(bot._id)}
                    >
                      <Trash className='mr-2 h-4 w-4' /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className='space-y-4 mt-4'>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-muted-foreground'>Status</span>
                    <Badge variant={getStatusVariant(bot)}>
                      {getStatusLabel(bot)}
                    </Badge>
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-muted-foreground'>Confidence</span>
                    <span className='font-medium'>
                      {(bot.stats.avg_confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-muted-foreground'>Total Replies</span>
                    <span className='font-medium'>
                      {bot.stats.total_replies}
                    </span>
                  </div>
                  <div className='pt-4 flex gap-2'>
                    <Link
                      href={`/dashboard/intelligence/bots/${bot._id}`}
                      className='flex-1'
                    >
                      <Button variant='outline' className='w-full'>
                        Configure
                      </Button>
                    </Link>
                    <Link
                      href={`/dashboard/intelligence/bots/${bot._id}/knowledge`}
                      className='flex-1'
                    >
                      <Button variant='secondary' className='w-full'>
                        <Brain className='mr-2 h-4 w-4' />
                        Train
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
