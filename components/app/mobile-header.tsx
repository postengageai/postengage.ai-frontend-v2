'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

/**
 * Sticky mobile-only top bar that shows the app logo + hamburger trigger.
 * Visible only on screens smaller than md (tablet/phone).
 * Hidden on md+ where the persistent sidebar takes over.
 */
export function MobileHeader() {
  return (
    <header className='sticky top-0 z-40 flex h-12 items-center gap-3 border-b border-border/50 bg-background/95 px-3 backdrop-blur-sm md:hidden'>
      <SidebarTrigger className='h-8 w-8 text-muted-foreground hover:text-foreground' />
      <Link href='/dashboard' className='flex items-center gap-2'>
        <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-sm shadow-primary/20'>
          <Sparkles className='h-4 w-4 text-primary-foreground' />
        </div>
        <span className='text-sm font-semibold tracking-tight'>
          PostEngageAI
        </span>
      </Link>
    </header>
  );
}
