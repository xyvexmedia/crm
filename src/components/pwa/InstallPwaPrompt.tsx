'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle2 } from 'lucide-react';

export const InstallPwaPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If prompt not available (e.g. iOS or manual)
      alert(
        'To install this app in Chrome:\n\n1. Click Chrome menu (⋮) on top-right.\n2. Tap "Install XYVEX MEDIA CRM" or "Add to Home screen".'
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || dismissed) return null;

  return (
    <aside
      aria-label="Install XYVEX CRM App"
      className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 max-w-sm animate-fade"
    >
      <div className="bg-[#141419]/95 backdrop-blur-xl border border-[#a3e635]/40 rounded-2xl p-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.7)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#a3e635]/15 border border-[#a3e635]/30 flex items-center justify-center text-[#a3e635] shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white tracking-tight truncate">
              Install XYVEX App
            </h4>
            <p className="text-[10px] text-zinc-400 truncate">
              Add to home screen for 1-tap Chrome access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-full bg-[#a3e635] text-black text-xs font-bold shadow-md hover:bg-[#bef264] active:scale-95 transition flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Install</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
