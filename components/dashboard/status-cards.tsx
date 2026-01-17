'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Instagram, Zap, Bot, ArrowRight, RefreshCw } from 'lucide-react';
import type { ConnectedAccount } from '@/lib/types/dashboard';

interface StatusCardsProps {
  connectedAccount: ConnectedAccount | null;
  credits: {
    remaining: number;
    estimatedReplies: number;
  };
  activeAutomationCount: number;
  totalAutomationCount: number;
}

export function StatusCards({
  connectedAccount,
  credits,
  activeAutomationCount,
  totalAutomationCount,
}: StatusCardsProps) {
  const isLowCredits = credits.remaining < 50;
  const isCriticalCredits = credits.remaining < 10;

  // Format last sync time
  const formatLastSync = (date?: Date) => {
    if (!date) return 'Never';
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {/* Connected Account Card */}
      <Card className='py-0 overflow-hidden transition-all duration-150 hover:translate-y-[-2px] hover:shadow-lg'>
        <CardContent className='p-5'>
          {connectedAccount ? (
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500'>
                  <Instagram className='h-5 w-5 text-white' />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    Connected Account
                  </p>
                  <p className='font-semibold'>@{connectedAccount.username}</p>
                </div>
              </div>
              <div className='flex items-center gap-1.5'>
                <span className='h-2 w-2 rounded-full bg-success' />
                <span className='text-xs text-muted-foreground'>Live</span>
              </div>
            </div>
          ) : (
            <div className='flex flex-col gap-3'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary'>
                  <Instagram className='h-5 w-5 text-muted-foreground' />
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>No Account</p>
                  <p className='font-semibold'>Connect Instagram</p>
                </div>
              </div>
              <Button size='sm' className='w-full' asChild>
                <Link href='/dashboard/connect'>
                  Connect Now
                  <ArrowRight className='ml-2 h-3 w-3' />
                </Link>
              </Button>
            </div>
          )}
          {connectedAccount && (
            <div className='mt-4 flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border'>
              <span>
                Last sync: {formatLastSync(connectedAccount.lastSync)}
              </span>
              <button className='flex items-center gap-1 hover:text-foreground transition-colors'>
                <RefreshCw className='h-3 w-3' />
                Sync
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credits Card */}
      <Card className='py-0 overflow-hidden transition-all duration-150 hover:translate-y-[-2px] hover:shadow-lg'>
        <CardContent className='p-5'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-3'>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isCriticalCredits
                    ? 'bg-destructive/10 text-destructive'
                    : isLowCredits
                      ? 'bg-warning/10 text-warning'
                      : 'bg-primary/10 text-primary'
                }`}
              >
                <Zap className='h-5 w-5' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Credits Remaining
                </p>
                <p className='font-semibold font-mono text-xl'>
                  {credits.remaining}
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className='mt-4'>
            <p className='mt-2 text-xs text-muted-foreground'>
              ~{credits.estimatedReplies} replies remaining
              {isLowCredits && (
                <Link
                  href='/dashboard/billing'
                  className='ml-2 text-primary hover:underline'
                >
                  Get more
                </Link>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Automations Status Card */}
      <Card className='py-0 overflow-hidden transition-all duration-150 hover:translate-y-[-2px] hover:shadow-lg sm:col-span-2 lg:col-span-1'>
        <CardContent className='p-5'>
          <div className='flex items-start justify-between'>
            <div className='flex items-center gap-3'>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  activeAutomationCount > 0
                    ? 'bg-success/10 text-success'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <Bot className='h-5 w-5' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Automations</p>
                <p className='font-semibold'>
                  {activeAutomationCount > 0 ? (
                    <>
                      <span className='text-success'>
                        {activeAutomationCount} active
                      </span>
                      {totalAutomationCount > activeAutomationCount && (
                        <span className='text-muted-foreground font-normal'>
                          {' '}
                          / {totalAutomationCount} total
                        </span>
                      )}
                    </>
                  ) : totalAutomationCount > 0 ? (
                    <span className='text-muted-foreground'>
                      {totalAutomationCount} paused
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>None created</span>
                  )}
                </p>
              </div>
            </div>
            {activeAutomationCount > 0 && (
              <div className='flex items-center gap-1.5'>
                <span className='relative flex h-2 w-2'>
                  <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75' />
                  <span className='relative inline-flex h-2 w-2 rounded-full bg-success' />
                </span>
                <span className='text-xs text-success'>Running</span>
              </div>
            )}
          </div>

          {totalAutomationCount === 0 && (
            <Button
              size='sm'
              variant='secondary'
              className='w-full mt-4'
              asChild
            >
              <Link href='/dashboard/automations/new'>
                Create First Automation
                <ArrowRight className='ml-2 h-3 w-3' />
              </Link>
            </Button>
          )}

          {totalAutomationCount > 0 && (
            <div className='mt-4 pt-3 border-t border-border'>
              <Link
                href='/dashboard/automations'
                className='text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1'
              >
                Manage automations
                <ArrowRight className='h-3 w-3' />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
