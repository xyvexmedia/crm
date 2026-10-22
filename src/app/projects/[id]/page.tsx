import { Suspense } from 'react';
import ProjectDetailPage from './ProjectDetailClient';

export function generateStaticParams() {
  return [
    { id: 'p1' },
    { id: 'p2' },
    { id: 'p3' },
    { id: 'p4' },
  ];
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0d] flex flex-col items-center justify-center p-4">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-zinc-400">Loading project details...</p>
        </div>
      }
    >
      <ProjectDetailPage />
    </Suspense>
  );
}
