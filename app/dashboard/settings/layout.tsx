import type React from 'react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8'>
      <div className='mb-6 sm:mb-8'>
        <h1 className='text-xl font-semibold text-foreground sm:text-2xl'>
          Settings
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Manage your account settings and preferences
        </p>
      </div>
      <div className='min-w-0'>{children}</div>
    </div>
  );
}
