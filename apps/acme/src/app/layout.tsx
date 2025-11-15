import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ACME - Test Application',
  description: 'Test application for RefRef integration testing and demos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
