'use client';

import React, { useState, useEffect } from 'react';
import { X, CreditCard, ArrowDownLeft } from 'lucide-react';
import { useData } from '@/context/data-context';
import { PaymentType, PaymentMethod } from '@/types';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClientId?: string;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  defaultClientId,
}) => {
  const { clients, projects, addPayment } = useData();

  const [clientId, setClientId] = useState(defaultClientId || (clients[0]?.id || ''));
  const [projectId, setProjectId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('partial');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const clientProjects = projects.filter((p) => p.client_id === clientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!clientId) {
      setError('Please select a client');
      return;
    }
    if (!amountNum || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addPayment({
        client_id: clientId,
        project_id: projectId || undefined,
        amount: amountNum,
        payment_type: paymentType,
        payment_method: paymentMethod,
        payment_date: paymentDate,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#111116] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[88dvh] sm:max-h-[85vh] flex flex-col min-h-0 overflow-hidden animate-fade">
        <div className="px-5 pt-4 pb-3 border-b border-white/[0.08] shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Record Client Payment
              </h2>
              <p className="text-[11px] text-zinc-400">
                Log realized revenue received from client
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-3 p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 shrink-0">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 space-y-3.5 text-xs touch-pan-y"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
          <div>
            <label className="block text-zinc-300 mb-1 font-medium">Select Client *</label>
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setProjectId('');
              }}
              required
              className="glass-input bg-zinc-900"
            >
              <option value="" disabled>Choose client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company_name} ({c.name})
                </option>
              ))}
            </select>
          </div>

          {clientProjects.length > 0 && (
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Link to Project (Optional)</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="glass-input bg-zinc-900"
              >
                <option value="">No specific project (General Client Retainer)</option>
                {clientProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Budget: ₹{p.budget.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Amount Received (₹) *</label>
              <input
                type="number"
                min="1"
                step="100"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 15000"
                className="glass-input font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Payment Date *</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                className="glass-input bg-zinc-900"
              >
                <option value="advance">Advance</option>
                <option value="partial">Partial</option>
                <option value="final">Final Settlement</option>
                <option value="full">Full Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="glass-input bg-zinc-900"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                <option value="Cash">Cash</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 mb-1 font-medium">Transaction Reference / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="UPI Ref ID, invoice milestone, check number..."
              className="glass-input"
            />
          </div>
        </div>

        <div className="px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-[#141419] shrink-0 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white text-xs font-semibold transition active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:brightness-110 active:scale-95 text-white text-xs font-bold shadow-[0_4px_20px_rgba(16,185,129,0.35)] transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>{loading ? 'Recording...' : 'Record Payment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
