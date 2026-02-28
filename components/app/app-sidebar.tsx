'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Bot,
  LogOut,
  User,
  Shield,
  Share2,
  SlidersHorizontal,
  ChevronDown,
  CreditCard,
  HelpCircle,
  ChevronUp,
  Dna,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useUser, useUserActions } from '@/lib/user/store';
import { CreditsApi } from '@/lib/api/credits';
import { AuthApi } from '@/lib/api/auth';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  {
    title: 'Media',
    href: '/dashboard/media',
    icon: Sparkles,
  },
];

const intelligenceSubItems = [
  {
    title: 'Bots',
    href: '/dashboard/intelligence/bots',
    icon: Bot,
  },
  {
    title: 'Brand Voices',
    href: '/dashboard/intelligence/brand-voices',
    icon: SlidersHorizontal,
  },
  {
    title: 'Voice DNA',
    href: '/dashboard/intelligence/voice-dna',
    icon: Dna,
  },
  {
    title: 'AI Settings',
    href: '/dashboard/intelligence/settings',
    icon: Settings,
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

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();
  const { setUser } = useUserActions();
  const [credits, setCredits] = useState({ remaining: 0 });
  const isSettingsActive = pathname.startsWith('/dashboard/settings');
  const isCreditsActive = pathname.startsWith('/dashboard/credits');
  const isIntelligenceActive = pathname.startsWith('/dashboard/intelligence');

  const handleLogout = async () => {
    try {
      await AuthApi.logout();
    } catch (_error) {
      // console.error('Logout failed:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  useEffect(() => {
    async function fetchCredits() {
      try {
        const response = await CreditsApi.getBalance();
        if (response && response.data) {
          setCredits(prev => ({
            ...prev,
            remaining: response.data.available_credits,
          }));
        }
      } catch (_error) {
        // console.error('Failed to fetch credits:', error);
      }
    }
    fetchCredits();
  }, []);

  const isLowCredits = credits.remaining < 50;

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

              {/* Intelligence Section */}
              <Collapsible asChild defaultOpen={isIntelligenceActive}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={isIntelligenceActive}
                      className={cn(
                        'h-10 w-full rounded-lg transition-all duration-200',
                        isIntelligenceActive &&
                          'bg-primary/10 text-primary font-medium shadow-sm'
                      )}
                    >
                      <Bot
                        className={cn(
                          'h-4 w-4',
                          isIntelligenceActive && 'text-primary'
                        )}
                      />
                      <span>Intelligence</span>
                      <ChevronDown
                        className={cn(
                          'ml-auto h-4 w-4 transition-transform duration-200',
                          isIntelligenceActive && 'rotate-180'
                        )}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className='mt-1 ml-4 border-l border-border/50 pl-2'>
                      {intelligenceSubItems.map(subItem => {
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
              {credits.remaining}
            </span>
          </div>
        </Link>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='flex w-full items-center gap-3 rounded-xl bg-secondary/30 border border-border/50 p-3 hover:bg-secondary/50 transition-colors text-left'>
              <Avatar className='h-9 w-9 rounded-lg border border-primary/20'>
                <AvatarImage src={user?.avatar?.url} alt={user?.first_name} />
                <AvatarFallback className='rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary'>
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>
                  {user?.first_name} {user?.last_name}
                </p>
                <p className='text-xs text-muted-foreground truncate'>
                  {user?.email}
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
                {user?.role || 'Free'} plan
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
              <Link href='/dashboard/help' className='flex items-center gap-2'>
                <HelpCircle className='h-4 w-4' />
                Help & Support
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer'
              onClick={handleLogout}
            >
              <LogOut className='h-4 w-4 mr-2' />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
