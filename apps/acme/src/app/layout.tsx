import type { Metadata } from "next";
import Script from "next/script";
import { refrefConfig } from "@/lib/refref-config";

export const metadata: Metadata = {
  title: "ACME - Test Application",
  description: "Test application for RefRef integration testing and demos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{ margin: 0, padding: 0, fontFamily: "system-ui, sans-serif" }}
      >
        {children}

        {/* RefRef Attribution Script */}
        <Script
          src={refrefConfig.attributionScriptUrl}
          strategy="afterInteractive"
          data-product-id={refrefConfig.productId}
        />
      </body>
    </html>
  );
}
