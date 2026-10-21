'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Check,
  ExternalLink,
  User,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useData } from '@/context/data-context';
import { formatDate } from '@/lib/formatters';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  onOpenSearch: () => void;
}

const navTabs = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Clients', href: '/clients' },
  { label: 'Projects', href: '/projects' },
  { label: 'Revenue', href: '/revenue' },
  { label: 'Expenses', href: '/expenses' },
  { label: 'Payments', href: '/payments' },
  { label: 'Invoices', href: '/invoices' },
  { label: 'Reports', href: '/reports' },
];

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.name || 'Salih';

  return (
    <header className="w-full bg-[#08080a] py-4 px-4 sm:px-6 md:px-8 border-b border-white/[0.04]">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Neon Star Brand Button & Pill Navigation */}
        <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar py-1">
          {/* Circular Wine/Crimson Brand Button (matching screenshot) */}
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-full bg-[#5c081e] hover:bg-[#720a26] border border-[#be123c]/40 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-[0_0_15px_rgba(225,29,72,0.3)] transition-transform hover:scale-105"
            title="XYVEX Dashboard"
          >
            ✱
          </Link>

          {/* Pill Capsule Navigation Row */}
          <nav className="flex items-center gap-1.5" aria-label="Main Capsule Navigation">
            {navTabs.map((tab) => {
              const isActive =
                pathname === tab.href ||
                (tab.href !== '/dashboard' && pathname?.startsWith(tab.href));

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`pill-tab ${
                    isActive ? 'pill-tab-active' : 'pill-tab-inactive'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Search Capsule, Circular White Notification, Circular Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Supabase Connected Indicator */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-medium shadow-sm transition hover:bg-emerald-500/15"
            title="Supabase PostgreSQL Database Connected"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-sans font-semibold hidden sm:inline">സൂപ്പർബേസ് കണക്റ്റഡ്</span>
            <span className="text-[10px] font-sans font-semibold sm:hidden">Connected</span>
          </div>

          {/* Circular/Pill Search with Cmd+K */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#17171a] hover:bg-[#222226] border border-white/5 text-zinc-400 hover:text-white text-xs transition duration-150"
            aria-label="Search"
          >
            <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center">
              <Search className="w-3 h-3 text-black stroke-[2.5]" />
            </div>
            <span className="hidden sm:inline text-zinc-300 font-medium">Search payment</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10 text-zinc-400">
              ⌘K
            </kbd>
          </button>

          {/* Circular Notification Bell (White button in image) */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-10 h-10 rounded-full bg-white text-black hover:bg-zinc-100 flex items-center justify-center shadow-sm transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-black" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e11d48] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e11d48]"></span>
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#161619] border border-white/10 rounded-2xl shadow-2xl z-50 p-3 animate-fade">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] bg-[#e11d48]/20 text-[#fb7185] rounded-full font-mono font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-zinc-400 hover:text-white transition flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">No notifications</p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          notif.is_read
                            ? 'bg-white/[0.02] border-white/5 opacity-70 hover:opacity-100'
                            : 'bg-white/[0.06] border-white/15'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-medium text-white">{notif.title}</p>
                          <span className="text-[10px] text-zinc-500 shrink-0">
                            {formatDate(notif.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{notif.message}</p>
                        {notif.link && (
                          <Link
                            href={notif.link}
                            onClick={() => setNotificationsOpen(false)}
                            className="inline-flex items-center gap-1 text-[11px] text-[#fb7185] hover:underline mt-1.5 font-medium"
                          >
                            <span>View details</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Circular User Avatar with Crimson/Wine Ring */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-[#e11d48] via-[#be123c] to-white/40 flex items-center justify-center transition-transform hover:scale-105"
              aria-label="User profile"
            >
              <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center">
                <img
                  src={user?.avatar || '/xyvex-logo.jpeg'}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <User className="w-4 h-4 text-zinc-300" />
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-[#161619] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 animate-fade text-xs">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="font-semibold text-white">{displayName}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{user?.email || 'salih@xyvex.agency'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-[#e11d48]/15 text-[#fb7185] font-bold">
                    Super Admin
                  </span>
                </div>

                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.08] transition"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings & Agency</span>
                </Link>

                <div className="border-t border-white/10 my-1 pt-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
