'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Briefcase,
  Wallet,
  Receipt,
  BarChart3,
  Menu,
  X,
  FileText,
  TrendingUp,
  Settings,
  Plus,
  UserPlus,
  CreditCard,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenAddClient?: () => void;
  onOpenAddPayment?: () => void;
  onOpenAddExpense?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenAddClient,
  onOpenAddPayment,
  onOpenAddExpense,
}) => {
  const pathname = usePathname();
  const [moreDrawerOpen, setMoreDrawerOpen] = useState(false);

  // Determine dynamic 4th tab based on active route (matches screenshot design)
  const isExpenses = pathname?.startsWith('/expenses');
  const isReports = pathname?.startsWith('/reports');

  let fourthTab = {
    label: 'Payments',
    href: '/payments',
    icon: Wallet,
    isActive: pathname?.startsWith('/payments'),
  };

  if (isExpenses) {
    fourthTab = {
      label: 'Expenses',
      href: '/expenses',
      icon: Receipt,
      isActive: true,
    };
  } else if (isReports) {
    fourthTab = {
      label: 'Reports',
      href: '/reports',
      icon: BarChart3,
      isActive: true,
    };
  }

  const navItems = [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: Home,
      isActive: pathname === '/dashboard' || pathname === '/',
    },
    {
      label: 'Clients',
      href: '/clients',
      icon: Users,
      isActive: pathname?.startsWith('/clients'),
    },
    {
      label: 'Projects',
      href: '/projects',
      icon: Briefcase,
      isActive: pathname?.startsWith('/projects'),
    },
    fourthTab,
  ];

  const isMoreActive =
    moreDrawerOpen ||
    pathname?.startsWith('/invoices') ||
    pathname?.startsWith('/revenue') ||
    pathname?.startsWith('/settings');

  return (
    <>
      {/* Fixed Bottom Nav Bar (Mobile Only: sm:hidden) */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0d12]/95 backdrop-blur-xl border-t border-white/[0.08] px-3 py-1.5 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.5)]"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMoreDrawerOpen(false)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white shadow-md shadow-rose-950/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    active ? 'stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
                <span
                  className={`text-[10px] mt-0.5 font-medium tracking-tight ${
                    active ? 'font-bold text-white' : 'text-zinc-400'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More / Menu Button */}
          <button
            onClick={() => setMoreDrawerOpen(!moreDrawerOpen)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 ${
              isMoreActive
                ? 'bg-gradient-to-r from-[#991b1b] to-[#e11d48] text-white shadow-md shadow-rose-950/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            aria-label="More navigation options"
          >
            {moreDrawerOpen ? (
              <X className="w-5 h-5 stroke-[2.5] text-white" />
            ) : (
              <Menu
                className={`w-5 h-5 transition-transform duration-200 ${
                  isMoreActive ? 'stroke-[2.5]' : 'stroke-[1.8]'
                }`}
              />
            )}
            <span
              className={`text-[10px] mt-0.5 font-medium tracking-tight ${
                isMoreActive ? 'font-bold text-white' : 'text-zinc-400'
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* "More" Slide-up Bottom Drawer for Mobile */}
      {moreDrawerOpen && (
        <div className="sm:hidden fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex flex-col justify-end animate-fade">
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={() => setMoreDrawerOpen(false)} />

          <div className="bg-[#121217] border-t border-white/10 rounded-t-3xl p-5 pb-24 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">XYVEX Modules</h3>
                <p className="text-[11px] text-zinc-400">Quick access to all agency tools</p>
              </div>
              <button
                onClick={() => setMoreDrawerOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of all CRM Modules (matching image bottom legend) */}
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/revenue"
                onClick={() => setMoreDrawerOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition"
              >
                <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Revenue</span>
                  <span className="text-[10px] text-zinc-400 block">Income & profits</span>
                </div>
              </Link>

              <Link
                href="/expenses"
                onClick={() => setMoreDrawerOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Expenses</span>
                  <span className="text-[10px] text-zinc-400 block">Spend tracking</span>
                </div>
              </Link>

              <Link
                href="/invoices"
                onClick={() => setMoreDrawerOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition"
              >
                <div className="w-9 h-9 rounded-xl bg-yellow-500/15 text-yellow-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Invoices</span>
                  <span className="text-[10px] text-zinc-400 block">Create & manage</span>
                </div>
              </Link>

              <Link
                href="/reports"
                onClick={() => setMoreDrawerOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition"
              >
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Reports</span>
                  <span className="text-[10px] text-zinc-400 block">Detailed analytics</span>
                </div>
              </Link>

              <Link
                href="/settings"
                onClick={() => setMoreDrawerOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition col-span-2"
              >
                <div className="w-9 h-9 rounded-xl bg-zinc-500/15 text-zinc-300 flex items-center justify-center shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Settings</span>
                  <span className="text-[10px] text-zinc-400 block">Company profile & Supabase cloud</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
