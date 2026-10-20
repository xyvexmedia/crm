'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
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
  const [whatsapp, setWhatsapp] = useState('');
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
      setPhone(client.phone || '');
      setWhatsapp(client.whatsapp || '');
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
    if (!companyName.trim() || !name.trim()) {
      setError('Company Name and Contact Person are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateClient(client.id, {
        company_name: companyName.trim(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
          <Link
            href={`/clients/${client.id}`}
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Edit Client</h1>
            <p className="text-xs text-zinc-400">Update corporate profile and billing cycle</p>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Company Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="glass-input"
              />
            </div>
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Contact Person *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input"
              />
            </div>
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="glass-input"
              />
            </div>
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input"
              />
            </div>
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="glass-input"
              />
            </div>
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ClientStatus)}
                className="glass-input bg-zinc-900"
              >
                <option value="active">Active</option>
                <option value="lead">Lead</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-zinc-300 mb-1 font-medium">Next Billing Date</label>
              <input
                type="date"
                value={billingDate}
                onChange={(e) => setBillingDate(e.target.value)}
                className="glass-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-zinc-300 mb-1 font-medium">Office Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="glass-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-zinc-300 mb-1 font-medium">Internal Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="glass-input resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Link href={`/clients/${client.id}`} className="glass-button-secondary py-2 px-4">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary py-2 px-5"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
