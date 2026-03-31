import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { RefreshButton } from '@/components/RefreshButton';

export const metadata: Metadata = {
  title: 'TripCompanion',
  description: 'Your personal trip itinerary',
  manifest: '/manifest.json',
  themeColor: '#FFFBF5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TripCompanion',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <BottomNav />
        <RefreshButton />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
