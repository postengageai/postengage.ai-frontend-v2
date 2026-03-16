'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Copy,
  Check,
  Users,
  MousePointerClick,
  Coins,
  ExternalLink,
  Gift,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AffiliateApi, type Affiliate } from '@/lib/api/affiliate';
import { parseApiError } from '@/lib/http/errors';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  subtext?: string;
}

function StatCard({ title, value, icon: Icon, iconBg, iconColor, subtext }: StatCardProps) {
  return (
    <Card>
      <CardContent className='p-5'>
        <div className='flex items-start justify-between'>
          <div>
            <p className='text-sm text-muted-foreground'>{title}</p>
            <p className='mt-1 text-2xl font-bold text-foreground'>{value}</p>
            {subtext && (
              <p className='mt-0.5 text-xs text-muted-foreground'>{subtext}</p>
            )}
          </div>
          <div className={`rounded-lg p-2 ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AffiliatePage() {
  const { toast } = useToast();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notJoined, setNotJoined] = useState(false);

  const fetchAffiliate = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await AffiliateApi.getMyAffiliate();
      const data = (res as unknown as { data: Affiliate }).data;
      setAffiliate(data);
    } catch (err) {
      const error = parseApiError(err);
      if (error?.code === 'PE-AFF-001') {
        setNotJoined(true);
      } else {
        toast({ title: 'Failed to load affiliate data', description: error?.message ?? 'Please try again later.', variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { void fetchAffiliate(); }, [fetchAffiliate]);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const res = await AffiliateApi.join({});
      const data = (res as unknown as { data: Affiliate }).data;
      setAffiliate(data);
      setNotJoined(false);
      toast({ title: 'Welcome to the affiliate program!' });
    } catch (err) {
      const error = parseApiError(err);
      toast({ title: 'Could not join', description: error?.message ?? 'Please try again.', variant: 'destructive' });
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopy = () => {
    if (!affiliate?.referral_url) return;
    void navigator.clipboard.writeText(affiliate.referral_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Referral link copied!' });
  };

  if (isLoading) {
    return (
      <div className='mx-auto max-w-3xl space-y-6 p-6'>
        <Skeleton className='h-8 w-48' />
        <div className='grid gap-4 sm:grid-cols-3'>
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardContent className='p-5'><div className='space-y-2'><Skeleton className='h-4 w-24' /><Skeleton className='h-8 w-16' /></div></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  if (notJoined) {
    return (
      <div className='mx-auto flex max-w-lg flex-col items-center gap-6 p-6 pt-16 text-center'>
        <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10'>
          <Gift className='h-8 w-8 text-primary' />
        </div>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>Join the Affiliate Program</h1>
          <p className='mt-2 text-muted-foreground'>
            Refer friends and earn <span className='font-semibold text-foreground'>free credits</span> every time someone signs up with your link. Each referral surprises you with <span className='font-semibold text-foreground'>1–6 bonus credits</span> — instantly added to your balance.
          </p>
        </div>
        <div className='w-full rounded-xl border border-border bg-card p-5 text-left'>
          <h2 className='mb-4 text-sm font-semibold text-foreground'>How it works</h2>
          <div className='space-y-3'>
            {[
              { icon: Gift, color: 'text-primary', bg: 'bg-primary/10', text: 'Join to get your unique referral link' },
              { icon: Users, color: 'text-sky-500', bg: 'bg-sky-500/10', text: 'Share with your audience, followers or friends' },
              { icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10', text: 'Earn 1–6 random credits for every signup' },
              { icon: Zap, color: 'text-violet-500', bg: 'bg-violet-500/10', text: 'Credits are instantly added to your balance' },
            ].map(({ icon: Icon, color, bg, text }, i) => (
              <div key={i} className='flex items-center gap-3'>
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${bg}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <span className='text-sm text-muted-foreground'>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <Button size='lg' className='w-full' onClick={handleJoin} disabled={isJoining}>
          {isJoining ? <><Loader2 className='mr-2 h-4 w-4 animate-spin' />Joining…</> : <><Gift className='mr-2 h-4 w-4' />Get My Referral Link</>}
        </Button>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-3xl space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>Affiliate Program</h1>
          <p className='text-sm text-muted-foreground'>Earn 1–6 bonus credits for every signup via your link</p>
        </div>
        <Badge className={affiliate?.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'} variant='outline'>
          {affiliate?.status ?? 'active'}
        </Badge>
      </div>

      <div className='grid gap-4 sm:grid-cols-3'>
        <StatCard title='Link Clicks' value={affiliate?.click_count ?? 0} icon={MousePointerClick} iconBg='bg-sky-500/10' iconColor='text-sky-500' />
        <StatCard
          title='Signups'
          value={affiliate?.referred_count ?? 0}
          icon={Users}
          iconBg='bg-violet-500/10'
          iconColor='text-violet-500'
          subtext={affiliate && affiliate.click_count > 0 ? `${Math.round((affiliate.referred_count / affiliate.click_count) * 100)}% conversion` : undefined}
        />
        <StatCard title='Credits Earned' value={affiliate?.credits_earned ?? 0} icon={Coins} iconBg='bg-amber-500/10' iconColor='text-amber-500' subtext='from all referrals' />
      </div>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base'>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex gap-2'>
            <Input value={affiliate?.referral_url ?? ''} readOnly className='flex-1 font-mono text-sm' />
            <Button variant='outline' size='icon' onClick={handleCopy} className='flex-shrink-0'>
              {copied ? <Check className='h-4 w-4 text-emerald-500' /> : <Copy className='h-4 w-4' />}
            </Button>
            <Button variant='outline' size='icon' asChild className='flex-shrink-0'>
              <a href={affiliate?.referral_url} target='_blank' rel='noopener noreferrer'>
                <ExternalLink className='h-4 w-4' />
              </a>
            </Button>
          </div>
          <p className='text-xs text-muted-foreground'>
            Your code: <span className='font-mono font-semibold text-foreground'>{affiliate?.code}</span>
          </p>
        </CardContent>
      </Card>

      <Card className='border-dashed'>
        <CardContent className='p-5'>
          <div className='flex items-start gap-3'>
            <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/10'>
              <Sparkles className='h-4 w-4 text-amber-500' />
            </div>
            <div>
              <p className='text-sm font-medium text-foreground'>Surprise credit rewards</p>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                Each signup via your link awards you a random <span className='font-semibold text-foreground'>1 to 6 credits</span> — automatically added to your balance. No minimum, no payout required, no waiting.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
