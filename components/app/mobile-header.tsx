'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { AppLogo } from '@/components/app/app-logo';

/**
 * Sticky mobile-only top bar that shows the app logo + hamburger trigger.
 * Visible only on screens smaller than md (tablet/phone).
 * Hidden on md+ where the persistent sidebar takes over.
 */
export function MobileHeader() {
  return (
    <header className='sticky top-0 z-40 flex h-12 items-center gap-3 border-b border-border/50 bg-background/95 px-3 backdrop-blur-sm md:hidden'>
      <SidebarTrigger className='h-8 w-8 text-muted-foreground hover:text-foreground' />
      <AppLogo
        variant='wordmark'
        colorScheme='auto'
        height={24}
        href='/dashboard'
      />
    </header>
  );
}
