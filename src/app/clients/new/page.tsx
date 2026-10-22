'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Calendar,
  Activity,
  Briefcase,
  Plus,
  FileText,
  Calculator,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { ClientStatus } from '@/types';
import { formatCurrency } from '@/lib/formatters';

const SERVICES = [
  'Meta Ads',
  'Google Ads',
  'SEO',
  'Social Media',
  'Website',
  'Poster Design',
  'Video Production',
  'Design',
  'CRM',
  'Other',
];

export default function NewClientPage() {
  const router = useRouter();
  const { addClient, addProject, addPayment } = useData();

  // Client Information
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');

  // Financial Information
  const [budget, setBudget] = useState('');
  const [advancePayment, setAdvancePayment] = useState('');

  // Scope & Billing
  const [service, setService] = useState('Google Ads');
  const [billingDate, setBillingDate] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const budgetNum = Number(budget) || 0;
  const advanceNum = Number(advancePayment) || 0;
  const pendingAmount = Math.max(0, budgetNum - advanceNum);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCompany = companyName.trim();
    if (!trimmedCompany) {
      setError('Company / Client Name is required.');
      return;
    }
    if (budgetNum <= 0) {
      setError('Total Client Budget (₹) is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Client
      const newClient = await addClient({
        company_name: trimmedCompany,
        name: trimmedCompany,
        contact_person: contactPerson.trim() || undefined,
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim() || undefined,
        email: email.trim(),
        location: location.trim() || undefined,
        address: location.trim() || undefined,
        status,
        total_budget: budgetNum,
        billing_date: billingDate || undefined,
        notes: notes.trim() || undefined,
      });

      // 2. Create Initial Project
      let newProj = null;
      if (budgetNum > 0 || service) {
        newProj = await addProject({
          client_id: newClient.id,
          name: `${trimmedCompany} - ${service}`,
          service,
          budget: budgetNum,
          start_date: new Date().toISOString().split('T')[0],
          end_date: billingDate || undefined,
          status: status === 'completed' ? 'completed' : 'active',
          assigned_to: 'Salih (Lead)',
        });
      }

      // 3. Record Advance Payment if specified
      if (advanceNum > 0) {
        await addPayment({
          client_id: newClient.id,
          project_id: newProj?.id,
          amount: advanceNum,
          payment_type: 'advance',
          payment_method: 'UPI',
          payment_date: new Date().toISOString().split('T')[0],
          reference: 'Initial Setup Advance',
          notes: 'Advance payment on client setup',
        });
      }

      router.push(`/clients/${newClient.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create client');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto pb-28 sm:pb-12 space-y-4">
        {/* Navigation Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
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
          <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#141419] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 text-xs">
            {/* Section 1: Client Information */}
            <div className="space-y-3">
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Client Information
              </h3>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">
                  Company / Client Name <span className="text-[#e11d48]">*</span>
                </label>
                <div className="relative flex items-center">
                  <Building2 className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. ABC Company, Zenith Cafe"
                    className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">
                  Contact Person
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. John Doe (Founder / Marketing Head)"
                    className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium placeholder:text-zinc-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Phone Number</label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98470 12345"
                      className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium placeholder:text-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">WhatsApp Number</label>
                  <div className="relative flex items-center">
                    <MessageSquare className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+91 98470 12345"
                      className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium placeholder:text-zinc-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Email</label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@company.com"
                      className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium placeholder:text-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Location</label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Dubai, Calicut, Kochi"
                      className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium placeholder:text-zinc-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Financial Information */}
            <div className="space-y-3 pt-3 border-t border-white/[0.06]">
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Financial Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">
                    Total Client Budget ₹ <span className="text-[#e11d48]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="text-zinc-400 font-bold absolute left-3.5 text-sm pointer-events-none">₹</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="30000"
                      className="glass-input !pl-8 !pr-3 !py-2.5 text-sm font-semibold font-mono text-white placeholder:text-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Advance Payment ₹</label>
                  <div className="relative flex items-center">
                    <span className="text-zinc-400 font-bold absolute left-3.5 text-sm pointer-events-none">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={advancePayment}
                      onChange={(e) => setAdvancePayment(e.target.value)}
                      placeholder="10000"
                      className="glass-input !pl-8 !pr-3 !py-2.5 text-sm font-semibold font-mono text-emerald-400 placeholder:text-zinc-500"
                    />
                  </div>
                </div>
              </div>

              {/* Automatic Calculation Banner */}
              <div className="bg-[#18181f] border border-white/[0.08] rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-zinc-400" />
                  <div>
                    <span className="text-[11px] text-zinc-400 block">Auto-Calculated Pending Amount:</span>
                    <span className="text-xs font-mono font-bold text-amber-400">{formatCurrency(pendingAmount)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block">Payment Progress</span>
                  <span className="text-xs font-mono font-bold text-white">
                    {budgetNum > 0 ? `${Math.min(100, Math.round((advanceNum / budgetNum) * 100))}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Scope & Billing */}
            <div className="space-y-3 pt-3 border-t border-white/[0.06]">
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Scope & Billing
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Service</label>
                  <div className="relative flex items-center">
                    <Briefcase className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="glass-input glass-input-with-icon !py-2.5 text-xs bg-[#1a1a1e] text-white cursor-pointer"
                    >
                      {SERVICES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Status</label>
                  <div className="relative flex items-center">
                    <Activity className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ClientStatus)}
                      className="glass-input glass-input-with-icon !py-2.5 text-xs bg-[#1a1a1e] text-white cursor-pointer capitalize"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 mb-1 font-semibold">Billing Date</label>
                  <div className="relative flex items-center">
                    <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type="date"
                      value={billingDate}
                      onChange={(e) => setBillingDate(e.target.value)}
                      className="glass-input glass-input-with-icon !py-2.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-semibold">Notes</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 pointer-events-none" />
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Campaign goals, payment schedules, special terms..."
                    className="glass-input !pl-10 !py-2.5 text-xs text-white placeholder:text-zinc-500 w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/clients"
              className="w-1/3 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs font-semibold text-center transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-[#991b1b] via-[#881337] to-[#e11d48] hover:brightness-110 active:scale-[0.98] text-white text-xs font-bold shadow-[0_4px_20px_rgba(225,29,72,0.35)] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'Creating...' : 'Create Client'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
