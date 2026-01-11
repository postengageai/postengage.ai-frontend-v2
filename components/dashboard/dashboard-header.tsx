'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Instagram,
  ChevronDown,
  Zap,
  Settings,
  LogOut,
  User,
  CreditCard,
} from 'lucide-react';
import type { User as UserType, ConnectedAccount } from '@/lib/types/dashboard';

interface DashboardHeaderProps {
  user: UserType;
  connectedAccount: ConnectedAccount | null;
  credits: {
    remaining: number;
    total: number;
    estimatedReplies: number;
  };
}

export function DashboardHeader({
  user,
  connectedAccount,
  credits,
}: DashboardHeaderProps) {
  const creditPercentage = (credits.remaining / credits.total) * 100;
  const isLowCredits = creditPercentage < 25;

  return (
    <header className='sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6'>
        {/* Logo */}
        <Link href='/dashboard' className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary'>
            <Zap className='h-4 w-4 text-primary-foreground' />
          </div>
          <span className='text-lg font-semibold'>PostEngageAI</span>
        </Link>

        {/* Right side */}
        <div className='flex items-center gap-3'>
          {/* Connected Account */}
          {connectedAccount ? (
            <div className='hidden sm:flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5'>
              <Instagram className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium'>
                @{connectedAccount.username}
              </span>
              <span
                className='h-2 w-2 rounded-full bg-success'
                title='Connected'
              />
            </div>
          ) : (
            <Button
              variant='outline'
              size='sm'
              className='hidden sm:flex gap-2 bg-transparent'
              asChild
            >
              <Link href='/dashboard/connect'>
                <Instagram className='h-4 w-4' />
                Connect Instagram
              </Link>
            </Button>
          )}

          {/* Credits Display */}
          <div className='flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5'>
            <Zap
              className={`h-4 w-4 ${isLowCredits ? 'text-warning' : 'text-primary'}`}
            />
            <span className='text-sm font-medium font-mono'>
              {credits.remaining}
            </span>
            <span className='text-xs text-muted-foreground hidden sm:inline'>
              credits
            </span>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='gap-2 pl-2'>
                <div className='flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary'>
                  <User className='h-4 w-4' />
                </div>
                <ChevronDown className='h-3 w-3 text-muted-foreground' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              <div className='px-2 py-1.5'>
                <p className='text-sm font-medium'>{user.name}</p>
                <p className='text-xs text-muted-foreground'>{user.email}</p>
                <Badge variant='secondary' className='mt-1.5 capitalize'>
                  {user.plan} plan
                </Badge>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href='/dashboard/settings'
                  className='flex items-center gap-2'
                >
                  <Settings className='h-4 w-4' />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href='/dashboard/credits/buy'
                  className='flex items-center gap-2'
                >
                  <CreditCard className='h-4 w-4' />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-destructive focus:text-destructive'>
                <LogOut className='h-4 w-4 mr-2' />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
