'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Sparkles,
  Building2,
  Phone,
  Mail,
  Activity,
  Briefcase,
  IndianRupee,
  Calendar,
} from 'lucide-react';
import { useData } from '@/context/data-context';
import { ClientStatus } from '@/types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (clientId: string) => void;
}

const SERVICES = [
  'Meta Ads',
  'Google Ads',
  'SEO',
  'Social Media',
  'Design',
  'CRM',
  'Website',
  'Other',
];

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addClient, addProject, addPayment } = useData();

  // The 8 Exact Fields
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [service, setService] = useState('Meta Ads');
  const [budget, setBudget] = useState('');
  const [advancePayment, setAdvancePayment] = useState('');
  const [billingDate, setBillingDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lock mobile body scroll completely while modal is open so background never scrolls
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCompany = companyName.trim();
    if (!trimmedCompany) {
      setError('Company / Brand Name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Client
      const newClient = await addClient({
        company_name: trimmedCompany,
        name: trimmedCompany,
        phone: phone.trim(),
        email: email.trim(),
        whatsapp: phone.trim(),
        status,
        billing_date: billingDate || undefined,
      });

      // 2. Create Initial Project with Service and Budget
      const budgetNum = Number(budget) || 0;
      let newProj = null;
      if (budgetNum > 0 || service) {
        newProj = await addProject({
          client_id: newClient.id,
          name: `${trimmedCompany} - ${service}`,
          service,
          budget: budgetNum,
          start_date: new Date().toISOString().split('T')[0],
          status: status === 'completed' ? 'completed' : 'active',
          assigned_to: 'Salih (Lead)',
        });
      }

      // 3. Record Advance Payment if specified
      const advanceNum = Number(advancePayment) || 0;
      if (advanceNum > 0) {
        await addPayment({
          client_id: newClient.id,
          project_id: newProj?.id,
          amount: advanceNum,
          payment_type: 'advance',
          payment_method: 'UPI',
          payment_date: new Date().toISOString().split('T')[0],
          notes: 'Advance payment on client setup',
        });
      }

      // Reset form
      setCompanyName('');
      setPhone('');
      setEmail('');
      setStatus('active');
      setService('Meta Ads');
      setBudget('');
      setAdvancePayment('');
      setBillingDate('');

      onClose();
      if (onSuccess) onSuccess(newClient.id);
    } catch (err: any) {
      setError(err.message || 'Failed to save client');
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
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#111116] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl h-[82dvh] sm:h-auto sm:max-h-[85vh] flex flex-col min-h-0 overflow-hidden animate-fade">
        {/* Fixed Modal Header */}
        <div className="px-5 pt-4 pb-3 border-b border-white/[0.08] shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e11d48]/15 border border-[#e11d48]/30 flex items-center justify-center text-[#e11d48]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Add New Client
              </h2>
              <p className="text-[11px] text-zinc-400">
                Setup client profile, scope & finances
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

        {/* Form with Flex Layout: Scrollable body + Fixed sticky footer */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Scrollable Form Body */}
          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4 space-y-3.5 text-xs touch-pan-y"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              touchAction: 'pan-y',
            }}
            onTouchMove={(e) => {
              e.stopPropagation();
            }}
          >
            {/* 1. Company / Brand Name* */}
            <div>
              <label className="block text-zinc-300 mb-1.5 font-semibold">
                Company / Brand Name <span className="text-[#e11d48]">*</span>
              </label>
              <div className="relative flex items-center">
                <Building2 className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Healthcare, Zenith Cafe"
                  className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium placeholder:text-zinc-500"
                />
              </div>
            </div>

            {/* 2. Phone Number & 3. Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 mb-1.5 font-semibold">
                  Phone Number
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98470 00000"
                    className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1.5 font-semibold">
                  Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@brand.com"
                    className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium placeholder:text-zinc-500"
                  />
                </div>
              </div>
            </div>

            {/* 4. Status & 5. Service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 mb-1.5 font-semibold">
                  Status
                </label>
                <div className="relative flex items-center">
                  <Activity className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ClientStatus)}
                    className="glass-input glass-input-with-icon !py-2.5 text-sm bg-[#1a1a1e] text-white cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1.5 font-semibold">
                  Service
                </label>
                <div className="relative flex items-center">
                  <Briefcase className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="glass-input glass-input-with-icon !py-2.5 text-sm bg-[#1a1a1e] text-white cursor-pointer"
                  >
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 6. Total Budget (₹) & 7. Advance Payment (₹) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 mb-1.5 font-semibold">
                  Total Budget (₹)
                </label>
                <div className="relative flex items-center">
                  <span className="text-zinc-400 font-bold absolute left-3.5 text-sm pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 45000"
                    className="glass-input !pl-8 !pr-3 !py-2.5 text-sm font-medium font-mono placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1.5 font-semibold">
                  Advance Payment (₹)
                </label>
                <div className="relative flex items-center">
                  <span className="text-zinc-400 font-bold absolute left-3.5 text-sm pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(e.target.value)}
                    placeholder="e.g. 20000"
                    className="glass-input !pl-8 !pr-3 !py-2.5 text-sm font-medium font-mono placeholder:text-zinc-500"
                  />
                </div>
              </div>
            </div>

            {/* 8. Billing / Due Date */}
            <div>
              <label className="block text-zinc-300 mb-1.5 font-semibold">
                Billing / Due Date
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="date"
                  value={billingDate}
                  onChange={(e) => setBillingDate(e.target.value)}
                  className="glass-input glass-input-with-icon !py-2.5 text-sm text-white"
                />
              </div>
            </div>
          </div>

          {/* Fixed Footer: Always visible at bottom, never cut off */}
          <div className="px-5 py-3.5 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-[#141419] shrink-0 flex items-center justify-end gap-3">
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
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#be123c] hover:brightness-110 active:scale-95 text-white text-xs font-bold shadow-[0_4px_20px_rgba(225,29,72,0.35)] transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'Adding...' : 'Add Client'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
