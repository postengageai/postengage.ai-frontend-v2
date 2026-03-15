'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Search,
  UserPlus,
  Download,
  Users,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Mail,
  Film,
  Layers,
  FileText,
  Zap,
  X,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { AddLeadSheet } from '@/components/leads/add-lead-sheet';
import { ExportLeadsDialog } from '@/components/leads/export-leads-dialog';
import type { CaptureSource } from '@/lib/types/leads';
import type { SocialPlatform } from '@/lib/types/settings';
import { cn } from '@/lib/utils';
import { useLeads, useLeadTags, queryKeys } from '@/lib/hooks';

// ─── Platform config ──────────────────────────────────────────────────────────

const PLATFORM_CONFIG: Record<
  SocialPlatform,
  { label: string; icon: React.ReactNode; color: string }
> = {
  instagram: {
    label: 'Instagram',
    icon: <Instagram className='h-3.5 w-3.5' />,
    color: 'text-pink-500',
  },
  twitter: {
    label: 'Twitter / X',
    icon: <Twitter className='h-3.5 w-3.5' />,
    color: 'text-sky-500',
  },
  facebook: {
    label: 'Facebook',
    icon: <Facebook className='h-3.5 w-3.5' />,
    color: 'text-blue-600',
  },
  linkedin: {
    label: 'LinkedIn',
    icon: <Linkedin className='h-3.5 w-3.5' />,
    color: 'text-blue-700',
  },
  youtube: {
    label: 'YouTube',
    icon: <Youtube className='h-3.5 w-3.5' />,
    color: 'text-red-500',
  },
  tiktok: {
    label: 'TikTok',
    icon: <Film className='h-3.5 w-3.5' />,
    color: 'text-foreground',
  },
  pinterest: {
    label: 'Pinterest',
    icon: <Layers className='h-3.5 w-3.5' />,
    color: 'text-red-600',
  },
};

const CAPTURE_SOURCE_CONFIG: Record<
  CaptureSource,
  { label: string; icon: React.ReactNode }
> = {
  comment: {
    label: 'Comment',
    icon: <MessageCircle className='h-3.5 w-3.5' />,
  },
  dm: { label: 'DM', icon: <Mail className='h-3.5 w-3.5' /> },
  reel: { label: 'Reel', icon: <Film className='h-3.5 w-3.5' /> },
  story: { label: 'Story', icon: <Layers className='h-3.5 w-3.5' /> },
  post: { label: 'Post', icon: <FileText className='h-3.5 w-3.5' /> },
  live: { label: 'Live', icon: <Zap className='h-3.5 w-3.5' /> },
};

const TAG_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
  'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800',
  'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800',
];

const getTagColor = (name: string) =>
  TAG_COLORS[name.charCodeAt(0) % TAG_COLORS.length];

const PER_PAGE = 10;

// ─── Component ────────────────────────────────────────────────────────────────

