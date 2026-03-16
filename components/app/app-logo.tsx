'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type LogoVariant = 'wordmark' | 'mark';
type LogoColorScheme = 'dark' | 'light' | 'auto';

interface AppLogoProps {
  /** 'wordmark' = full "PostEngage.AI" text logo; 'mark' = icon only */
  variant?: LogoVariant;
  /**
   * 'dark'  = white logo (use on dark backgrounds)
   * 'light' = dark-navy logo (use on light backgrounds)
   * 'auto'  = follows the active theme (default)
   */
  colorScheme?: LogoColorScheme;
  /** Rendered height in px — width is inferred from the natural aspect ratio */
  height?: number;
  /** Wrap in a <Link href="…"> — pass false to skip the link wrapper */
  href?: string | false;
  className?: string;
  priority?: boolean;
}

/**
 * Central logo component for PostEngage.AI.
 *
 * Uses the real PNG assets from /public:
 *   wordmark dark  → /logo-transparent-dark.png   (839 × 130, white text)
 *   wordmark light → /logo-transparent-light.png  (839 × 130, navy text)
 *   mark dark      → /logo-mark-dark.png          (512 × 512, white)
 *   mark light     → /logo-mark-light.png         (512 × 512, colour)
 */
export function AppLogo({
  variant = 'wordmark',
  colorScheme = 'auto',
  height = 32,
  href = '/',
  className,
  priority = false,
}: AppLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which colour scheme to actually use
  const scheme: 'dark' | 'light' =
    colorScheme === 'auto'
      ? mounted
        ? resolvedTheme === 'dark'
          ? 'dark'
          : 'light'
        : 'light' // SSR safe fallback
      : colorScheme;

  // Pick the right src + natural dimensions
  const isWordmark = variant === 'wordmark';
  const src = isWordmark
    ? scheme === 'dark'
      ? '/logo-transparent-dark.png'
      : '/logo-transparent-light.png'
    : scheme === 'dark'
      ? '/logo-mark-dark.png'
      : '/logo-mark-light.png';

  const naturalW = isWordmark ? 839 : 512;
  const naturalH = isWordmark ? 130 : 512;
  const width = Math.round((height * naturalW) / naturalH);

  const img = (
    <Image
      src={src}
      alt='PostEngage.AI'
      width={width}
      height={height}
      priority={priority}
      className={cn('object-contain', className)}
      style={{ height, width }}
    />
  );

  if (href === false) return img;

  return (
    <Link href={href} className='flex items-center w-fit shrink-0'>
      {img}
    </Link>
  );
}
