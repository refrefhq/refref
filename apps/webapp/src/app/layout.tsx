import "@/styles/app.css";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { Stack_Sans_Notch } from "next/font/google";
import { type Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { TRPCReactProvider } from "@/trpc/react";
import { AuthUIProvider } from "@/components/providers/auth-ui-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { env } from "@/env";

const stackSansNotch = Stack_Sans_Notch({
  weight: "300",
  subsets: ["latin"],
  variable: "--font-stack-sans-notch",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "RefRef - Referral Management Platform",
  description: "RefRef is an open source referral marketing platform that helps you launch and manage powerful referral programs in minutes. Drive customer acquisition through word-of-mouth marketing with customizable rewards, analytics, and seamless integration.",
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
      className={`${GeistSans.variable} ${stackSansNotch.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script
          suppressHydrationWarning
          src={`${env.NEXT_PUBLIC_ASSETS_URL}/attribution.v1.js`}
          strategy="afterInteractive"
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
          src={`${env.NEXT_PUBLIC_ASSETS_URL}/widget.v1.js`}
          strategy="afterInteractive"
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
              <PostHogProvider>
                <NuqsAdapter>{children}</NuqsAdapter>
              </PostHogProvider>
            </AuthUIProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
