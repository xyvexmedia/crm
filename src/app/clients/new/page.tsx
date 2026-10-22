'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Phone,
  IndianRupee,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  Check,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { ClientStatus } from '@/types';

const SERVICES = [
  'Meta Ads Management',
  'Google Ads Management',
  'Social Media Marketing',
  'Creative Design & Video',
  'Web Development & SEO',
];

export default function NewClientPage() {
  const router = useRouter();
  const { addClient, addProject, addPayment } = useData();

  // Core Essential Fields
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('Meta Ads Management');
  const [budget, setBudget] = useState('');

  // Optional Details Toggle
  const [showMore, setShowMore] = useState(false);

  // Optional Fields
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [advancePayment, setAdvancePayment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash' | 'Card'>('UPI');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = clientName.trim();
    if (!trimmedName) {
      setError('Please enter the Client or Brand name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newClient = await addClient({
        company_name: trimmedName,
        name: contactPerson.trim() || trimmedName,
        email: email.trim(),
        phone: phone.trim(),
        whatsapp: phone.trim(),
        address: address.trim(),
        status: 'active' as ClientStatus,
        notes: notes.trim(),
      });

      const budgetNum = Number(budget) || 0;
      let newProj = null;
      if (budgetNum > 0 || service) {
        newProj = await addProject({
          client_id: newClient.id,
          name: `${service} Retainer`,
          service,
          budget: budgetNum,
          start_date: new Date().toISOString().split('T')[0],
          status: 'active',
          assigned_to: 'Salih (Lead)',
        });
      }

      const advanceNum = Number(advancePayment) || 0;
      if (advanceNum > 0) {
        await addPayment({
          client_id: newClient.id,
          project_id: newProj?.id,
          amount: advanceNum,
          payment_type: 'advance',
          payment_method: paymentMethod,
          payment_date: new Date().toISOString().split('T')[0],
          notes: 'Initial advance received upon onboarding',
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
      <div className="max-w-xl mx-auto pb-24 sm:pb-12">
        {/* Navigation Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
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
              <p className="text-xs text-zinc-400">Quick client onboarding</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 text-xs rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Card with 4 Essential Fields */}
          <div className="bg-[#141419]/90 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
            {/* 1. Client / Brand Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Client / Brand Name <span className="text-[#e11d48]">*</span>
              </label>
              <div className="relative flex items-center">
                <Building2 className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Apex Hospital, Zenith Cafe"
                  className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium placeholder:text-zinc-500"
                />
              </div>
            </div>

            {/* 2. Phone / WhatsApp Number */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Phone Number (Call & WhatsApp)
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

            {/* 3. Primary Service */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Service
              </label>
              <div className="relative flex items-center">
                <Briefcase className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="glass-input glass-input-with-icon !py-2.5 text-sm bg-[#1a1a1e] text-white appearance-none cursor-pointer"
                >
                  {SERVICES.map((s) => (
                    <option key={s} value={s} className="bg-zinc-900 text-white">
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 pointer-events-none" />
              </div>
            </div>

            {/* 4. Agreed Budget / Fee */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Monthly Retainer / Budget
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
                  className="glass-input !pl-8 !pr-4 !py-2.5 text-sm font-medium placeholder:text-zinc-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Optional Toggle for Extra Details */}
          <div className="bg-[#141419]/60 border border-white/5 rounded-2xl overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="w-full px-4 py-3 text-xs font-medium text-zinc-400 hover:text-white flex items-center justify-between transition"
            >
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-zinc-400">
                  {showMore ? '−' : '+'}
                </span>
                <span>{showMore ? 'Hide additional details' : 'Add more details (Email, Advance, Address, Notes)'}</span>
              </span>
              {showMore ? (
                <ChevronUp className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              )}
            </button>

            {showMore && (
              <div className="p-4 sm:p-5 pt-0 space-y-3.5 border-t border-white/5 text-xs animate-fade">
                {/* Contact Person */}
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Dr. Rayan, Manager"
                    className="glass-input !py-2 text-xs placeholder:text-zinc-500"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@brand.com"
                      className="glass-input !pl-9 !py-2 text-xs placeholder:text-zinc-500"
                    />
                  </div>
                </div>

                {/* Advance Amount Received */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 mb-1 font-medium">
                      Advance Amount Received (₹)
                    </label>
                    <input
                      type="number"
                      value={advancePayment}
                      onChange={(e) => setAdvancePayment(e.target.value)}
                      placeholder="e.g. 20000"
                      className="glass-input !py-2 text-xs font-mono placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 mb-1 font-medium">Payment Mode</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="glass-input !py-2 text-xs bg-[#1a1a1e] text-white"
                    >
                      <option value="UPI">UPI (GPay / PhonePe)</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                </div>

                {/* City / Address */}
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">City / Address</label>
                  <div className="relative flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Kochi, Kerala"
                      className="glass-input !pl-9 !py-2 text-xs placeholder:text-zinc-500"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-zinc-300 mb-1 font-medium">Notes & Brief</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Specific requirements or remarks..."
                    className="glass-input !py-2 text-xs resize-none placeholder:text-zinc-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
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
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'Saving...' : 'Save Client'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
