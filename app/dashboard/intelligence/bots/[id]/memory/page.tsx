'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Brain,
  Users,
  Layers,
  Star,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MemoryApi } from '@/lib/api/memory';
import { IntelligenceApi } from '@/lib/api/intelligence';
import type {
  SemanticMemoryStats,
  SemanticMemoryUser,
  SemanticMemory,
} from '@/lib/types/memory';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/http/errors';

// ── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  fact: 'bg-blue-500/10 text-blue-600',
  preference: 'bg-purple-500/10 text-purple-600',
  goal: 'bg-green-500/10 text-green-600',
  objection: 'bg-red-500/10 text-red-600',
  context: 'bg-orange-500/10 text-orange-600',
  question: 'bg-yellow-500/10 text-yellow-700',
};

function categoryClass(category: string) {
  return CATEGORY_COLORS[category] ?? 'bg-muted text-muted-foreground';
}

function importanceDot(importance: number) {
  if (importance >= 9) return 'bg-red-500';
  if (importance >= 7) return 'bg-orange-400';
  if (importance >= 5) return 'bg-yellow-400';
  return 'bg-gray-300';
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className='rounded-lg border bg-card p-4 flex items-center gap-3'>
      <div className='p-2 rounded-md bg-muted text-muted-foreground'>
        {icon}
      </div>
      <div>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <p className='text-xl font-bold'>{value}</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BotMemoryPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const botId = params.id as string;

  const [botName, setBotName] = useState('');
  const [stats, setStats] = useState<SemanticMemoryStats | null>(null);
  const [users, setUsers] = useState<SemanticMemoryUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SemanticMemoryUser | null>(
    null
  );
  const [userMemories, setUserMemories] = useState<SemanticMemory[]>([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState(false);

  const LIMIT = 20;

  useEffect(() => {
    fetchInitial();
  }, [botId]);

  const fetchInitial = async () => {
    try {
      const [botRes, statsRes, usersRes] = await Promise.all([
        IntelligenceApi.getBot(botId),
        MemoryApi.getSemanticStats(botId),
        MemoryApi.getSemanticUsers(botId, { page: 1, limit: LIMIT }),
      ]);
      if (botRes?.data) setBotName(botRes.data.name);
      if (statsRes?.data) setStats(statsRes.data);
      if (usersRes?.data) {
        setUsers(usersRes.data.data);
        setTotalUsers(usersRes.data.total);
      }
    } catch (err) {
      const e = parseApiError(err);
      toast({ variant: 'destructive', title: e.title, description: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await MemoryApi.getSemanticUsers(botId, {
        page: nextPage,
        limit: LIMIT,
      });
      if (res?.data) {
        setUsers(prev => [...prev, ...res.data.data]);
        setPage(nextPage);
      }
    } catch (_) {
      // silent
    } finally {
      setIsLoadingMore(false);
    }
  };

  const openUserSheet = useCallback(
    async (user: SemanticMemoryUser) => {
      setSelectedUser(user);
      setSheetOpen(true);
      setUserMemories([]);
      setIsLoadingMemories(true);
      try {
        const res = await MemoryApi.getSemanticUserMemories(
          botId,
          user.platform_user_id
        );
        if (res?.data) setUserMemories(res.data);
      } catch (_) {
        // silent
      } finally {
        setIsLoadingMemories(false);
      }
    },
    [botId]
  );

  // ── Loading skeleton ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className='p-6 space-y-6'>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-10 w-10' />
          <div className='space-y-1'>
            <Skeleton className='h-7 w-48' />
            <Skeleton className='h-4 w-32' />
          </div>
        </div>
        <div className='grid gap-4 grid-cols-2 md:grid-cols-4'>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className='h-24' />
          ))}
        </div>
        <Skeleton className='h-64' />
      </div>
    );
  }

  const hasMore = users.length < totalUsers;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
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
          <p className='text-muted-foreground text-sm'>
            Long-term semantic memories stored for each follower.
          </p>
        </div>
      </div>

      {/* Stats row */}
      {stats && (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <StatCard
            icon={<Layers className='h-4 w-4' />}
            label='Total Memories'
            value={stats.total_memories.toLocaleString()}
          />
          <StatCard
            icon={<Users className='h-4 w-4' />}
            label='Unique Followers'
            value={stats.unique_users.toLocaleString()}
          />
          <StatCard
            icon={<Star className='h-4 w-4' />}
            label='Avg Importance'
            value={stats.avg_importance.toFixed(1)}
          />
          <StatCard
            icon={<Sparkles className='h-4 w-4' />}
            label='Categories'
            value={Object.keys(stats.by_category).length}
          />
        </div>
      )}

      {/* Category breakdown */}
      {stats && Object.keys(stats.by_category).length > 0 && (
        <div className='rounded-lg border bg-card p-4'>
          <p className='text-sm font-semibold mb-3'>Memory Categories</p>
          <div className='flex flex-wrap gap-2'>
            {Object.entries(stats.by_category)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => (
                <span
                  key={cat}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${categoryClass(cat)}`}
                >
                  {cat}
                  <span className='opacity-70'>({count})</span>
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Users list */}
      <div className='rounded-lg border bg-card'>
        <div className='px-4 py-3 border-b flex items-center justify-between'>
          <p className='text-sm font-semibold'>Followers with Memories</p>
          <Badge variant='secondary'>{totalUsers} total</Badge>
        </div>

        {users.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center gap-3'>
            <Brain className='h-10 w-10 text-muted-foreground opacity-30' />
            <p className='text-sm text-muted-foreground'>
              No memories stored yet. Once your bot starts chatting, memories
              will appear here.
            </p>
          </div>
        ) : (
          <div className='divide-y'>
            {users.map(user => (
              <button
                key={user.platform_user_id}
                className='w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left'
                onClick={() => openUserSheet(user)}
              >
                <div className='flex items-center gap-3'>
                  <div className='h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground'>
                    {user.platform_user_id.slice(-2).toUpperCase()}
                  </div>
                  <div>
                    <p className='text-sm font-medium'>
                      @{user.platform_user_id}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Last memory {timeAgo(user.last_memory_at)}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='text-right mr-1'>
                    <p className='text-sm font-semibold'>{user.memory_count}</p>
                    <p className='text-xs text-muted-foreground'>memories</p>
                  </div>
                  {user.core_memory_count > 0 && (
                    <Badge variant='secondary' className='text-xs'>
                      {user.core_memory_count} core
                    </Badge>
                  )}
                  <ChevronRight className='h-4 w-4 text-muted-foreground' />
                </div>
              </button>
            ))}
          </div>
        )}

        {hasMore && (
          <div className='p-4 border-t text-center'>
            <Button
              variant='outline'
              size='sm'
              onClick={loadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore
                ? 'Loading…'
                : `Load more (${totalUsers - users.length} remaining)`}
            </Button>
          </div>
        )}
      </div>

      {/* User memory sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className='w-full sm:max-w-lg'>
          <SheetHeader className='pr-6'>
            <div className='flex items-center justify-between'>
              <SheetTitle className='text-base'>
                @{selectedUser?.platform_user_id}
              </SheetTitle>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7'
                onClick={() => setSheetOpen(false)}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
            {selectedUser && (
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <span>{selectedUser.memory_count} memories</span>
                <span>·</span>
                <span>{selectedUser.core_memory_count} core</span>
                <span>·</span>
                <span>last {timeAgo(selectedUser.last_memory_at)}</span>
              </div>
            )}
          </SheetHeader>

          <ScrollArea className='mt-4 h-[calc(100vh-10rem)]'>
            {isLoadingMemories ? (
              <div className='space-y-3 pr-4'>
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className='h-16' />
                ))}
              </div>
            ) : userMemories.length === 0 ? (
              <p className='text-sm text-muted-foreground text-center py-8'>
                No memories found.
              </p>
            ) : (
              <div className='space-y-2 pr-4'>
                {userMemories.map(mem => (
                  <div
                    key={mem.id}
                    className='rounded-lg border bg-card px-4 py-3 space-y-1.5'
                  >
                    <div className='flex items-center gap-2'>
                      <span
                        className={`h-2 w-2 rounded-full flex-shrink-0 ${importanceDot(mem.importance)}`}
                      />
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryClass(mem.category)}`}
                      >
                        {mem.category}
                      </span>
                      <span className='text-xs text-muted-foreground ml-auto'>
                        imp: {mem.importance}/10
                      </span>
                    </div>
                    <p className='text-sm leading-relaxed'>{mem.content}</p>
                    <p className='text-xs text-muted-foreground'>
                      {timeAgo(mem.created_at)} · accessed {mem.access_count}×
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
