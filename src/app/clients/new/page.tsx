'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Activity,
  Briefcase,
  IndianRupee,
  Calendar,
  Plus,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { ClientStatus } from '@/types';

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

export default function NewClientPage() {
  const router = useRouter();
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

      router.push(`/clients/${newClient.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save client');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto pb-28 sm:pb-12">
        {/* Navigation Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <Link
              href="/clients"
              className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white flex items-center justify-center transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Add New Client
              </h1>
              <p className="text-xs text-zinc-400">Setup client profile, scope & finances</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 text-xs rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300">
            {error}
          </div>
        )}

        {/* 8 Clean Fields Card */}
        <form onSubmit={handleSubmit} className="bg-[#141419]/90 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 text-xs">
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

          {/* Action Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <Link
              href="/clients"
              className="w-1/3 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs font-semibold text-center transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#be123c] hover:brightness-110 active:scale-[0.98] text-white text-xs font-bold shadow-[0_4px_20px_rgba(225,29,72,0.35)] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'Adding...' : 'Add Client'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
