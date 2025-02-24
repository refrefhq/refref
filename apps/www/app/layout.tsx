import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import PlausibleProvider from 'next-plausible';
import { GoogleTagManager } from '@next/third-parties/google'

const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <PlausibleProvider
          domain="refref.ai"
          trackOutboundLinks={true}
          trackFileDownloads={true}
          taggedEvents={true}
          hash={true}
        />
        <GoogleTagManager gtmId="GTM-MZXNF5TX" />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
