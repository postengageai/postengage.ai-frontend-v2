'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Instagram,
  Star,
  RefreshCw,
  Trash2,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SocialAccountsApi } from '@/lib/api/social-accounts';
import { InstagramOAuthApi } from '@/lib/api/oauth';
import type {
  SocialAccount,
  SocialAccountConnectionStatus,
} from '@/lib/types/settings';
import { SocialAccountsSkeleton } from './social-accounts-skeleton';

const statusConfig: Record<
  SocialAccountConnectionStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: React.ElementType;
  }
> = {
  connected: { label: 'Connected', variant: 'default', icon: CheckCircle2 },
  disconnected: {
    label: 'Disconnected',
    variant: 'secondary',
    icon: AlertTriangle,
  },
  expired: { label: 'Expired', variant: 'destructive', icon: AlertTriangle },
  pending: { label: 'Pending', variant: 'outline', icon: RefreshCw },
  error: { label: 'Error', variant: 'destructive', icon: AlertTriangle },
};

export function SocialAccounts() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [reconnectingId, setReconnectingId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    loadAccounts();

    // Handle incoming OAuth messages from popup (via BroadcastChannel or postMessage)
    const handleOAuthMessage = (data: Record<string, unknown>) => {
      if (!data || !data.type) return;
      if (data.type === 'OAUTH_SUCCESS' && data.platform === 'instagram') {
        loadAccounts();
      } else if (data.type === 'OAUTH_ERROR') {
        setError(
          (data.description as string) ||
            'Failed to connect account. Please try again.'
        );
      }
    };

    // Primary: BroadcastChannel (works after cross-origin redirect when window.opener is null)
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(InstagramOAuthApi.OAUTH_CHANNEL);
      channel.onmessage = (event: MessageEvent) => {
        handleOAuthMessage(event.data);
      };
    } catch {
      // BroadcastChannel not supported in this browser
    }

    // Fallback: window.postMessage (works when window.opener is available)
    const handlePostMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin) {
        handleOAuthMessage(event.data);
      }
    };

    window.addEventListener('message', handlePostMessage);
    return () => {
      window.removeEventListener('message', handlePostMessage);
      try {
        channel?.close();
      } catch {
        // ignore
      }
    };
  }, []);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await SocialAccountsApi.list({ platform: 'instagram' });
      setAccounts(data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load social accounts';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPrimary = async (accountId: string) => {
    try {
      setSettingPrimaryId(accountId);

      await SocialAccountsApi.setPrimary(accountId);

      setTimeout(loadAccounts, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to set primary account';
      setError(errorMessage);
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    try {
      // revoke existing connection
      await InstagramOAuthApi.revoke(accountId);

      setTimeout(loadAccounts, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to disconnect account';
      setError(errorMessage);
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleReconnect = async (accountId: string) => {
    try {
      setReconnectingId(accountId);
      // For Instagram accounts, use OAuth revoke and then reconnect flow
      const account = accounts.find(acc => acc.id === accountId);
      if (account?.platform === 'instagram') {
        // Then open new authorization for reconnection
        await InstagramOAuthApi.openAuthorization();
        // Reload accounts after a short delay
        setTimeout(loadAccounts, 2000);
      } else {
        // For other platforms, use the same approach as connect
        await InstagramOAuthApi.openAuthorization();
        setTimeout(loadAccounts, 2000);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to reconnect account';
      setError(errorMessage);
    } finally {
      setReconnectingId(null);
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      // Open Instagram OAuth in new tab
      await InstagramOAuthApi.openAuthorization();
      // Reload accounts after a short delay to allow for OAuth completion
      setTimeout(loadAccounts, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to connect account';
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  if (isLoading) {
    return <SocialAccountsSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-16 text-center'>
          <AlertTriangle className='mb-4 h-12 w-12 text-destructive' />
          <h3 className='mb-2 text-lg font-medium text-foreground'>
            Failed to load accounts
          </h3>
          <p className='mb-6 max-w-sm text-sm text-muted-foreground'>{error}</p>
          <Button onClick={loadAccounts} variant='outline'>
            <RefreshCw className='mr-2 h-4 w-4' />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-16 text-center'>
          <div className='mb-4 rounded-full bg-muted p-4'>
            <Instagram className='h-8 w-8 text-muted-foreground' />
          </div>
          <h3 className='mb-2 text-lg font-medium text-foreground'>
            No social accounts connected
          </h3>
          <p className='mb-6 max-w-sm text-sm text-muted-foreground'>
            Connect your first account to start automating your engagement and
            growing your audience.
          </p>
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Instagram className='mr-2 h-4 w-4' />
            )}
            Connect Instagram
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Connected Accounts */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>Connected accounts</CardTitle>
            <CardDescription>
              Manage your social media accounts for automation
            </CardDescription>
          </div>
          <Button onClick={handleConnect} disabled={isConnecting} size='sm'>
            {isConnecting ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Plus className='mr-2 h-4 w-4' />
            )}
            Add account
          </Button>
        </CardHeader>
        <CardContent className='space-y-4'>
          {accounts.map(account => {
            const status = statusConfig[account.connection_status];
            const StatusIcon = status.icon;
            const needsReconnect =
              account.connection_status === 'expired' ||
              account.connection_status === 'error';

            return (
              <div
                key={account.id}
                className={cn(
                  'flex items-center gap-4 rounded-lg border p-4 transition-colors',
                  needsReconnect
                    ? 'border-destructive/50 bg-destructive/5'
                    : 'border-border'
                )}
              >
                {/* Avatar & Platform */}
                <div className='relative'>
                  {account.avatar?.url ? (
                    <Image
                      src={account.avatar.url || '/placeholder.svg'}
                      alt={account.username}
                      width={48}
                      height={48}
                      className='rounded-full'
                    />
                  ) : (
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
                      <Instagram className='h-5 w-5 text-muted-foreground' />
                    </div>
                  )}
                  <div className='absolute -bottom-1 -right-1 rounded-full bg-background p-0.5'>
                    <Instagram className='h-4 w-4 text-pink-500' />
                  </div>
                </div>

                {/* Account Info */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-foreground truncate'>
                      {account.username}
                    </span>
                    {account.is_primary && (
                      <Badge variant='outline' className='gap-1 text-xs'>
                        <Star className='h-3 w-3 fill-current' />
                        Primary
                      </Badge>
                    )}
                  </div>
                  <div className='mt-1 flex items-center gap-3 text-xs text-muted-foreground'>
                    <span className='flex items-center gap-1'>
                      <StatusIcon
                        className={cn(
                          'h-3 w-3',
                          account.connection_status === 'connected'
                            ? 'text-green-500'
                            : account.connection_status === 'expired' ||
                                account.connection_status === 'error'
                              ? 'text-destructive'
                              : 'text-muted-foreground'
                        )}
                      />
                      {status.label}
                    </span>
                    <span>•</span>
                    <span>Connected {formatDate(account.connected_at)}</span>
                    {account.connection_status === 'connected' && (
                      <>
                        <span>•</span>
                        <span>
                          Synced {formatRelativeTime(account.last_synced_at)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className='flex items-center gap-2'>
                  {needsReconnect ? (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleReconnect(account.id)}
                      disabled={reconnectingId === account.id}
                    >
                      {reconnectingId === account.id ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      ) : (
                        <RefreshCw className='mr-2 h-4 w-4' />
                      )}
                      Reconnect
                    </Button>
                  ) : (
                    !account.is_primary && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleSetPrimary(account.id)}
                        disabled={settingPrimaryId === account.id}
                      >
                        {settingPrimaryId === account.id ? (
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : (
                          <Star className='mr-2 h-4 w-4' />
                        )}
                        Set primary
                      </Button>
                    )
                  )}
                  <Button
                    variant='ghost'
                    size='icon'
                    className='text-muted-foreground hover:text-destructive'
                    onClick={() => setDisconnectingId(account.id)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Trust Note */}
      <Card>
        <CardContent className='py-4'>
          <p className='text-center text-sm text-muted-foreground'>
            We never post without your permission. Your data is encrypted and
            secure.
          </p>
        </CardContent>
      </Card>

      {/* Disconnect Confirmation */}
      <AlertDialog
        open={!!disconnectingId}
        onOpenChange={() => setDisconnectingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop all automations for this account. You can reconnect
              at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={() =>
                disconnectingId && handleDisconnect(disconnectingId)
              }
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
