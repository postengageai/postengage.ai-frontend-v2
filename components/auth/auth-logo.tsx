import { AppLogo } from '@/components/app/app-logo';

/**
 * Logo used at the top of auth pages.
 * size="sm" for centered cards, size="md" for split-layout left panels.
 * Left panels are always dark-bg → force dark scheme there.
 */
export function AuthLogo({
  size = 'md',
  colorScheme,
}: {
  size?: 'sm' | 'md';
  colorScheme?: 'dark' | 'light' | 'auto';
}) {
  const height = size === 'sm' ? 26 : 30;
  return (
    <AppLogo
      variant='wordmark'
      colorScheme={colorScheme ?? 'auto'}
      height={height}
      href='/'
      priority
    />
  );
}
