import type React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://postengage.ai'),
  title: {
    template: '%s | PostEngage.ai',
    default:
      'PostEngage.ai - Stop Ignoring Your Comments | Instagram Automation',
  },
  description:
    'Stop ignoring comments. PostEngage.ai automates DMs & comments in your unique voice, schedules content, and tracks analytics. The all-in-one growth engine for creators.',
  keywords: [
    'Instagram Automation',
    'ManyChat Alternative',
    'Auto DM Tool',
    'Instagram Bot',
    'Sales Automation',
    'Instagram Marketing',
    'AI Comment Reply',
    'Social Media Automation',
    'Visual Flow Builder',
    'Instagram Post Scheduler',
    'Social Media Analytics',
    'Lead Generation Tool',
    'Comment Guard',
    'Pay-as-you-go Automation',
    'AI Voice Adaptation',
  ],
  openGraph: {
    title: 'PostEngage.ai - Stop Ignoring Comments. Start Growing.',
    description:
      'The all-in-one platform to automate DMs in your voice, schedule posts, and capture leads. Join 2,400+ creators saving 47 hours/month.',
    url: 'https://postengage.ai',
    siteName: 'PostEngage.ai',
    type: 'website',
    images: [
      {
        url: '/logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'PostEngage.ai Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@postengage_ai',
    creator: '@postengage_ai',
    title: 'PostEngage.ai - AI Automation, Scheduling & Analytics',
    description:
      'Stop ignoring comments. Automate DMs in your voice, schedule posts, and track growth. Join 2,400+ creators saving 47 hours/month.',
  },
  alternates: {
    canonical: 'https://postengage.ai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.jpeg',
    shortcut: '/logo.jpeg',
    apple: '/logo.jpeg',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/logo.jpeg',
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='dark'>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
