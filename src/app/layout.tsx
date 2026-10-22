import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { DataProvider } from '@/context/data-context';
import { InstallPwaPrompt } from '@/components/pwa/InstallPwaPrompt';

export const metadata: Metadata = {
  title: 'XYVEX CRM • Agency Finance & Operations',
  description: 'Production-ready CRM and finance management application for XYVEX digital marketing and creative agency.',
  manifest: process.env.NODE_ENV === 'production' ? '/crm/manifest.json' : '/manifest.json',
  icons: {
    icon: process.env.NODE_ENV === 'production' ? '/crm/icons/icon-192x192.png' : '/icons/icon-192x192.png',
    apple: process.env.NODE_ENV === 'production' ? '/crm/icons/apple-touch-icon.png' : '/icons/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const basePath = process.env.NODE_ENV === 'production' ? '/crm' : '';

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href={`${basePath}/manifest.json`} />
        <link rel="apple-touch-icon" href={`${basePath}/icons/apple-touch-icon.png`} />
        <meta name="theme-color" content="#08080a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="XYVEX CRM" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  var swUrl = '${basePath}/sw.js';
                  navigator.serviceWorker.register(swUrl).catch(function(err) {
                    console.warn('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-white/20 selection:text-white">
        <AuthProvider>
          <DataProvider>
            {children}
            <InstallPwaPrompt />
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
