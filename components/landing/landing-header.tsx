'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Zap, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className='fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl'>
      <div className='mx-auto max-w-6xl px-4 sm:px-6'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary'>
              <Zap className='h-4 w-4 text-primary-foreground' />
            </div>
            <span className='text-lg font-semibold tracking-tight'>
              PostEngageAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden items-center gap-8 md:flex'>
            <Link
              href='/product'
              className='text-sm text-muted-foreground transition-colors hover:text-foreground'
            >
              Product
            </Link>
            <Link
              href='/features'
              className='text-sm text-muted-foreground transition-colors hover:text-foreground'
            >
              Features
            </Link>
            <Link
              href='/pricing'
              className='text-sm text-muted-foreground transition-colors hover:text-foreground'
            >
              Pricing
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className='flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground'>
                Company <ChevronDown className='h-3 w-3' />
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='w-40'>
                <DropdownMenuItem asChild>
                  <Link href='/about'>About</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/roadmap'>Roadmap</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/changelog'>Changelog</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href='/security'>Security</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Desktop CTA */}
          <div className='hidden items-center gap-3 md:flex'>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/login'>Sign In</Link>
            </Button>
            <Button size='sm' asChild>
              <Link href='/signup'>Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className='md:hidden'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label='Toggle menu'
          >
            {mobileMenuOpen ? (
              <X className='h-6 w-6' />
            ) : (
              <Menu className='h-6 w-6' />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className='border-t border-border py-4 md:hidden'>
            <nav className='flex flex-col gap-4'>
              <Link href='/product' className='text-sm text-muted-foreground'>
                Product
              </Link>
              <Link href='/features' className='text-sm text-muted-foreground'>
                Features
              </Link>
              <Link href='/pricing' className='text-sm text-muted-foreground'>
                Pricing
              </Link>
              <Link href='/about' className='text-sm text-muted-foreground'>
                About
              </Link>
              <Link href='/roadmap' className='text-sm text-muted-foreground'>
                Roadmap
              </Link>
              <Link href='/changelog' className='text-sm text-muted-foreground'>
                Changelog
              </Link>
              <Link href='/security' className='text-sm text-muted-foreground'>
                Security
              </Link>
              <div className='flex flex-col gap-2 pt-4'>
                <Button variant='ghost' size='sm' asChild>
                  <Link href='/login'>Sign In</Link>
                </Button>
                <Button size='sm' asChild>
                  <Link href='/signup'>Get Started</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
