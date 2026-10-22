'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Building2,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Activity,
  User,
  Calculator,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { ClientStatus } from '@/types';
import { formatCurrency } from '@/lib/formatters';

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;
  const { clients, updateClient, getClientReport } = useData();

  const client = clients.find((c) => c.id === clientId);
  const report = getClientReport(clientId);

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [totalBudget, setTotalBudget] = useState('');
  const [billingDate, setBillingDate] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (client) {
      setCompanyName(client.company_name);
      setContactPerson(client.contact_person || '');
      setPhone(client.phone || '');
      setWhatsapp(client.whatsapp || client.phone || '');
      setEmail(client.email || '');
      setLocation(client.location || client.address || '');
      setTotalBudget(client.total_budget ? client.total_budget.toString() : '');
      setBillingDate(client.billing_date || '');
      setStatus(client.status);
      setNotes(client.notes || '');
    }
  }, [client]);

  if (!client) {
    return (
      <AppLayout>
        <div className="text-center py-20 text-zinc-400">
          Client not found.
          <Link href="/clients" className="glass-button-primary mt-4 text-xs py-2 px-4 block w-max mx-auto">
            Back to Clients
          </Link>
        </div>
      </AppLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCompany = companyName.trim();
    if (!trimmedCompany) {
      setError('Client / Company Name is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateClient(client.id, {
        company_name: trimmedCompany,
        name: trimmedCompany,
        contact_person: contactPerson.trim() || undefined,
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || undefined,
        email: email.trim(),
        location: location.trim() || undefined,
        address: location.trim() || undefined,
        total_budget: Number(totalBudget) || client.total_budget || 0,
        billing_date: billingDate || undefined,
        status,
        notes: notes.trim(),
      });
      router.push(`/clients/${client.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update client');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto pb-24 sm:pb-12 space-y-4">
        {/* Navigation Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <Link
              href={`/clients/${client.id}`}
              className="w-9 h-9 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white flex items-center justify-center transition active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Edit Client Profile
              </h1>
              <p className="text-xs text-zinc-400">{client.company_name}</p>
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
            {/* Company Name */}
            <div>
              <label className="block text-zinc-300 mb-1.5 font-semibold">
                Client / Company Name <span className="text-[#e11d48]">*</span>
              </label>
              <div className="relative flex items-center">
                <Building2 className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium"
                />
              </div>
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-zinc-300 mb-1.5 font-semibold">
                Contact Person
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Founder / Manager"
                  className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium"
                />
              </div>
            </div>

            {/* Phone & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 mb-1.5 font-semibold">Phone Number</label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98470 00000"
                    className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-300 mb-1.5 font-semibold">WhatsApp Number</label>
                <div className="relative flex items-center">
                  <MessageSquare className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+91 98470 00000"
                    className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Email & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 mb-1.5 font-semibold">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@brand.com"
                    className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-300 mb-1.5 font-semibold">Location</label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Calicut, Kerala"
                    className="glass-input glass-input-with-icon !py-2.5 text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Total Budget & Billing Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 mb-1.5 font-semibold">Total Client Budget (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="30000"
                  className="glass-input !py-2.5 text-sm font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1.5 font-semibold">Billing Date</label>
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

            {/* Status */}
            <div>
              <label className="block text-zinc-300 mb-1.5 font-semibold">Client Status</label>
              <div className="relative flex items-center">
                <Activity className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ClientStatus)}
                  className="glass-input glass-input-with-icon !py-2.5 text-sm bg-[#1a1a1e] text-white capitalize"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-zinc-300 mb-1.5 font-semibold">Notes & Remarks</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3 pointer-events-none" />
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes..."
                  className="glass-input !pl-10 !py-2.5 text-xs resize-none w-full"
                />
              </div>
            </div>

            {/* Read-only financial notice (Requirement #19) */}
            {report && (
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-zinc-400 space-y-1.5 font-mono">
                <p className="text-[10px] font-sans text-zinc-500 uppercase tracking-wider font-semibold">
                  Auto-Calculated Financials (Read-only)
                </p>
                <div className="flex justify-between">
                  <span className="font-sans">Total Paid:</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(report.amountReceived)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">Pending Balance:</span>
                  <span className="text-amber-400 font-bold">{formatCurrency(report.pendingAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans">Client Profit:</span>
                  <span className="text-white font-bold">{formatCurrency(report.clientProfit)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link
              href={`/clients/${client.id}`}
              className="w-1/3 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs font-semibold text-center transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-[#991b1b] via-[#881337] to-[#e11d48] hover:brightness-110 active:scale-[0.98] text-white text-xs font-bold shadow-[0_4px_20px_rgba(225,29,72,0.35)] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