export default function LeadsPage() {
  const qc = useQueryClient();

  // ── Filter state ───────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [platform, setPlatform] = useState<SocialPlatform | 'all'>('all');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showMoreTags, setShowMoreTags] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // Debounce search input — resets page to 1 on new search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Data fetching via TanStack Query ───────────────────────────────────────
  const { data, isLoading, isFetching } = useLeads({
    page,
    limit: PER_PAGE,
    search: debouncedSearch || undefined,
    platform: platform === 'all' ? undefined : platform,
    tags: activeTags.length ? activeTags : undefined,
  });

  const { data: tagsData } = useLeadTags();

  const leads = data?.leads ?? [];
  const total = data?.total ?? 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allTags = (tagsData ?? []).map((t: any) =>
    typeof t === 'string' ? t : t.name
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handlePlatformChange = (val: string) => {
    setPlatform(val as SocialPlatform | 'all');
    setPage(1);
  };

  const toggleTag = (tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setPlatform('all');
    setActiveTags([]);
    setPage(1);
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const hasFilters = search || platform !== 'all' || activeTags.length > 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const startIdx = (page - 1) * PER_PAGE + 1;
  const endIdx = Math.min(page * PER_PAGE, total);
  const visibleTags = showMoreTags ? allTags : allTags.slice(0, 8);
  // Show skeleton only on initial load, not on background refetches
  const showSkeleton = isLoading;

  return (
    <div className='flex h-full flex-col gap-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Leads</h1>
          <p className='text-sm text-muted-foreground'>
            Manage and track your captured leads
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setExportOpen(true)}
          >
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
          <Button size='sm' onClick={() => setAddLeadOpen(true)}>
            <UserPlus className='mr-2 h-4 w-4' />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Filters row */}
      <div className='flex flex-col gap-3'>
        <div className='flex items-center gap-3'>
          <div className='relative flex-1 max-w-sm'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              className='pl-9'
              placeholder='Search by name or username…'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <Select value={platform} onValueChange={handlePlatformChange}>
            <SelectTrigger className='w-44'>
              <SelectValue placeholder='All Platforms' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Platforms</SelectItem>
              {Object.entries(PLATFORM_CONFIG).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>
                  <span className='flex items-center gap-2'>
                    <span className={cfg.color}>{cfg.icon}</span>
                    {cfg.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant='ghost' size='sm' onClick={clearFilters}>
              <X className='mr-1 h-3.5 w-3.5' />
              Clear filters
            </Button>
          )}
        </div>

        {/* Tag filter chips */}
        {allTags.length > 0 && (
          <div className='flex flex-wrap items-center gap-2'>
            {visibleTags.map((tag: string) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  'inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium transition-all',
                  activeTags.includes(tag)
                    ? getTagColor(tag)
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                )}
              >
                {tag}
                {activeTags.includes(tag) && (
                  <X className='ml-1.5 h-2.5 w-2.5' />
                )}
              </button>
            ))}
            {allTags.length > 8 && (
              <button
                onClick={() => setShowMoreTags(v => !v)}
                className='text-xs text-muted-foreground hover:text-foreground'
              >
                {showMoreTags ? 'Show less' : `+ ${allTags.length - 8} more`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div
        className={cn(
          'flex-1 overflow-auto rounded-lg border transition-opacity',
          isFetching && !showSkeleton ? 'opacity-70' : 'opacity-100'
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[260px]'>Lead</TableHead>
              <TableHead className='w-[160px]'>Platform</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className='w-[180px]'>Captured</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Skeleton className='h-8 w-8 rounded-full' />
                      <div className='space-y-1'>
                        <Skeleton className='h-3.5 w-24' />
                        <Skeleton className='h-3 w-16' />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-3.5 w-20' />
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-1'>
                      <Skeleton className='h-5 w-14 rounded-full' />
                      <Skeleton className='h-5 w-12 rounded-full' />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-3.5 w-32' />
                  </TableCell>
                </TableRow>
              ))
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='py-16 text-center'>
                  <div className='flex flex-col items-center gap-3'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
                      <Users className='h-6 w-6 text-muted-foreground' />
                    </div>
                    {hasFilters ? (
                      <>
                        <p className='font-medium'>No leads found</p>
                        <p className='text-sm text-muted-foreground'>
                          Try adjusting your search or filters
                        </p>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={clearFilters}
                        >
                          Clear Filters
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className='font-medium'>No leads captured yet</p>
                        <p className='text-sm text-muted-foreground'>
                          Create an automation or add a lead manually
                        </p>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setAddLeadOpen(true)}
                        >
                          <UserPlus className='mr-1.5 h-3.5 w-3.5' />
                          Add Lead
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              leads.map(lead => {
                const primaryProfile =
                  lead.social_profiles?.find(p => p.is_primary) ??
                  lead.social_profiles?.[0];
                const displayPlatform =
                  lead.platform ?? primaryProfile?.platform;
                const displayUsername =
                  lead.username ?? primaryProfile?.username ?? '';
                const displayAvatar =
                  lead.avatar_url ?? primaryProfile?.avatar_url;
                const platCfg = displayPlatform
                  ? PLATFORM_CONFIG[displayPlatform]
                  : null;
                const capCfg = CAPTURE_SOURCE_CONFIG[lead.captured_from];
                return (
                  <TableRow
                    key={lead.id}
                    className='cursor-pointer hover:bg-muted/40'
                  >
                    <TableCell>
                      <Link
                        href={`/dashboard/leads/${lead.id}`}
                        className='flex items-center gap-3'
                      >
                        <Avatar className='h-8 w-8'>
                          <AvatarImage
                            src={displayAvatar ?? undefined}
                            alt={displayUsername}
                          />
                          <AvatarFallback className='text-xs'>
                            {displayUsername.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='text-sm font-medium leading-none'>
                            @{displayUsername}
                          </p>
                          {lead.full_name && (
                            <p className='mt-0.5 text-xs text-muted-foreground'>
                              {lead.full_name}
                            </p>
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      {platCfg && (
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 text-sm',
                            platCfg.color
                          )}
                        >
                          {platCfg.icon}
                          {platCfg.label}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {lead.tags.length === 0 ? (
                          <span className='text-xs text-muted-foreground'>
                            —
                          </span>
                        ) : (
                          lead.tags.slice(0, 3).map(tag => (
                            <Badge
                              key={tag}
                              variant='outline'
                              className={cn('text-xs', getTagColor(tag))}
                            >
                              {tag}
                            </Badge>
                          ))
                        )}
                        {lead.tags.length > 3 && (
                          <Badge
                            variant='outline'
                            className='text-xs text-muted-foreground'
                          >
                            +{lead.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className='inline-flex items-center gap-1.5 text-sm text-muted-foreground'>
                        {capCfg?.icon}
                        {format(new Date(lead.captured_at), 'MMM d, yyyy')}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!showSkeleton && total > 0 && (
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            Showing {startIdx}–{endIdx} of {total} leads
          </p>
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='icon'
              className='h-8 w-8'
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <span className='px-2 text-sm'>
              {page} / {totalPages}
            </span>
            <Button
              variant='outline'
              size='icon'
              className='h-8 w-8'
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isFetching}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}

      {/* Sheets & Dialogs */}
      <AddLeadSheet
        open={addLeadOpen}
        onOpenChange={setAddLeadOpen}
        onSuccess={() => {
          // Invalidate leads cache so new lead appears without manual state juggling
          qc.invalidateQueries({ queryKey: queryKeys.leads.lists() });
          qc.invalidateQueries({ queryKey: queryKeys.leads.tags() });
        }}
      />
      <ExportLeadsDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        totalLeads={total}
        activeFilters={{ platform, tags: activeTags, search }}
      />
    </div>
  );
}
