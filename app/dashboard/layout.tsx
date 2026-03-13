import type React from 'react';
import type { Metadata } from 'next';
import { AppSidebar } from '@/components/app/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { LowCreditBanner } from '@/components/app/low-credit-banner';
import { MobileHeader } from '@/components/app/mobile-header';

export const metadata: Metadata = {
  title: 'Dashboard | PostEngageAI',
  description: 'Manage your Instagram automations and engagement',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className='min-w-0 overflow-hidden'>
        {/* Mobile-only top bar with hamburger + logo */}
        <MobileHeader />
        <LowCreditBanner />
        <main className='flex-1 min-w-0 overflow-x-hidden'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
