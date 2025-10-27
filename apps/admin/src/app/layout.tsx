import "@refref/ui/globals.css";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { TRPCReactProvider } from "@/trpc/react";
import { AuthUIProvider } from "@/components/providers/auth-ui-provider";

export const metadata: Metadata = {
  title: "RefRef - Referral Management Platform",
  description: "Manage your referral programs with ease",
  icons: [
    { rel: "icon", url: "/logo.svg", type: "image/svg+xml" },
    { rel: "apple-touch-icon", url: "/logo.svg" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script
          suppressHydrationWarning
          type="module"
          src="/api/scripts/attribution.js"
          strategy="beforeInteractive"
        />
        <Script
          id="refref-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.RefRef = window.RefRef || [];
            `,
          }}
        />
        <Script
          suppressHydrationWarning
          type="module"
          src="/api/scripts/widget.js"
          strategy="afterInteractive"
          defer
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <AuthUIProvider>
              <NuqsAdapter>{children}</NuqsAdapter>
            </AuthUIProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
