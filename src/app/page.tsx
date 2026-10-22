'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-white font-sans">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full bg-[#5c081e] border border-[#be123c]/40 text-white flex items-center justify-center font-black text-xl animate-pulse">
          ✱
        </div>
        <p className="text-xs text-zinc-400 tracking-wide font-medium">Loading XYVEX CRM...</p>
      </div>
    </div>
  );
}
