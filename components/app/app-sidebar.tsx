'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Zap,
  Coins,
  Settings,
  Sparkles,
  LogOut,
  User,
  Shield,
  Share2,
  SlidersHorizontal,
  ChevronDown,
  CreditCard,
  HelpCircle,
  ChevronUp,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Automations',
    href: '/dashboard/automations',
    icon: Zap,
  },
];

const creditsSubItems = [
  {
    title: 'Overview',
    href: '/dashboard/credits/overview',
    icon: LayoutDashboard,
  },
  {
    title: 'Buy Credits',
    href: '/dashboard/credits/buy',
    icon: CreditCard,
  },
];

const settingsSubItems = [
  { title: 'Profile', href: '/dashboard/settings', icon: User },
  { title: 'Security', href: '/dashboard/settings/security', icon: Shield },
  {
    title: 'Social Accounts',
    href: '/dashboard/settings/social-accounts',
    icon: Share2,
  },
  {
    title: 'Preferences',
    href: '/dashboard/settings/preferences',
    icon: SlidersHorizontal,
  },
];

// Mock data - in production this would come from context/props
const mockUser = {
  name: 'Alex',
  email: 'alex@example.com',
  plan: 'pro' as const,
};

// const mockConnectedAccount = {
//   username: 'alexcreates',
//   isConnected: true,
// };

const mockCredits = {
  remaining: 127,
  total: 500,
};

export function AppSidebar() {
  const pathname = usePathname();
  const isSettingsActive = pathname.startsWith('/dashboard/settings');
  const isCreditsActive = pathname.startsWith('/dashboard/credits');

  const creditPercentage = (mockCredits.remaining / mockCredits.total) * 100;
  const isLowCredits = creditPercentage < 25;

  return (
    <Sidebar className='border-r border-border/50'>
      {/* Header with Logo */}
      <SidebarHeader className='p-5 pb-4'>
        <Link href='/dashboard' className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20'>
            <Sparkles className='h-5 w-5 text-primary-foreground' />
          </div>
          <span className='text-lg font-semibold tracking-tight'>
            PostEngageAI
          </span>
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className='px-2'>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' &&
                    pathname.startsWith(`${item.href}/`));
                const isExactDashboard =
                  item.href === '/dashboard' && pathname === '/dashboard';
                const finalActive =
                  item.href === '/dashboard' ? isExactDashboard : isActive;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={finalActive}
                      className={cn(
                        'h-10 rounded-lg transition-all duration-200',
                        finalActive &&
                          'bg-primary/10 text-primary font-medium shadow-sm'
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon
                          className={cn(
                            'h-4 w-4',
                            finalActive && 'text-primary'
                          )}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              {/* Credits Section */}
              <Collapsible asChild defaultOpen={isCreditsActive}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={isCreditsActive}
                      className={cn(
                        'h-10 w-full rounded-lg transition-all duration-200',
                        isCreditsActive &&
                          'bg-primary/10 text-primary font-medium shadow-sm'
                      )}
                    >
                      <Coins
                        className={cn(
                          'h-4 w-4',
                          isCreditsActive && 'text-primary'
                        )}
                      />
                      <span>Credits</span>
                      <ChevronDown
                        className={cn(
                          'ml-auto h-4 w-4 transition-transform duration-200',
                          isCreditsActive && 'rotate-180'
                        )}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className='mt-1 ml-4 border-l border-border/50 pl-2'>
                      {creditsSubItems.map(subItem => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <SidebarMenuSubItem key={subItem.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isSubActive}
                              className={cn(
                                'h-9 rounded-md transition-all duration-200',
                                isSubActive &&
                                  'bg-primary/10 text-primary font-medium'
                              )}
                            >
                              <Link href={subItem.href}>
                                <subItem.icon className='h-4 w-4 mr-2' />
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <Collapsible asChild defaultOpen={isSettingsActive}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={isSettingsActive}
                      className={cn(
                        'h-10 w-full rounded-lg transition-all duration-200',
                        isSettingsActive &&
                          'bg-primary/10 text-primary font-medium shadow-sm'
                      )}
                    >
                      <Settings
                        className={cn(
                          'h-4 w-4',
                          isSettingsActive && 'text-primary'
                        )}
                      />
                      <span>Settings</span>
                      <ChevronDown
                        className={cn(
                          'ml-auto h-4 w-4 transition-transform duration-200',
                          isSettingsActive && 'rotate-180'
                        )}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className='mt-1 ml-4 border-l border-border/50 pl-2'>
                      {settingsSubItems.map(subItem => {
                        const isSubActive = pathname === subItem.href;
                        return (
                          <SidebarMenuSubItem key={subItem.href}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isSubActive}
                              className={cn(
                                'h-9 rounded-md transition-all duration-200',
                                isSubActive &&
                                  'bg-primary/10 text-primary font-medium'
                              )}
                            >
                              <Link href={subItem.href}>
                                <subItem.icon className='h-3.5 w-3.5' />
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Credits & User */}
      <SidebarFooter className='p-4 space-y-3'>
        {/* Credits Card */}
        <Link
          href='/dashboard/credits'
          className='block rounded-xl bg-secondary/50 border border-border/50 p-3 hover:bg-secondary/70 transition-colors'
        >
          <div className='flex items-center justify-between mb-2'>
            <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
              Credits
            </span>
            <Zap
              className={cn(
                'h-4 w-4',
                isLowCredits ? 'text-warning' : 'text-primary'
              )}
            />
          </div>
          <div className='flex items-baseline gap-1'>
            <span className='text-2xl font-bold font-mono'>
              {mockCredits.remaining}
            </span>
            <span className='text-xs text-muted-foreground'>
              / {mockCredits.total}
            </span>
          </div>
          <div className='mt-2 h-1.5 rounded-full bg-border overflow-hidden'>
            <div
              className={cn(
                'h-full rounded-full transition-all',
                isLowCredits ? 'bg-warning' : 'bg-primary'
              )}
              style={{ width: `${creditPercentage}%` }}
            />
          </div>
        </Link>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='flex w-full items-center gap-3 rounded-xl bg-secondary/30 border border-border/50 p-3 hover:bg-secondary/50 transition-colors text-left'>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20'>
                <User className='h-4 w-4 text-primary' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>{mockUser.name}</p>
                <p className='text-xs text-muted-foreground truncate'>
                  {mockUser.email}
                </p>
              </div>
              <ChevronUp className='h-4 w-4 text-muted-foreground shrink-0' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side='top'
            align='start'
            className='w-(--radix-dropdown-menu-trigger-width) mb-2'
          >
            <div className='px-2 py-1.5'>
              <Badge variant='secondary' className='capitalize text-xs'>
                {mockUser.plan} plan
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
                href='/dashboard/credits'
                className='flex items-center gap-2'
              >
                <CreditCard className='h-4 w-4' />
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href='/help' className='flex items-center gap-2'>
                <HelpCircle className='h-4 w-4' />
                Help & Support
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-destructive focus:text-destructive focus:bg-destructive/10'>
              <LogOut className='h-4 w-4 mr-2' />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
