'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Users, Bell } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WaitlistApi } from '@/lib/api/waitlist';
import { cn } from '@/lib/utils';

// ─── Platform configs ─────────────────────────────────────────────────────────

export interface WaitlistPlatformConfig {
  /** Key sent to the API, e.g. 'x', 'facebook', 'whatsapp' */
  platform: string;
  displayName: string;
  description: string;
  /** Rendered inside the icon circle — can be a JSX element or a short string */
  iconContent: React.ReactNode;
  /** Tailwind bg class for the icon circle */
  iconBg: string;
  /** Tailwind text class for the icon content */
  iconColor: string;
  /** Tailwind border/bg classes for the card frame */
  cardBorder: string;
  cardBg: string;
  /** Button accent classes */
  btnClass: string;
  /** Badge border/text/bg classes */
  badgeBorder: string;
  badgeText: string;
  badgeBg: string;
  /** Joined-state text colour */
  joinedColor: string;
}

export const WAITLIST_PLATFORMS: WaitlistPlatformConfig[] = [
  {
    platform: 'whatsapp',
    displayName: 'WhatsApp Business',
    description:
      'Automate your WhatsApp Business conversations — reply to inquiries, qualify leads, and nurture customers at scale.',
    iconContent: (
      <svg viewBox='0 0 24 24' className='h-4 w-4 fill-white'>
        <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' />
      </svg>
    ),
    iconBg: 'bg-[#25D366]',
    iconColor: 'text-white',
    cardBorder: 'border-green-200 dark:border-green-800',
    cardBg: 'bg-green-50/30 dark:bg-green-950/20',
    btnClass: 'bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0',
    badgeBorder: 'border-green-300 dark:border-green-700',
    badgeText: 'text-green-700 dark:text-green-400',
    badgeBg: 'bg-green-50 dark:bg-green-950/40',
    joinedColor: 'text-green-700 dark:text-green-400',
  },
  {
    platform: 'x',
    displayName: 'X (Twitter)',
    description:
      'Auto-reply to mentions, DMs, and comments — grow your audience and capture leads from every conversation on X.',
    iconContent: (
      <svg viewBox='0 0 24 24' className='h-4 w-4 fill-white'>
        <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
      </svg>
    ),
    iconBg: 'bg-black dark:bg-white',
    iconColor: 'text-white dark:text-black',
    cardBorder: 'border-slate-200 dark:border-slate-700',
    cardBg: 'bg-slate-50/30 dark:bg-slate-950/20',
    btnClass:
      'bg-black hover:bg-zinc-800 text-white border-0 dark:bg-white dark:hover:bg-zinc-100 dark:text-black',
    badgeBorder: 'border-slate-300 dark:border-slate-600',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBg: 'bg-slate-50 dark:bg-slate-900/40',
    joinedColor: 'text-slate-700 dark:text-slate-300',
  },
  {
    platform: 'facebook',
    displayName: 'Facebook',
    description:
      'Automate Facebook Page comments and Messenger conversations — reply instantly, qualify leads, and keep your audience engaged.',
    iconContent: (
      <svg viewBox='0 0 24 24' className='h-4 w-4 fill-white'>
        <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
      </svg>
    ),
    iconBg: 'bg-[#1877F2]',
    iconColor: 'text-white',
    cardBorder: 'border-blue-200 dark:border-blue-800',
    cardBg: 'bg-blue-50/30 dark:bg-blue-950/20',
    btnClass: 'bg-[#1877F2] hover:bg-[#1462cc] text-white border-0',
    badgeBorder: 'border-blue-300 dark:border-blue-700',
    badgeText: 'text-blue-700 dark:text-blue-400',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    joinedColor: 'text-blue-700 dark:text-blue-400',
  },
  {
    platform: 'linkedin',
    displayName: 'LinkedIn',
    description:
      'Automate LinkedIn post comments and connection messages — build relationships and generate B2B leads on autopilot.',
    iconContent: (
      <svg viewBox='0 0 24 24' className='h-4 w-4 fill-white'>
        <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
      </svg>
    ),
    iconBg: 'bg-[#0A66C2]',
    iconColor: 'text-white',
    cardBorder: 'border-sky-200 dark:border-sky-800',
    cardBg: 'bg-sky-50/30 dark:bg-sky-950/20',
    btnClass: 'bg-[#0A66C2] hover:bg-[#084e96] text-white border-0',
    badgeBorder: 'border-sky-300 dark:border-sky-700',
    badgeText: 'text-sky-700 dark:text-sky-400',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
    joinedColor: 'text-sky-700 dark:text-sky-400',
  },
];

// ─── Reusable card ─────────────────────────────────────────────────────────────

interface PlatformWaitlistCardProps {
  config: WaitlistPlatformConfig;
  /** Compact mode for use inside the automation wizard platform picker */
  compact?: boolean;
}

export function PlatformWaitlistCard({ config, compact = false }: PlatformWaitlistCardProps) {
  const [joined, setJoined] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await WaitlistApi.getStatus(config.platform);
        setJoined(res.data.joined);
        setTotal(res.data.total);
      } catch {
        // silent — not critical
      } finally {
        setIsLoading(false);
      }
    };
    void fetchStatus();
  }, [config.platform]);

  const handleJoin = async () => {
    try {
      setIsJoining(true);
      const res = await WaitlistApi.join(config.platform);
      setJoined(res.data.joined);
      setTotal(res.data.total);
    } catch {
      // Might already be joined — re-fetch
      try {
        const status = await WaitlistApi.getStatus(config.platform);
        setJoined(status.data.joined);
        setTotal(status.data.total);
      } catch {
        // silent
      }
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card
      className={cn(
        'border-dashed border-2',
        config.cardBorder,
        config.cardBg,
      )}
    >
      <CardHeader className={compact ? 'pb-2 pt-4 px-4' : 'pb-3'}>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <div
              className={cn(
                'flex items-center justify-center rounded-full shrink-0',
                config.iconBg,
                compact ? 'h-7 w-7' : 'h-8 w-8',
              )}
            >
              {config.iconContent}
            </div>
            {config.displayName}
          </CardTitle>
          <Badge
            variant='outline'
            className={cn(
              'text-xs',
              config.badgeBorder,
              config.badgeText,
              config.badgeBg,
            )}
          >
            Coming Soon
          </Badge>
        </div>
      </CardHeader>

      <CardContent className={compact ? 'pb-4 px-4' : undefined}>
        {!compact && (
          <p className='text-sm text-muted-foreground mb-4'>{config.description}</p>
        )}

        {isLoading ? (
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' />
            Loading…
          </div>
        ) : joined ? (
          <div className='flex items-center justify-between'>
            <div className={cn('flex items-center gap-2 text-sm font-medium', config.joinedColor)}>
              <CheckCircle2 className='h-4 w-4' />
              You&apos;re on the waitlist!
            </div>
            {total > 0 && (
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <Users className='h-3 w-3' />
                {total.toLocaleString()} waiting
              </div>
            )}
          </div>
        ) : (
          <div className='flex items-center justify-between gap-3'>
            <Button
              size='sm'
              className={cn('gap-1.5', config.btnClass)}
              onClick={handleJoin}
              disabled={isJoining}
            >
              {isJoining ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Bell className='h-4 w-4' />
              )}
              Notify Me
            </Button>
            {total > 0 && (
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <Users className='h-3 w-3' />
                {total.toLocaleString()} already waiting
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
