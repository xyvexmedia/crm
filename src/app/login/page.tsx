'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const basePath = process.env.NODE_ENV === 'production' ? '/crm' : '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoFailed, setLogoFailed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your work email');
      return;
    }

    setLoading(true);
    setError('');

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setError('');
    const res = await login('salih@xyvex.agency', 'demo-salih-123');
    if (!res.success) {
      setError(res.error || 'Failed to authenticate');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#070709] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] bg-[#e11d48]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[300px] h-[300px] bg-[#5c081e]/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-sm sm:max-w-md bg-[#131317]/90 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-3xl animate-fade">
        {/* XYVEX Branding */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-16 h-16 rounded-2xl bg-black/60 border border-white/15 p-2 shadow-inner flex items-center justify-center mb-3.5 overflow-hidden">
            {!logoFailed ? (
              <img
                src={`${basePath}/xyvex-logo.jpeg`}
                alt="XYVEX"
                className="w-full h-full object-cover rounded-xl"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#e11d48] to-[#881337] flex items-center justify-center font-black text-lg text-white">
                XY
              </div>
            )}
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white">
            XYVEX CRM
          </h1>
          <p className="text-[11px] text-zinc-400 mt-1 max-w-xs leading-relaxed">
            Client Management • Finance • Payments • Expenses • Profit
          </p>
        </div>

        {error && (
          <div className="p-3 mb-5 text-xs rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 mb-1.5 font-medium">Work Email</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none z-10" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="salih@xyvex.agency"
                className="glass-input glass-input-with-icon !py-3 text-sm placeholder:text-zinc-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-zinc-300 font-medium">Password</label>
              <Link
                href="/forgot-password"
                className="text-zinc-500 hover:text-zinc-300 text-[11px] transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none z-10" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="glass-input glass-input-with-icon !py-3 text-sm placeholder:text-zinc-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#e11d48] to-[#be123c] hover:brightness-110 active:scale-[0.98] text-white font-semibold py-3 px-4 rounded-xl shadow-[0_4px_20px_rgba(225,29,72,0.35)] transition-all flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
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
            className="w-full bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.98] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white rounded-xl py-2.5 px-4 text-xs font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Launch Dashboard as Salih (Admin)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
