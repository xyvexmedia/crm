'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    await resetPassword(email);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative">
      <div className="relative w-full max-w-md glass-panel bg-[#09090c]/90 border border-white/15 p-8 shadow-2xl rounded-2xl animate-fade">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to sign in</span>
        </Link>

        <h1 className="text-xl font-bold text-white mb-1">Reset Password</h1>
        <p className="text-xs text-zinc-400 mb-6">
          Enter your registered email address to receive password reset instructions.
        </p>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white">Reset link sent!</h3>
            <p className="text-xs text-zinc-400 mt-1">
              If an account exists for {email}, a recovery email has been dispatched.
            </p>
            <Link
              href="/login"
              className="inline-block mt-4 glass-button-primary py-2 px-4 text-xs"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Email Address</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full glass-button-primary py-2.5 justify-center"
            >
              {loading ? 'Sending...' : 'Send Recovery Instructions'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
