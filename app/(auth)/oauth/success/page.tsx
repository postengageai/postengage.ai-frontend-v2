'use client';

import { useEffect, useState } from 'react';
// import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  Instagram,
  Zap,
  LayoutDashboard,
  Users,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for demonstration
const mockConnectedAccount = {
  id: 'acc_123',
  platform: 'instagram',
  username: '@postengage.ai',
  avatar_url: '/instagram-profile-avatar.jpg',
  connected_at: new Date().toISOString(),
};

export default function OAuthSuccessPage() {
  // const searchParams = useSearchParams();
  // const router = useRouter();
  const [showAnimation, setShowAnimation] = useState(false);

  // In production, this would come from the URL params or API
  const account = mockConnectedAccount;
  // const platform = searchParams.get('platform') || account.platform;

  useEffect(() => {
    // Trigger success animation on mount
    const timer = setTimeout(() => setShowAnimation(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-6'>
        {/* Success Icon with Animation */}
        <div className='flex justify-center'>
          <div
            className={cn(
              'relative flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 transition-all duration-500',
              showAnimation ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            )}
          >
            {/* Pulse Ring */}
            <div className='absolute inset-0 animate-ping rounded-full bg-green-500/20' />
            <CheckCircle2 className='h-10 w-10 text-green-500' />
          </div>
        </div>

        {/* Primary Heading */}
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-semibold text-foreground'>
            Instagram Connected Successfully
          </h1>
          <p className='text-muted-foreground'>
            Your account{' '}
            <span className='font-medium text-foreground'>
              {account.username}
            </span>{' '}
            is now securely connected and ready to use.
          </p>
        </div>

        {/* Connected Account Card */}
        <Card className='overflow-hidden'>
          <CardContent className='p-0'>
            <div className='flex items-center gap-4 p-6'>
              {/* Avatar with Platform Badge */}
              <div className='relative'>
                <Image
                  src={
                    account.avatar_url ||
                    '/placeholder.svg?height=64&width=64&query=profile'
                  }
                  alt={account.username}
                  width={64}
                  height={64}
                  className='rounded-full border-2 border-border'
                />
                <div className='absolute -bottom-1 -right-1 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-1.5'>
                  <Instagram className='h-4 w-4 text-white' />
                </div>
              </div>

              {/* Account Info */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <span className='font-semibold text-foreground'>
                    {account.username}
                  </span>
                  <Badge
                    variant='default'
                    className='bg-green-500/10 text-green-500 hover:bg-green-500/10'
                  >
                    <CheckCircle2 className='mr-1 h-3 w-3' />
                    Connected
                  </Badge>
                </div>
                <p className='mt-1 text-sm text-muted-foreground'>
                  Instagram Business Account
                </p>
              </div>
            </div>

            <Separator />

            {/* Connection Details */}
            <div className='bg-muted/30 px-6 py-4'>
              <div className='flex items-center justify-between text-sm'>
                <span className='text-muted-foreground'>Connected</span>
                <span className='text-foreground'>
                  {formatDate(account.connected_at)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Note */}
        <div className='flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-4'>
          <Shield className='mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground' />
          <p className='text-sm text-muted-foreground'>
            We never post or message without your permission. Your data is
            encrypted and secure.
          </p>
        </div>

        {/* CTAs */}
        <div className='space-y-3'>
          {/* Primary CTA */}
          <Button asChild className='w-full' size='lg'>
            <Link href='/automations'>
              <Zap className='mr-2 h-5 w-5' />
              Create Your First Automation
            </Link>
          </Button>

          {/* Secondary CTAs */}
          <div className='grid grid-cols-2 gap-3'>
            <Button variant='outline' asChild>
              <Link href='/settings/social-accounts'>
                <Users className='mr-2 h-4 w-4' />
                View Accounts
              </Link>
            </Button>
            <Button variant='outline' asChild>
              <Link href='/dashboard'>
                <LayoutDashboard className='mr-2 h-4 w-4' />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
