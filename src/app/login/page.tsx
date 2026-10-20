'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('salih@xyvex.agency');
  const [password, setPassword] = useState('••••••••');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your email');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    await login('salih@xyvex.agency', 'demo-salih-123');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md glass-panel bg-[#09090c]/90 border border-white/15 p-8 shadow-2xl rounded-2xl animate-fade">
        {/* XYVEX Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.08] border border-white/20 p-2 shadow-inner flex items-center justify-center mb-3">
            <img
              src="/xyvex-logo.jpeg"
              alt="XYVEX"
              className="w-full h-full object-cover rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="font-black text-xl tracking-tighter text-white">XY</span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            <span>XYVEX CRM</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs">
            Client Management • Finance • Payments • Expenses • Profit
          </p>
        </div>

        {error && (
          <div className="p-3 mb-5 text-xs rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 mb-1 font-medium">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="salih@xyvex.agency"
                className="glass-input pl-9"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-zinc-300 font-medium">Password</label>
              <Link
                href="/forgot-password"
                className="text-zinc-500 hover:text-zinc-300 text-[11px] transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="glass-input pl-9"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full glass-button-primary py-2.5 mt-2 justify-center"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-[11px] text-zinc-500 mb-2.5">
            Quick demo access with pre-configured Salih account:
          </p>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full glass-button-secondary py-2 justify-center text-xs"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Launch Dashboard as Salih (Admin)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
