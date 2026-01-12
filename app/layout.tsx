import type { Metadata } from 'next';
import './globals.css';
import BottomTabBar from '@/components/layout/BottomTabBar';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'GIGFINDER - Your Personal Gig',
  description: 'Match your music taste with local live events',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className="min-h-screen pb-20">
            {children}
          </main>
          <BottomTabBar />
        </Providers>
      </body>
    </html>
  );
}
