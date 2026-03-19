import type React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Providers } from '@/components/providers';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { GoogleTagManager } from '@/components/analytics/google-tag-manager';
import { MicrosoftClarity } from '@/components/analytics/microsoft-clarity';
import { MetaPixel } from '@/components/analytics/meta-pixel';
import './globals.css';
import './tour.css';

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
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'PostEngage.ai — AI Instagram Automation & DM Replies',
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
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon-32x32.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [{ rel: 'manifest', url: '/site.webmanifest' }],
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
        <GoogleTagManager />
        <MetaPixel />
        <Providers>{children}</Providers>
        <Analytics />
        <GoogleAnalytics />
        <MicrosoftClarity />
      </body>
    </html>
  );
}
