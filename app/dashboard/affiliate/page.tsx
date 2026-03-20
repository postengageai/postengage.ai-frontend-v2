'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Share2,
  TrendingUp,
  ArrowUpRight,
  Link2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AffiliateApi, type Affiliate } from '@/lib/api/affiliate';
import { parseApiError } from '@/lib/http/errors';
import { ErrorCodes } from '@/lib/error-codes';

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
  sub?: string;
  trend?: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
  trend,
}: StatCardProps) {
  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-0'>
        <div className={`h-1 w-full ${accent}`} />
        <div className='p-5'>
          <div className='flex items-start justify-between mb-3'>
            <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
              {label}
            </span>
            <div
              className={`rounded-lg p-1.5 ${accent.replace('bg-', 'bg-').replace('-500', '-500/10')}`}
            >
              <Icon
                className={`h-3.5 w-3.5 ${accent.replace('bg-', 'text-')}`}
              />
            </div>
          </div>
          <p className='text-3xl font-bold tabular-nums'>{value}</p>
          {(sub || trend) && (
            <div className='flex items-center gap-1.5 mt-1'>
              {trend && (
                <span className='flex items-center gap-0.5 text-xs text-emerald-500 font-medium'>
                  <ArrowUpRight className='h-3 w-3' />
                  {trend}
                </span>
              )}
              {sub && (
                <span className='text-xs text-muted-foreground'>{sub}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Share button ─────────────────────────────────────────────────────────────

function ShareButton({
  label,
  icon: Icon,
  onClick,
  className = '',
}: {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 rounded-xl border bg-card p-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ${className}`}
    >
      <Icon className='h-4 w-4' />
      {label}
    </button>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className='mx-auto max-w-2xl space-y-6 p-6'>
      <div className='space-y-2'>
        <Skeleton className='h-7 w-48' />
        <Skeleton className='h-4 w-72' />
      </div>
      <div className='grid gap-4 grid-cols-3'>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className='p-5 space-y-2'>
              <Skeleton className='h-3 w-20' />
              <Skeleton className='h-8 w-14' />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className='p-5 space-y-3'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-3 w-40' />
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Join state ───────────────────────────────────────────────────────────────

function JoinState({
  onJoin,
  isJoining,
}: {
  onJoin: () => void;
  isJoining: boolean;
}) {
  const steps = [
    {
      icon: Link2,
      color: 'text-primary',
      bg: 'bg-primary/10',
      text: 'Get your unique affiliate link instantly',
    },
    {
      icon: Share2,
      color: 'text-sky-500',
      bg: 'bg-sky-500/10',
      text: 'Share with your audience, network or friends',
    },
    {
      icon: Sparkles,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      text: 'Earn 1–6 bonus credits for every signup',
    },
    {
      icon: Zap,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      text: 'Credits hit your balance instantly — no waiting',
    },
  ];

  return (
    <div className='mx-auto flex max-w-md flex-col items-center gap-8 p-6 pt-12 text-center'>
      {/* Icon */}
      <div className='relative'>
        <div className='flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 ring-8 ring-primary/5'>
          <Gift className='h-10 w-10 text-primary' />
        </div>
        <div className='absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white'>
          ✓
        </div>
      </div>

      {/* Headline */}
      <div>
        <h1 className='text-2xl font-bold'>Earn Credits by Referring</h1>
        <p className='mt-2 text-sm text-muted-foreground leading-relaxed'>
          Every time someone signs up using your link, you get{' '}
          <span className='font-semibold text-foreground'>
            1–6 bonus credits
          </span>{' '}
          added to your balance — automatically, for free.
        </p>
      </div>

      {/* Steps */}
      <div className='w-full rounded-2xl border bg-card p-5 text-left space-y-3'>
        {steps.map(({ icon: Icon, color, bg, text }, i) => (
          <div key={i} className='flex items-center gap-3'>
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}
            >
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <span className='text-sm text-muted-foreground'>{text}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Button
        size='lg'
        className='w-full h-12 text-base'
        onClick={onJoin}
        disabled={isJoining}
      >
        {isJoining ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Setting up your link…
          </>
        ) : (
          <>
            <Gift className='mr-2 h-5 w-5' />
            Get My Affiliate Link
          </>
        )}
      </Button>

      <p className='text-xs text-muted-foreground'>
        Free to join. No minimum. Credits never expire.
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

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
      setAffiliate(res.data!.data);
    } catch (err) {
      const error = parseApiError(err);
      if (error?.code === ErrorCodes.AFFILIATE.NOT_FOUND) {
        setNotJoined(true);
      } else {
        toast({
          title: 'Failed to load affiliate data',
          description: error?.message ?? 'Please try again later.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchAffiliate();
  }, [fetchAffiliate]);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const res = await AffiliateApi.join({});
      setAffiliate(res.data!.data);
      setNotJoined(false);
      toast({ title: '🎉 Welcome! Your affiliate link is ready.' });
    } catch (err) {
      const error = parseApiError(err);
      toast({
        title: 'Could not join',
        description: error?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopy = () => {
    if (!affiliate?.referral_url) return;
    void navigator.clipboard.writeText(affiliate.referral_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Affiliate link copied!' });
  };

  const handleShareTwitter = () => {
    if (!affiliate?.referral_url) return;
    const text = `I've been using PostEngage AI to automate my Instagram. Sign up with my link and get started free 👇`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(affiliate.referral_url)}`,
      '_blank'
    );
  };

  const handleShareWhatsApp = () => {
    if (!affiliate?.referral_url) return;
    const text = `Check out PostEngage AI — it automates Instagram replies & DMs. Use my link: ${affiliate.referral_url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const conversionRate =
    affiliate && affiliate.click_count > 0
      ? Math.round((affiliate.referred_count / affiliate.click_count) * 100)
      : 0;

  if (isLoading) return <LoadingSkeleton />;
  if (notJoined) return <JoinState onJoin={handleJoin} isJoining={isJoining} />;

  return (
    <div className='mx-auto max-w-2xl space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Affiliate Program</h1>
          <p className='text-sm text-muted-foreground mt-0.5'>
            Share your link, earn credits for every signup
          </p>
        </div>
        <Badge
          variant='outline'
          className={
            affiliate?.status === 'active'
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 capitalize'
              : 'bg-amber-500/10 text-amber-600 border-amber-500/20 capitalize'
          }
        >
          {affiliate?.status ?? 'active'}
        </Badge>
      </div>

      {/* Stats */}
      <div className='grid gap-4 grid-cols-3'>
        <StatCard
          label='Link Clicks'
          value={affiliate?.click_count ?? 0}
          icon={MousePointerClick}
          accent='bg-sky-500'
        />
        <StatCard
          label='Signups'
          value={affiliate?.referred_count ?? 0}
          icon={Users}
          accent='bg-violet-500'
          sub={conversionRate > 0 ? `${conversionRate}% conversion` : undefined}
          trend={
            affiliate && affiliate.referred_count > 0 ? 'Active' : undefined
          }
        />
        <StatCard
          label='Credits Earned'
          value={affiliate?.credits_earned ?? 0}
          icon={Coins}
          accent='bg-amber-500'
          sub='total earned'
        />
      </div>

      {/* Affiliate Link card */}
      <Card>
        <CardContent className='p-5 space-y-4'>
          <div className='flex items-center gap-2'>
            <Link2 className='h-4 w-4 text-primary' />
            <span className='text-sm font-semibold'>Your Affiliate Link</span>
          </div>

          {/* URL row */}
          <div className='flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2.5'>
            <span className='flex-1 text-sm font-mono text-muted-foreground truncate'>
              {affiliate?.referral_url}
            </span>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 shrink-0'
              onClick={handleCopy}
            >
              {copied ? (
                <Check className='h-3.5 w-3.5 text-emerald-500' />
              ) : (
                <Copy className='h-3.5 w-3.5' />
              )}
            </Button>
            <a
              href={affiliate?.referral_url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors'
            >
              <ExternalLink className='h-3.5 w-3.5' />
            </a>
          </div>

          {/* Code pill */}
          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground'>Your code:</span>
            <span className='rounded-md border bg-muted px-2 py-0.5 font-mono text-xs font-semibold'>
              {affiliate?.code}
            </span>
          </div>

          {/* Copy CTA */}
          <Button
            className='w-full'
            onClick={handleCopy}
            variant={copied ? 'outline' : 'default'}
          >
            {copied ? (
              <>
                <Check className='mr-2 h-4 w-4 text-emerald-500' />
                Copied!
              </>
            ) : (
              <>
                <Copy className='mr-2 h-4 w-4' />
                Copy Affiliate Link
              </>
            )}
          </Button>

          {/* Share row */}
          <div className='grid grid-cols-3 gap-2 pt-1'>
            <ShareButton label='Copy Link' icon={Copy} onClick={handleCopy} />
            <ShareButton
              label='Share on X'
              icon={Share2}
              onClick={handleShareTwitter}
            />
            <ShareButton
              label='WhatsApp'
              icon={Share2}
              onClick={handleShareWhatsApp}
            />
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card className='border-dashed'>
        <CardContent className='p-5'>
          <div className='flex items-center gap-2 mb-4'>
            <TrendingUp className='h-4 w-4 text-primary' />
            <span className='text-sm font-semibold'>How rewards work</span>
          </div>
          <div className='grid gap-3 sm:grid-cols-3 text-center'>
            {[
              {
                step: '1',
                label: 'Someone clicks\nyour link',
                color: 'text-sky-500',
                bg: 'bg-sky-500/10',
              },
              {
                step: '2',
                label: 'They sign up\nfor PostEngage',
                color: 'text-violet-500',
                bg: 'bg-violet-500/10',
              },
              {
                step: '3',
                label: '1–6 credits land\nin your balance',
                color: 'text-amber-500',
                bg: 'bg-amber-500/10',
              },
            ].map(({ step, label, color, bg }) => (
              <div key={step} className='flex flex-col items-center gap-2'>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${bg} ${color}`}
                >
                  {step}
                </div>
                <p className='text-xs text-muted-foreground whitespace-pre-line leading-relaxed'>
                  {label}
                </p>
              </div>
            ))}
          </div>
          <p className='mt-4 text-xs text-muted-foreground text-center border-t pt-4'>
            Credits are random (1–6) per signup and are added instantly. No
            minimum payout. No expiry.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
