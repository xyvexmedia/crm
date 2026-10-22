'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  TrendingUp,
  Receipt,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Projects', href: '/projects', icon: Briefcase },
  { label: 'Revenue', href: '/revenue', icon: TrendingUp },
  { label: 'Expenses', href: '/expenses', icon: Receipt },
  { label: 'Payments', href: '/payments', icon: CreditCard },
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
];

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const basePath = process.env.NODE_ENV === 'production' ? '/crm' : '';
  const pathname = usePathname();
  const { logout } = useAuth();

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between items-center py-5">
      {/* Brand Logo */}
      <div className="flex flex-col items-center gap-2 mb-6">
        <Link
          href="/dashboard"
          className="relative group flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.06] border border-white/15 hover:border-white/30 transition-all duration-300"
          title="XYVEX CRM"
        >
          {/* Logo Mark: Stylized Abstract X / V */}
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-black/40">
            <img
              src={`${basePath}/xyvex-logo.jpeg`}
              alt="XYVEX"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to minimal monogram
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="font-black text-sm tracking-tighter text-white select-none">
              XY
            </span>
          </div>
          <span className="sr-only">XYVEX CRM</span>
        </Link>
        <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold select-none">
          XYVEX
        </span>
      </div>

      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col items-center gap-2 w-full px-2" aria-label="Main Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white/[0.12] text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.06)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/10'
              }`}
              title={item.label}
            >
              {/* Active Indicator Bar on Left */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
              <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              {/* Tooltip on Desktop hover */}
              <span className="hidden lg:group-hover:block absolute left-16 z-50 px-2.5 py-1 text-xs font-medium text-white bg-zinc-900/95 backdrop-blur-md border border-white/15 rounded-md shadow-xl whitespace-nowrap pointer-events-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-2 pt-4 border-t border-white/10 w-full px-2">
        <Link
          href="/settings"
          onClick={onCloseMobile}
          className={`relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
            pathname?.startsWith('/settings')
              ? 'bg-white/[0.12] text-white border border-white/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/10'
          }`}
          title="Settings"
        >
          {pathname?.startsWith('/settings') && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r-full" />
          )}
          <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
          <span className="hidden lg:group-hover:block absolute left-16 z-50 px-2.5 py-1 text-xs font-medium text-white bg-zinc-900/95 backdrop-blur-md border border-white/15 rounded-md shadow-xl whitespace-nowrap pointer-events-none">
            Settings
          </span>
        </Link>

        <button
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            logout();
          }}
          className="relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 border border-transparent hover:border-rose-500/20"
          title="Logout"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden lg:group-hover:block absolute left-16 z-50 px-2.5 py-1 text-xs font-medium text-rose-300 bg-zinc-900/95 backdrop-blur-md border border-rose-500/20 rounded-md shadow-xl whitespace-nowrap pointer-events-none">
            Logout
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (84px wide) */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-[84px] bg-[#08080a]/80 backdrop-blur-2xl border-r border-white/10 z-40 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative flex flex-col w-[84px] h-full bg-[#09090c] border-r border-white/15 shadow-2xl z-10 animate-fade">
            <button
              onClick={onCloseMobile}
              className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
