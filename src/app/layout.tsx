import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { IS_DEMO } from '@/lib/demo/config';
import { DemoBanner } from '@/components/layout/demo-banner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'CityFix AI — Report once. Route smart. Fix faster.',
    template: '%s | CityFix AI',
  },
  description:
    'AI-powered civic issue reporting and prioritization. Help your city identify and fix public safety problems faster and more equitably.',
  keywords: ['civic tech', 'city reporting', 'AI', 'smart city', 'infrastructure', 'potholes'],
  openGraph: {
    title: 'CityFix AI',
    description: 'AI-powered civic issue reporting and prioritization.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      // Height of <DemoBanner /> (h-10); the admin shell subtracts it.
      style={IS_DEMO ? ({ '--demo-banner-h': '2.5rem' } as React.CSSProperties) : undefined}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        {IS_DEMO && <DemoBanner />}
        {children}
        <Toaster
          position="top-right"
          richColors
          expand={false}
          duration={4000}
        />
      </body>
    </html>
  );
}
