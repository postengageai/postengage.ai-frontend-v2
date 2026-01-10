import type React from 'react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='mx-auto max-w-4xl'>
      <div className='mb-8'>
        <h1 className='text-2xl font-semibold text-foreground'>Settings</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Manage your account settings and preferences
        </p>
      </div>
      <div className='min-w-0'>{children}</div>
    </div>
  );
}
