import { Suspense } from 'react';
import ClientDetailPage from './ClientDetailClient';

export function generateStaticParams() {
  return [
    { id: 'c1' },
    { id: 'c2' },
    { id: 'c3' },
    { id: 'c4' },
  ];
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0d] flex flex-col items-center justify-center p-4">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-zinc-400">Loading client profile...</p>
        </div>
      }
    >
      <ClientDetailPage />
    </Suspense>
  );
}
