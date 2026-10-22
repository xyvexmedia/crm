'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Activity,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { ClientStatus } from '@/types';

export default function EditClientPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;
  const { clients, updateClient } = useData();

  const client = clients.find((c) => c.id === clientId);

  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [billingDate, setBillingDate] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (client) {
      setCompanyName(client.company_name);
      setName(client.name);
      setEmail(client.email || '');
      setPhone(client.phone || client.whatsapp || '');
      setAddress(client.address || '');
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
        name: name.trim() || trimmedCompany,
        email: email.trim(),
        phone: phone.trim(),
        whatsapp: phone.trim(),
        address: address.trim(),
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
                Edit Client
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
          <div className="bg-[#141419]/90 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 text-xs">
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

            {/* Phone Number */}
            <div>
              <label className="block text-zinc-300 mb-1.5 font-semibold">
                Phone Number (Call & WhatsApp)
              </label>
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

            {/* Status */}
            <div>
              <label className="block text-zinc-300 mb-1.5 font-semibold">Status</label>
              <div className="relative flex items-center">
                <Activity className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ClientStatus)}
                  className="glass-input glass-input-with-icon !py-2.5 text-sm bg-[#1a1a1e] text-white"
                >
                  <option value="active">Active</option>
                  <option value="lead">Lead</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Contact Person (Optional) */}
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Contact Person</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Manager / Owner name"
                className="glass-input !py-2 text-xs"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@brand.com"
                  className="glass-input !pl-9 !py-2 text-xs"
                />
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
                  placeholder="Kochi, Kerala"
                  className="glass-input !pl-9 !py-2 text-xs"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Notes & Remarks</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes..."
                className="glass-input !py-2 text-xs resize-none"
              />
            </div>
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
              className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#be123c] hover:brightness-110 active:scale-[0.98] text-white text-xs font-bold shadow-[0_4px_20px_rgba(225,29,72,0.35)] transition flex items-center justify-center gap-2 disabled:opacity-50"
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
