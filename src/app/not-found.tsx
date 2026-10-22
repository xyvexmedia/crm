'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname; // e.g. /crm/clients/c_123 or /clients/c_123

      // Check if it's a dynamic clients route: /clients/:id (and not detail/new/edit)
      const clientMatch = pathname.match(/\/clients\/([a-zA-Z0-9_.-]+)(?:\/)?$/);
      if (
        clientMatch &&
        clientMatch[1] !== 'detail' &&
        clientMatch[1] !== 'new' &&
        clientMatch[1] !== 'edit'
      ) {
        setRedirecting(true);
        router.replace(`/clients/detail?id=${encodeURIComponent(clientMatch[1])}`);
        return;
      }

      // Check if it's a dynamic projects route: /projects/:id
      const projectMatch = pathname.match(/\/projects\/([a-zA-Z0-9_.-]+)(?:\/)?$/);
      if (
        projectMatch &&
        projectMatch[1] !== 'detail' &&
        projectMatch[1] !== 'new'
      ) {
        setRedirecting(true);
        router.replace(`/projects/detail?id=${encodeURIComponent(projectMatch[1])}`);
        return;
      }

      // Check if it's a dynamic invoices route: /invoices/:id
      const invoiceMatch = pathname.match(/\/invoices\/([a-zA-Z0-9_.-]+)(?:\/)?$/);
      if (
        invoiceMatch &&
        invoiceMatch[1] !== 'detail' &&
        invoiceMatch[1] !== 'new'
      ) {
        setRedirecting(true);
        router.replace(`/invoices/detail?id=${encodeURIComponent(invoiceMatch[1])}`);
        return;
      }
    }
  }, [router]);

  if (redirecting) {
    return (
      <div className="min-h-screen bg-[#0a0a0d] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-white">Opening page...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0d] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 mb-4">
        <RefreshCw className="w-7 h-7 text-rose-500" />
      </div>
      <h1 className="text-xl font-bold text-white mb-2">Page Not Found</h1>
      <p className="text-xs text-zinc-400 max-w-sm mb-6">
        The page you are looking for might have been moved or does not exist.
      </p>
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#991b1b] via-[#881337] to-[#e11d48] text-white text-xs font-semibold shadow-lg active:scale-95 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Clients</span>
      </Link>
    </div>
  );
}
