import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unified Inbox | PostEngageAI',
  description: 'Manage all your customer conversations in one place',
};

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className='h-full flex flex-col'>{children}</div>;
}
