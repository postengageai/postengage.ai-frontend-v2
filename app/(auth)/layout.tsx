import type React from 'react';

/**
 * Auth layout — minimal shell.
 * Each auth page owns its own visual layout (split or centered).
 * This wrapper just ensures the background fills the screen.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className='min-h-screen bg-background'>{children}</div>;
}
