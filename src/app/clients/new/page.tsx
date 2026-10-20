'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { ClientStatus } from '@/types';

export default function NewClientPage() {
  const router = useRouter();
  const { addClient, addProject, addPayment } = useData();

  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [billingDate, setBillingDate] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [notes, setNotes] = useState('');

  const [service, setService] = useState('Meta Ads Management');
  const [projectName, setProjectName] = useState('');
  const [budget, setBudget] = useState('');
  const [advancePayment, setAdvancePayment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash' | 'Card'>('UPI');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !name.trim()) {
      setError('Company Name and Contact Name are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newClient = await addClient({
        company_name: companyName.trim(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        address: address.trim(),
        billing_date: billingDate || undefined,
        status,
        notes: notes.trim(),
      });

      const budgetNum = Number(budget) || 0;
      let newProj = null;
      if (projectName.trim() || budgetNum > 0) {
        newProj = await addProject({
          client_id: newClient.id,
          name: projectName.trim() || `${service} Retainer`,
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
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
          <Link
            href="/clients"
            className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Create New Client</h1>
            <p className="text-xs text-zinc-400">Onboard client and set initial scope & budget</p>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-panel p-6 space-y-5 text-xs">
          <h2 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            1. Client Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Company Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Hospital & Fertility"
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
                placeholder="e.g. Dr. Rayan"
                className="glass-input"
              />
            </div>
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98470 00000"
                className="glass-input"
              />
            </div>
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@apex.com"
                className="glass-input"
              />
            </div>
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+91 98470 00000"
                className="glass-input"
              />
            </div>
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Client Status</label>
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
              <label className="block text-zinc-300 mb-1 font-medium">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calicut, Kerala"
                className="glass-input"
              />
            </div>
          </div>

          <h2 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold pt-4 border-t border-white/10">
            2. Initial Project Agreement
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Service</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="glass-input bg-zinc-900"
              >
                <option value="Meta Ads Management">Meta Ads Management</option>
                <option value="Google Ads Management">Google Ads Management</option>
                <option value="Social Media Management">Social Media Management</option>
                <option value="Creative Design & Video">Creative Design & Video</option>
                <option value="SEO & Web Development">SEO & Web Development</option>
              </select>
            </div>
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Q4 Growth Sprint"
                className="glass-input"
              />
            </div>
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Agreed Budget (₹)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 50000"
                className="glass-input font-mono"
              />
            </div>
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Advance Amount Received (₹)</label>
              <input
                type="number"
                value={advancePayment}
                onChange={(e) => setAdvancePayment(e.target.value)}
                placeholder="e.g. 25000"
                className="glass-input font-mono"
              />
            </div>
            {Number(advancePayment) > 0 && (
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="glass-input bg-zinc-900"
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-zinc-300 mb-1 font-medium">Next Billing Date</label>
              <input
                type="date"
                value={billingDate}
                onChange={(e) => setBillingDate(e.target.value)}
                className="glass-input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-zinc-300 mb-1 font-medium">Notes & Brief</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key deliverables, goals, contract terms..."
                className="glass-input resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Link href="/clients" className="glass-button-secondary py-2 px-4">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary py-2 px-5"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Client'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
