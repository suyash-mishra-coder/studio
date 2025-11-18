
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import DesktopTip from '@/components/DesktopTip';
import ClientProvider from '@/firebase/client-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Mockview AI',
  description: 'AI-powered real-time tech mock interview platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-body antialiased min-h-screen flex flex-col bg-background', inter.variable)}>
        <ClientProvider>
            {children}
        </ClientProvider>
        <Toaster />
        <DesktopTip />
      </body>
    </html>
  );
}
