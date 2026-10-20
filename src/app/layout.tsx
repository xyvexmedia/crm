import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { DataProvider } from '@/context/data-context';

export const metadata: Metadata = {
  title: 'XYVEX CRM • Agency Finance & Operations',
  description: 'Production-ready CRM and finance management application for XYVEX digital marketing and creative agency.',
  icons: {
    icon: '/xyvex-logo.jpeg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-white/20 selection:text-white">
        <AuthProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
